import {setLoading} from "../slices/workSearchSlice"
import {
    updateActiveJobs,
    updateJobHistory,
    updateLogsList,
    setPopupLoading,
    updateProceedJobContent,
    updateImportEntity,
    updatePromoteStatsDetails,
    updateProceedNCMappings,
    updateObjectStores,
    updateTargetRealmsArr, updateTargetsArr, setProceedDoSaveLoading, updateUserBatchActiveJobs, updateLicenseDetails
} from "../slices/envManagementSlice"
import store from "../store";
import {get, put, post} from "./common";
import {setError, setLoginState, setOnRetry, setPageSize, setTotalSearches} from "../slices/dashboardSlice";
import _ from "lodash";
const dispatch = store.dispatch;

export const getActiveJobs =async () => {
    dispatch(setLoading(true));
     try {
        let response = await get(`/UlteraAdmin/service/v83/admin/environmentmanagement/ACTIVE/jobs`,{
            'content-type': 'application/x-www-form-urlencoded'
        });
        if (response.status === 200) {
            dispatch(updateActiveJobs(response?.data));
        }
        dispatch(setLoading(false))
    }catch (e){
         dispatch(updateActiveJobs([]));
         dispatch(setLoading(false));
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getActiveJobs()));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}));
            throw e;
        }
    }
};

export const getJobHistory =async () => {
    dispatch(setLoading(true));
    try {
        let response = await get(`/UlteraAdmin/service/v83/admin/environmentmanagement/HISTORY/jobs`,{
            'content-type': 'application/x-www-form-urlencoded'
        });
        if (response.status === 200) {
            dispatch(updateJobHistory(response.data));
        }
        dispatch(setLoading(false))
    }catch (e){
        dispatch(updateJobHistory([]));
        dispatch(setLoading(false));
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getJobHistory()));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}));
            throw e;
        }
    }
};

export const abortCurrentActiveJob = async (jobId) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setLoading(true));
        try {
            let response = await put(`/UlteraAdmin/service/v83/admin/envmgt/abort/${jobId}`, true, {
                'content-type': 'text/plain;charset=UTF-8'
            });
            if (response.status === 200) {
                resolve(response)
            }
            dispatch(setLoading(false))
        } catch (e) {
            dispatch(setLoading(false));
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => abortCurrentActiveJob(jobId)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
            }
        }
    })
};

export const logCurrentActiveJob = async (range, jobInstanceId, levelStatusName= null, sortBy = '', sortByDirection = '') => {
    return new Promise(async (resolve, reject) => {
        dispatch(setPopupLoading(true));
        try {
            let accessUrl;
            if(levelStatusName && !levelStatusName.toLowerCase().includes('level')){
                accessUrl =  `/UlteraAdmin/service/v83/admin/log/fetch/page?id=${jobInstanceId}&level=${levelStatusName}`;
            }else{
                accessUrl =  `/UlteraAdmin/service/v83/admin/log/fetch/page?id=${jobInstanceId}`;
            }
            if(sortBy && sortByDirection){
                if(sortByDirection === 'Des'){
                    accessUrl =  `${accessUrl}&sort(-${sortBy})`;
                }else{
                    accessUrl =  `${accessUrl}&sort(+${sortBy})`;
                }
            }
            let response = await get(accessUrl, {
                'content-type': 'application/json;charset=UTF-8',
                'Range': 'items='+range ?? ''
            });
            if (response.status === 200) {
                dispatch(updateLogsList(response?.data));
                let totalRange = response.headers['content-range']?.split('/');
                totalRange = totalRange && totalRange[1];
                dispatch(setPageSize(25));
                dispatch(setTotalSearches(totalRange));
                resolve(response)
            }
            dispatch(setPopupLoading(false))
        } catch (e) {
            dispatch(setPopupLoading(false));
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => logCurrentActiveJob(range, jobInstanceId,levelStatusName= null)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
            }
        }
    })
};

export const getLogErrorStack = (id) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setPopupLoading(true));
        try {
            let response = await get(`/UlteraAdmin/service/v83/admin/log/error/stack?id=${id}`, {
                'content-type': 'application/json;charset=UTF-8',
            });
            if (response.status === 200) {
                resolve(response)
            }
            dispatch(setPopupLoading(false))
        } catch (e) {
            dispatch(setPopupLoading(false));
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getLogErrorStack(id)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
            }
        }
    })
};

export const exportLogData = (id,startDate, endDate,selectedLevel, selectedLayout) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setPopupLoading(true));
        try {
            let response = await get(`/UlteraAdmin/service/v83/admin/log/export?id=${id}&startDate=${startDate}&endDate=${endDate}&level=${selectedLevel}&layout=${selectedLayout.toUpperCase()}`, {
                'content-type': 'application/json;charset=UTF-8',
            });
            resolve(response);
            dispatch(setPopupLoading(false))
        } catch (e) {
            dispatch(setPopupLoading(false));
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => exportLogData(id,startDate, endDate,selectedLevel, selectedLayout)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
            }
        }
    })
};

