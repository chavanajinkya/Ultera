import {get, post} from "./common";
import {
    setError,
    setLoginState,
    setOnRetry,
    setSubDataItemCount,
    setLoading,
    setResultSetData,
    setContextMetaData,
    setUserList,
    setTotalSearches,
    setLeftPanelSubData,
    setEnvironmentList,
    clearContextData,
    setNoContextFound,
    setMassRouteList,
    setWorkItemStatusList,
    setWorkItemLoading, setOwnershipFieldData, setShowCaseSuccessPopup, setCaseReassignPopupLoading
} from "../slices/dashboardSlice";
import store from "../store";
import {
    setShowSuccessPopup
} from "../slices/workSearchSlice";
const dispatch = store.dispatch;

export const getLeftPanelData =async (selectedTab,contextName,isGetCount) => {
    dispatch(setLoading(true));
    try {
        let response = await get(`/Ultera/service/v83/context/${selectedTab}`)
        if (response.status === 200) {
            if(response.data?.contextModel?.metaData) {
                dispatch(setNoContextFound(false));
                dispatch(setContextMetaData(response.data?.contextModel));
                dispatch(setLeftPanelSubData(JSON.parse(response.data?.contextModel?.metaData?.templates)))
                if(isGetCount) {
                    let templateIds = (JSON.parse(response?.data?.contextModel?.metaData?.templates)).map(a => a.id);
                    getSubPanelItemCount(templateIds, contextName);
                }else{
                    let parsedData = JSON.parse(response.data?.contextModel?.currentTemplate)?.retrievalExpressions?.detailSet
                    let validationData=parsedData.filter((d) => d.visibility === 3 || d.visibility === 4);
                    JSON.parse(response.data?.contextModel.currentTemplate).autoRun && !validationData.length &&
                    getSearchData(contextName,'0-24',JSON.parse(response.data?.contextModel.currentTemplate), '', '')
                }
            }else{
                if(response.data?.contextModel['##ipd.nocontext.key##']){
                    dispatch(clearContextData([]));
                    dispatch(setNoContextFound(true));
                }
            }
        }
        dispatch(setLoading(false))
    }catch (e){
        dispatch(setLoading(false));
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getLeftPanelData(selectedTab, contextName, isGetCount)));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}))
            throw e;
        }
    }
};

export const getSubPanelItemCount =async (data=[], contextName) => {
    try {
        let response = await post(`/Ultera/service/v83/${contextName}/items/count`, data?JSON.stringify(data):[])
        if (response.status === 200) {
            if(response.data.includes('Ultera: Error Page')){
                dispatch(setError({title: 'Runtime Exception', message: 'Unknown Runtime Exception'}));
            }else {
                dispatch(setSubDataItemCount(response.data));
            }
        }
    }catch (e){
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getSubPanelItemCount(data, contextName)));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}))
            throw e;
        }
    }
}

export const getSearchData =async (contextName,range, reqData, selectedColumn='', sortDir='') => {
    dispatch(setLoading(true));
    let  requestUrl= selectedColumn ? `/Ultera/service/v83/${contextName}/search/`+`${reqData.id}`+`?sort(${sortDir}${selectedColumn})`:
        `/Ultera/service/v83/${contextName}/search/`+`${reqData.id}`
    try {
        let response = await post(requestUrl, JSON.stringify(reqData), {
            'range': 'items='+range ?? ''
        })
        if (response.status === 200) {
             if(response.data?.exceptionVO){
                dispatch(setError({title: 'Error', message: response.data.exceptionVO.message}));
                dispatch(setLoading(false))
                return
            }
            let range = response.headers['content-range']?.split('/');
             range && dispatch(setTotalSearches(range[1]));
            dispatch(setResultSetData(response.data));

        }
        dispatch(setLoading(false))
    }catch (e){
        dispatch(setResultSetData([]));
        dispatch(setLoading(false));
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getSearchData(contextName,range, reqData, selectedColumn='', sortDir='')));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}))
            throw e;
        }
    }
};


export const getUserList =async (searchText='') => {
    try {
        let response = await get(`/Ultera/service/v83/users/doFetchUserList/?filterInactive=false&withToken=true&description=${searchText}*`)
        if (response.status === 200) {
           dispatch(setUserList(response.data))
        }
    }catch (e){
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getUserList(searchText)));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}))
            throw e;
        }
    }
};

export const getSelectedUser = async (searchText='') => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await get(`/Ultera/service/v83/users/doFetchUserList/${searchText}`);
            if (response.status === 200) {
                resolve([response.data]);
            }
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getSelectedUser(searchText)));
                dispatch(setLoading(false));
            } else {
                reject(e)
                throw e;
            }
        }
    })
};

export const getUserListForReassign = async (searchText='') => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await get(`/Ultera/service/v83/users/doFetchUserList/?description=${searchText}*`);
            if (response.status === 200) {
                dispatch(setUserList(response.data))
            }
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getUserListForReassign(searchText)));
                dispatch(setLoading(false));
            } else {
                reject(e)
                throw e;
            }
        }
    })
};

