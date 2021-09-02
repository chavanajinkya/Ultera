import store from "../store";
import {setLoading} from "../slices/workSearchSlice";
import {get, put, post, deleteAPI} from "./common";
import {setError, setLoginState, setOnRetry} from "../slices/dashboardSlice";
import {
    setDialogLoading, setStatsLoading,
    updateAdaptorsStatisticsList,
    updateEnvConfigAdaptorsList,
    updateEnvConfigEnList
} from "../slices/envConfigSlice";
import _ from "lodash";
import i18n from '../i18n';
import {setPopupLoading} from "../slices/envManagementSlice";

const dispatch = store.dispatch;

export const getEnvConfigEnvList =async () => {
    dispatch(setLoading(true));
    try {
        let response = await get(`/UlteraAdmin/service/v83/admin/context/ipd.admin.envconfig.envlist.loadContext`,{
            'content-type': 'application/x-www-form-urlencoded'
        });
        if (response.status === 200) {
            let actualResponse = JSON.parse(response?.data?.contextModel?.listItems);
            dispatch(updateEnvConfigEnList(actualResponse.items));
        }
        dispatch(setLoading(false))
    }catch (e){
        dispatch(updateEnvConfigEnList([]));
        dispatch(setLoading(false));
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getEnvConfigEnvList()));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}));
            throw e;
        }
    }
};

export const getEnvConfigAdaptorsList =async () => {
    dispatch(setLoading(true));
    try {
        let response = await get(`/UlteraAdmin/service/v83/admin/context/ipd.admin.envconfig.adaptors.loadContext`,{
            'content-type': 'application/x-www-form-urlencoded'
        });
        if (response.status === 200) {
            let actualResponse = JSON.parse(response?.data?.contextModel?.listItems);
            let newResponse = actualResponse?.items;

            let clonedResponse = JSON.stringify(newResponse);
            clonedResponse = JSON.parse(clonedResponse);
            const updatedResponse = _.map(clonedResponse, (resObj, index)=>{
                resObj.enabled = resObj.enabled === false ? i18n.t('com.ipd.common.boolean.false') : i18n.t('com.ipd.common.boolean.true');
                return resObj
            });

            dispatch(updateEnvConfigAdaptorsList(updatedResponse));
        }
        dispatch(setLoading(false))
    }catch (e){
        dispatch(updateEnvConfigAdaptorsList([]));
        dispatch(setLoading(false));
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getEnvConfigAdaptorsList()));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}));
            throw e;
        }
    }
};

export const adaptorEnablement = (selectedConfigTableRow, enable) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setDialogLoading(true));
        let formData = new FormData();
        if(!Array.isArray(selectedConfigTableRow)) {
            formData.append("ids", selectedConfigTableRow.id);
        }else{
            _.map(selectedConfigTableRow, (rowObj)=>{
                formData.append("ids", rowObj.id);
            })
        }
        formData.append("enable", enable);
        try {
            let response = await post(`/UlteraAdmin/service/v83/component/adaptor/action/enablement`, formData ,{
                'content-type': 'application/json;charset=UTF-8',
            });
            resolve(response);
            dispatch(setDialogLoading(false))
        } catch (e) {
            dispatch(setDialogLoading(false));
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => adaptorEnablement(selectedConfigTableRow, enable)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
            }
        }
    })
};

export const getAdaptorsStatisticList =async (selectedConfigTableRow) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setStatsLoading(true));
        try {
            let baseURL = `/UlteraAdmin/service/v83/component/adaptor/stats/fetch?ids=`;
            if(!Array.isArray(selectedConfigTableRow)) {
                 baseURL = baseURL.concat(selectedConfigTableRow.id);
            }else{
                _.map(selectedConfigTableRow, (rowObj, index)=>{
                    baseURL = index === 0 ? baseURL.concat(rowObj.id) : baseURL.concat(`&ids=${rowObj.id}`);
                })
            }
            let response = await get(baseURL, {
                'content-type': 'application/x-www-form-urlencoded'
            });
            if (response.status === 200) {
                dispatch(updateAdaptorsStatisticsList(response?.data?.items));
                resolve(response);
            }
            dispatch(setStatsLoading(false))
        } catch (e) {
            dispatch(updateAdaptorsStatisticsList([]));
            dispatch(setStatsLoading(false));
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getAdaptorsStatisticList(selectedConfigTableRow)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
            }
        }
    });
};

export const deleteSelectedAdaptor =async (selectedConfigTableRow) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setDialogLoading(true));
        try {
            let baseURL = `/UlteraAdmin/service/v83/admin/envconfig/adaptors/`;
            if(!Array.isArray(selectedConfigTableRow)) {
                baseURL = baseURL.concat(selectedConfigTableRow.id);
            }else{
                _.map(selectedConfigTableRow, (rowObj, index)=>{
                    baseURL = index === 0 ? baseURL.concat(rowObj.id) : baseURL.concat(`,${rowObj.id}`);
                })
            }
            let response = await deleteAPI(baseURL, {
                'content-type': 'application/x-www-form-urlencoded'
            });
            if (response.status === 200) {
                resolve(response);
            }
            dispatch(setDialogLoading(false))
        } catch (e) {
            dispatch(setDialogLoading(false));
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => deleteSelectedAdaptor(selectedConfigTableRow)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
            }
        }
    });
};