export const proceedActiveJobContent = (id) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setPopupLoading(true));
        try {
            let response = await get(`/UlteraAdmin/service/v83/admin/job/${id}/proceed`, {
                'content-type': 'application/json;charset=UTF-8',
            });
            dispatch(updateProceedJobContent(response?.data));
            resolve(response);
            if (response?.data?.contextViewTemplate){
                let actualJson = JSON.parse(response?.data?.contextModel);
                if(actualJson?.IMPORT_STATS) {
                    dispatch(updateImportEntity(actualJson?.IMPORT_STATS));
                }
                if(actualJson?.PROMOTE_STATS_DETAILS){
                    dispatch(updatePromoteStatsDetails(actualJson?.PROMOTE_STATS_DETAILS));
                }
                if(actualJson?.mappings){
                    const sources = actualJson.mappings;
                    let newUpdatedArray = [];
                    for(let i=0; i<sources.length; i++){
                        let sourceObj = {...sources[i]};
                        const targetRealms = await get(`/UlteraAdmin/service/v83/groups/fetchRealmList/?name=${actualJson.currentRealm}`);
                        sourceObj.selectedTargetRealm = targetRealms?.data[0];
                        const targets = await get(`/UlteraAdmin/service/v83/groups/doFetchUserGroupsList/?realm=${actualJson.currentRealm}&displayName=${sourceObj.source}`);
                        sourceObj.selectedTarget = targets?.data[0];
                        if(sourceObj.target){
                            let objectStoreArr = [...actualJson.objectStores];
                            let selectedObjectStore = _.filter(objectStoreArr, (storeObj)=>{
                                 if(storeObj.name === sourceObj.target){
                                     return storeObj
                                 }
                            });
                            sourceObj.selectedObjectStore = selectedObjectStore[0];
                        }
                         newUpdatedArray.push(sourceObj);
                    }
                    dispatch(updateProceedNCMappings(newUpdatedArray))
                }
                if(actualJson?.objectStores){
                    dispatch(updateObjectStores(actualJson.objectStores))
                }
            }
            dispatch(setPopupLoading(false))
        } catch (e) {
            dispatch(setPopupLoading(false));
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => proceedActiveJobContent(id)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
            }
        }
    })
};

export const restartCurrentActiveJob = (jobName, jobId) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setPopupLoading(true));
        try {
            let response = await put(`/UlteraAdmin/service/v83/admin/envmgt/restart/${jobName}/${jobId}`, true,{
                'content-type': 'application/json;charset=UTF-8',
            });
            resolve(response);
            dispatch(setPopupLoading(false))
        } catch (e) {
            dispatch(setPopupLoading(false));
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => restartCurrentActiveJob(jobName, jobId)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
            }
        }
    })
};
export const getTargets = (currentRealm, newTargetText) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await get(`/UlteraAdmin/service/v83/groups/doFetchUserGroupsList/?realm=${currentRealm}&displayName=${newTargetText}*`, {
                'content-type': 'application/json;charset=UTF-8',
            });
            dispatch(updateTargetsArr(response?.data));
            resolve(response);
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getTargets(currentRealm, newTargetText)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
            }
        }
    })
};

export const getTargetRealms = (newCurrentRealmText) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await get(`/UlteraAdmin/service/v83/groups/fetchRealmList/?name=${newCurrentRealmText}*`, {
                'content-type': 'application/json;charset=UTF-8',
            });
            dispatch(updateTargetRealmsArr(response?.data));
            resolve(response);
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getTargetRealms(newCurrentRealmText)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
            }
        }
    })
};

export const doSaveUpdatedArrOnApply = (updatedObjectArr) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setProceedDoSaveLoading(true));
        try {
            let response = await post(`/UlteraAdmin/service/v83/admin/job/import/mapping/doSave`, updatedObjectArr,{
                'content-type': 'application/json;charset=UTF-8',
            });
            resolve(response);
            dispatch(setProceedDoSaveLoading(false))
        } catch (e) {
            dispatch(setProceedDoSaveLoading(false));
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => doSaveUpdatedArrOnApply(updatedObjectArr)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
            }
        }
    })
};


export const getUserBatchJobs =async () => {
    dispatch(setLoading(true));
    try {
        let response = await get(`/UlteraAdmin/service/v83/admin/context/ipd.admin.userbatch.sidebarEvent`,{
            'content-type': 'application/x-www-form-urlencoded'
        });

        if (response.status === 200) {
            let sendData = response?.data?.contextModel?.listItems;
            sendData = JSON.parse(sendData);
            dispatch(updateUserBatchActiveJobs(sendData?.items));
        }
        dispatch(setLoading(false))
    }catch (e){
        dispatch(updateUserBatchActiveJobs([]));
        dispatch(setLoading(false));
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getUserBatchJobs()));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}));
            throw e;
        }
    }
};

export const getAuditAndLicenseDetails =async () => {
    dispatch(setLoading(true));
    try {
        let response = await get(`/UlteraAdmin/service/v83/admin/context/ipd.admin.licensing`,{
            'content-type': 'application/x-www-form-urlencoded'
        });
        console.log("response", response);
        if (response.status === 200) {
            dispatch(updateLicenseDetails(response?.data?.contextModel?.contextModel?.licenseStatus));
        }
        dispatch(setLoading(false))
    }catch (e){
        dispatch(updateLicenseDetails({}));
        dispatch(setLoading(false));
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getAuditAndLicenseDetails()));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}));
            throw e;
        }
    }
};

export const getExportJobsData =async () => {
    dispatch(setLoading(true));
    try {
        let response = await get(`/UlteraAdmin/service/v83/admin/context/ipd.admin.licensing`,{
            'content-type': 'application/x-www-form-urlencoded'
        });
        console.log("response", response);
        if (response.status === 200) {
            //dispatch(updateLicenseDetails(response?.data));
        }
        dispatch(setLoading(false))
    }catch (e){
        //dispatch(updateLicenseDetails([]));
        dispatch(setLoading(false));
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getExportJobsData()));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}));
            throw e;
        }
    }
};
