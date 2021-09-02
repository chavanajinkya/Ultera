import store from "../store";
import {clearOnRetry, setEnvironmentId, setLoginState, setOnRetry, setOpenEnvDialog} from "../slices/dashboardSlice";
import {post, get} from "./common";
import {setLoading} from "../slices/workSearchSlice";

export const login = (usernameState, passwordState, title, onRetry=[])  => {
    return new Promise(async (resolve, reject) => {
        const envId = localStorage.getItem("envId") || ''; 
        const data = new URLSearchParams();
        data.append('j_username', usernameState);
        data.append('j_password', passwordState);
        data.append('envid', envId);
        try {
            let res = await post(`/${title}/j_spring_security_check?tzoffset=5.5&tzname=Asia/Calcutta`, data, {
                'content-type': 'application/x-www-form-urlencoded'
            })
            if (res.status === 419) {
                store.dispatch(setLoginState(false));
                reject("* Invalid username or password")
            } else {
                localStorage.setItem('username', usernameState);
                localStorage.setItem('__default_home_left', 210);
                store.dispatch(setLoginState(true));
                onRetry.forEach(d=>{
                    d();
                });
                store.dispatch(clearOnRetry())
                resolve(res)
            }
        } catch (e) {
            store.dispatch(setLoading(false))
            if(e.response?.status === 419){
                reject("* Invalid username or password")
            }else {
                throw e;
            }
        }
    })
};

export const signOut = (title) =>{
    return new Promise(async (resolve, reject) => {
        try {
            localStorage.removeItem('username');
            window.location.href = `/${title}/j_spring_security_logout`;
            resolve()
        } catch (e) {
            store.dispatch(setLoading(false));
            if(e.response?.status === 419){
                reject("Unable to Sign Out")
            }else {
                throw e;
            }
        }
    })
};

export const navigateToDashboard = (title, envId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let res = await get(`/${title}/home/home.htm?envid=${envId}`,{
                'content-type': 'application/x-www-form-urlencoded'
            });
            if (res.status === 419) {
                store.dispatch(setLoginState(false));
                store.dispatch(setOnRetry(() => navigateToDashboard(title, envId)));
                reject(res);
            } else if(res.status === 200){
                resolve(res)
            }
        } catch (e) {
            store.dispatch(setLoading(false));
            if(e.response){
                store.dispatch(setLoginState(false));
                store.dispatch(setOnRetry( async () => {
                     const res = await navigateToDashboard(title, envId);
                    if(res.status === 200) {
                        store.dispatch(setOpenEnvDialog(false));
                        localStorage.setItem('envId',envId);
                        store.dispatch(setEnvironmentId(envId));
                    }
                }));
            }else {
                throw e;
            }
        }
    })
};