export const getTemplate =async (contextName, templateId='', searchContextName='') => {
    try {
        let response = await get(`/Ultera/service/v83/${contextName}/templates/${templateId}`);
        if (response.status === 200) {
            if(response.data?.contextModel?.metaData) {
                dispatch(setContextMetaData(response.data?.contextModel));
                let parsedData = JSON.parse(response.data?.contextModel?.currentTemplate)?.retrievalExpressions?.detailSet
                let validationData=parsedData.filter((d) => d.visibility === 3 || d.visibility === 4);
                JSON.parse(response.data?.contextModel.currentTemplate).autoRun && !validationData.length &&
                getSearchData(searchContextName,'0-24',JSON.parse(response.data?.contextModel.currentTemplate), '', '')
            }
        }
    }catch (e){
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getTemplate(contextName, templateId)));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}))
            throw e;
        }
    }
};

export const getEnvironmentList = async () => {
    return new Promise(async (resolve, reject) => {
        dispatch(setLoading(true));
        try {
            let response = await get(`/Ultera/service/v83/environments`);
            if (response.status === 200) {
                dispatch(setEnvironmentList(response?.data));
                resolve(response)
            }
            dispatch(setLoading(false))
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getEnvironmentList()));
                dispatch(setLoading(false));
            } else {
                reject(e?.response);
                throw e;
            }
            dispatch(setLoading(false));
        }
    })
};


export const getMassRouteList = async (fieldName='', sortDir='') => {
    return new Promise(async (resolve, reject) => {
        try {
            let url=fieldName?`/Ultera/service/v83/process/workflowaction/status/user/requests?sort(${sortDir}${fieldName})`:`/Ultera/service/v83/process/workflowaction/status/user/requests`
            let response = await get(url,{
                'content-type': 'application/json;charset=UTF-8',
                'Range': 'items=0-24'
            });
            if (response.status === 200) {
                dispatch(setMassRouteList(response?.data));
            }
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getMassRouteList()));
            } else {
                reject(e?.response);
                throw e;
            }
        }
    })
};

export const getWorkItemStatusList = async (id='') => {
    return new Promise(async (resolve, reject) => {
        dispatch(setWorkItemLoading(true));
        try {
            let response = await get(`/Ultera/service/v83/process/workflowaction/status/jobs/${id}`);
            if (response.status === 200) {
                dispatch(setWorkItemStatusList(response?.data));
            }
            dispatch(setWorkItemLoading(false))
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getWorkItemStatusList(id)));
                dispatch(setWorkItemLoading(false));
            } else {
                reject(e?.response);
                throw e;
            }
            dispatch(setWorkItemLoading(false));
        }
    })
};


export const deleteMassItem = async (id='') => {
    return new Promise(async (resolve, reject) => {
        dispatch(setLoading(true));
        try {
            let response = await get(`/Ultera/service/v83/process/workflowaction/request/cancel/${id}`);
            if (response.status === 200) {
               getMassRouteList();
            }
            dispatch(setLoading(false))
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => deleteMassItem(id)));
                dispatch(setLoading(false));
            } else {
                reject(e?.response);
                throw e;
            }
            dispatch(setLoading(false));
        }
    })
};

export const getUserListForCaseSearchReassign = async (searchText='') => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await get(`/Ultera/service/v83/process/recipients/role/?roleName=&filterInactive=true&withToken=true&description=${searchText}*`);
            if (response.status === 200) {
                dispatch(setUserList(response.data))
            }
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getUserListForCaseSearchReassign(searchText)));
                dispatch(setLoading(false));
            } else {
                reject(e)
                throw e;
            }
        }
    })
};

export const getOwnershipListForReassign = async (searchText='') => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await get(`/Ultera/service/v83/cases/reassign/ownership`);
            if (response.status === 200) {
                const filtered = response.data[0]?.selections.filter(data => (data.description ?? data.name ?? data.caption).toLowerCase()?.startsWith(searchText?.toLowerCase()));
                dispatch(setOwnershipFieldData(filtered))
            }
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getOwnershipListForReassign(searchText)));
                dispatch(setLoading(false));
            } else {
                reject(e)
                throw e;
            }
        }
    })
};
export const reassignCaseSearchUser=async (requestObj)=>{
    dispatch(setCaseReassignPopupLoading(true));
    try {
        let response = await post(`/Ultera/service/v83/cases/reassign`, requestObj);
        if (response.status === 200){
            if(response.data.response?.results?.batchJobs){
                 dispatch(setShowCaseSuccessPopup(true))
            }else{
                dispatch(setError({title: 'Error', message: response.data?.exceptionVO?.message}))
            }
        }
        dispatch(setCaseReassignPopupLoading(false));
    }catch (e){
        dispatch(setCaseReassignPopupLoading(false));
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => reassignCaseSearchUser(requestObj)));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}))
            throw e;
        }
    }
}
export const sessionCheck = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await get(`/Ultera/service/v83/system/check`);
            if (response.status === 200) {
                resolve({message:'success'})
            }
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
            } else {
                reject(e)
                throw e;
            }
        }
    })
};
