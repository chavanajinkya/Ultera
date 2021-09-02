import {setImportDocId, updateActiveJobs} from "../slices/envManagementSlice"
import store from "../store";
import {get, post, put} from "./common";
import {setError, setLoginState, setOnRetry, setLoading} from "../slices/dashboardSlice";
const dispatch = store.dispatch;

export const importFile =async (uploadData, filename) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setLoading(true));
        try {
            const formData = new FormData();
            formData.append("files[]", uploadData);
            formData.append("fileName", filename);
            let response = await post(`/UlteraAdmin/service/v83/admin/envmgt/upload`, formData, {
                'Content-Type': 'multipart/form-data',
                'Content-Disposition': 'form-data'
            });
            if (response.status === 200) {
                if(response.data) {
                    let strData = response.data;
                    strData = strData.substring(1, strData.length - 1);
                    const result = JSON.parse(strData);
                    dispatch(setImportDocId(result?.response?.docId));
                    resolve(JSON.parse(strData))
                }
            }
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoading(true));
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => importFile(uploadData)));
            } else {
                dispatch(setLoading(true));
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                throw e;
            }
        }
    })
};

export const triggerImportCallAPI =async (requestedData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await put(`/UlteraAdmin/service/v83/admin/envmgt/start/import/-1`, requestedData, {
                'content-type': 'text/plain;charset=UTF-8'
            });
            if (response.status === 200) {
                resolve(response)
            }
            dispatch(setLoading(false))
        } catch (e) {
            dispatch(setLoading(false))
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => triggerImportCallAPI(requestedData)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e.response);
                throw e;
            }
        }
    })
};
export const triggerPromoteCallAPI =async (requestedData) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setLoading(true));
        try {
            let response = await put(`/UlteraAdmin/service/v83/admin/envmgt/start/promote/-1`, requestedData, {
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
                dispatch(setOnRetry(() => triggerPromoteCallAPI(requestedData)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
            }
        }
    })
};

export const exportEnvironment =async (exportData) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setLoading(true));
        try {
            let response = await put(`/UlteraAdmin/service/v83/admin/envmgt/start/export/-1`, exportData, {
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
                dispatch(setOnRetry(() => exportEnvironment(exportData)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                throw e;
            }
        }
    })
};

export const getAvailableModules =async () => {
    return new Promise(async (resolve, reject) => {
        dispatch(setLoading(true));
        try {
            let response = await get(`/UlteraAdmin/service/v83/admin/envmgt/fetch/create/-1`, {
                'content-type': 'application/x-www-form-urlencoded'
            });
            if (response.status === 200) {
                resolve(response)
            }
            dispatch(setLoading(false))
        } catch (e) {
            dispatch(setLoading(false));
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getAvailableModules()));
            } else {
                reject(e);
            }
        }
    })
};

export const createNewEnvironment =async (newData) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setLoading(true));
        try {
            let response = await put(`/UlteraAdmin/service/v83/admin/envmgt/start/create/-1`, newData, {
                'content-type': 'text/plain;charset=UTF-8'
            });
            if (response.status === 200) {
                resolve(response)
            }
        } catch (e) {
            dispatch(setLoading(false));
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => createNewEnvironment(newData)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                throw e;
            }
        }
    })
};

export const getExportEnvList = async () => {
    return new Promise(async (resolve, reject) => {
        dispatch(setLoading(true));
        try {
            let response = await get(`/UlteraAdmin/service/v83/admin/envmgt/fetch/export/-1`, {
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
                dispatch(setOnRetry(() => getExportEnvList()));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                throw e;
            }
        }
    })
};

export const fetchDeleteEnvList = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await get(`/UlteraAdmin/service/v83/admin/envmgt/fetch/delete/-1`, {
                'content-type': 'text/plain;charset=UTF-8'
            });
            if (response.status === 200) {
                resolve(response)
            }
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => fetchDeleteEnvList()));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
                throw e;
            }
        }
    })
};

export const deleteEnvironment =async (deleteData) => {
    return new Promise(async (resolve, reject) => {
        dispatch(setLoading(true));
        try {
            let response = await put(`/UlteraAdmin/service/v83/admin/envmgt/start/delete/-1`, deleteData, {
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
                dispatch(setOnRetry(() => deleteEnvironment(deleteData)));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                throw e;
            }
        }
    })
};

export const getUpdatedActiveList = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await get(`/UlteraAdmin/service/v83/admin/jobs/listactive`, {
                'content-type': 'text/plain;charset=UTF-8'
            });
            if (response.status === 200) {
                const fetchData = response?.data?.response?.jobs;
                fetchData && dispatch(updateActiveJobs(fetchData));
                resolve(response)
            }
            dispatch(setLoading(false));
        } catch (e) {
            if (e.response?.status === 419) {
                dispatch(setLoginState(false));
                dispatch(setOnRetry(() => getUpdatedActiveList()));
            } else {
                dispatch(setError({title: 'Error', message: e.response?.statusText}));
                reject(e);
                throw e;
            }
        }
    })
};