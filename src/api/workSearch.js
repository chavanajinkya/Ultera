import {get, post} from "./common";
import store from "../store";
import {
    setShowSuccessPopup,
    setReassignLoading,
    setRouteUserList,
    setRouteReasonList,
    setShowRouteSuccessPopup,
    setRouteLoading,
    setViewPageLoading, setWorkObjectData, setWorkLeftPanelData, setViewData, setReassignQueueList
} from "../slices/workSearchSlice";
import {setError, setLoginState, setOnRetry} from "../slices/dashboardSlice";
const dispatch = store.dispatch;

export const reassignUser=async (requestObj)=>{
    requestObj.action === 1 ? dispatch(setReassignLoading(true)): dispatch(setRouteLoading(true));
    try {
        let response = await post(`/Ultera/service/v83/process/workflowaction/`, requestObj);
        if (response.status === 200){
            if(response.data.response?.results?.batchJobs){
                requestObj.action === 1 ? dispatch(setShowSuccessPopup(true)):dispatch(setShowRouteSuccessPopup(true))
            }else if(response.data?.exceptionVO){
                dispatch(setError({title: 'Exception', message: response.data?.exceptionVO?.message}))
            }
        }
        requestObj.action === 1 ? dispatch(setReassignLoading(false)): dispatch(setRouteLoading(false));
    }catch (e){
        requestObj.action === 1 ? dispatch(setReassignLoading(false)): dispatch(setRouteLoading(false));
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => reassignUser(requestObj)));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}))
            throw e;
        }
    }
}

export const getReassignRouteUser=async (queueName='',searchText='')=>{
    try {
        let response = await get(`/Ultera/service/v83/process/massroute/users?queueName=${queueName}&filterInactive=true&withToken=true&description=${searchText}*`)
        if(response.status === 200){
            if(response.data.includes('Ultera: Error Page') || response.data.includes('Ultera: Page d\'erreur')){
                dispatch(setRouteUserList([]));
            }else {
                dispatch(setRouteUserList(response.data))
            }
        }
    }catch (e){
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getReassignRouteUser(queueName, searchText)));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}))
            throw e;
        }
    }
}

export const getRouteReasons=async (queueName='',searchText='')=>{
    try {
        let response = await get(`/Ultera/service/v83/process/queue/reason/route?queueName=${queueName}&name=${searchText}*`)
        if(response.status === 200){
            if(response.data.exception){
                dispatch(setRouteReasonList([]))
            }else {
                dispatch(setRouteReasonList(response.data))
            }
        }
    }catch (e){
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getRouteReasons(queueName, searchText)));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}))
            throw e;
        }
    }
}

export const getViewTemplateData= async (workid='') => {
    return new Promise(async (resolve, reject) => {
        dispatch(setViewPageLoading(true));
        try {
            let response = await get(`/Ultera/service/v83/works/items/open?workid=${workid}`);
            if (response.status === 200) {
                    dispatch(setWorkObjectData(response.data?.workObject))
                    dispatch(setViewData(response.data))
                    let formattedSideBarBodyModel = JSON.parse(response.data?.sideBarBodyModel?.replaceAll('(', '').replaceAll(')', ''))
                    dispatch(setWorkLeftPanelData(formattedSideBarBodyModel))
            }
            dispatch(setViewPageLoading(false))
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getViewTemplateData(workid)));
                dispatch(setViewPageLoading(false));
            } else {
                dispatch(setViewPageLoading(false));
                reject(e?.response);
                throw e;
            }
            dispatch(setViewPageLoading(false));
        }
    })
};

export const checkIsViewReady= async (workid='') => {
    return new Promise(async (resolve, reject) => {
        dispatch(setViewPageLoading(true));
        try {
            let response = await get(`/Ultera/service/v83/works/items/open?workid=${workid}`);
            if (response.status === 200) {
                if(response.data?.folderId || response.data?.folderStructureId){
                    resolve({message:'success'})
                }else {
                    resolve({message:'failed'})
                }
                dispatch(setViewPageLoading(false));
            }
            dispatch(setViewPageLoading(false));
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setViewPageLoading(false));
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getViewTemplateData(workid)));
            } else {
                dispatch(setViewPageLoading(false));
                reject(e?.response);
                throw e;
            }
        }
    })
};

export const getReassignQueueList=async ()=>{
    try {
        let response = await get(`/Ultera/service/v83/process/workflowaction/route`)
        if(response.status === 200){
            dispatch(setReassignQueueList(response.data?.workAssignments?.workAssignments?.selections))
        }else{
            dispatch(setReassignQueueList([]))
        }
    }catch (e){
        if(e.response?.status === 419) {
            dispatch(setLoginState(false));
            dispatch(setOnRetry(() => getReassignQueueList()));
        }else {
            dispatch(setError({title: 'Error', message: e.response?.statusText}))
            throw e;
        }
    }
}