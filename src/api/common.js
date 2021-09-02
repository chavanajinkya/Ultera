import axios from "axios";

const instance = axios.create({
    baseURL: '',
    timeout: 180000
});

export const post = (url, data, header={}) => {
    return new Promise((resolve, reject) => {
        let requestHeader ={
            headers:{'content-type': 'application/json', 'X-Requested-With': 'XMLHttpRequest',...header},
            withCredentials: true
        }
        instance
            .post(url, data, requestHeader)
            .then(async result => {
                if(JSON.stringify(result.request.responseURL).includes('signin.htm')) {
                    reject({response:{status: 419}});
                } else if (result.status === 200) {
                    resolve(result);
                }else {
                    reject(result);
                }
            })
            .catch(error => {
                reject(error);
            });
    });
};

export const put = (url, data, header={}) => {
    return new Promise((resolve, reject) => {
        let requestHeader ={
            headers:{'content-type': 'application/json', 'X-Requested-With': 'XMLHttpRequest',...header},
            withCredentials: true
        }
        instance
            .put(url, data, requestHeader)
            .then(async result => {
                if(JSON.stringify(result.request.responseURL).includes('signin.htm')) {
                    reject({response:{status: 419}});
                } else if (result.status === 200) {
                    resolve(result);
                }else {
                    reject(result);
                }
            })
            .catch(error => {
                reject(error);
            });
    });
};


export const getWithResURL = (url, header) => {
    return new Promise((resolve,reject)=>{
    let requestHeader ={
        headers:{'content-type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...header},
        withCredentials: true
    };
        instance.get(url, requestHeader)
            .then(async result => {
                if(JSON.stringify(result.request.responseURL).includes('signin.htm')) {
                    reject({response:{status: 419}});
                } else if (result.status === 200) {
                    resolve(result);
                }else {
                    reject(result);
                }
            })
            .catch(error=>{
                reject(error);
            });
    });
};

export const get = (url, header) => {
    return new Promise((resolve,reject)=>{
        let requestHeader ={
            headers:{'content-type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...header},
            withCredentials: true
        };
        instance.get(url, requestHeader)
            .then(async result => {
                if (result.status === 200) {
                    resolve(result);
                }else {
                    reject(result);
                }
            })
            .catch(error=>{
                reject(error);
            })
    });
};

export const deleteAPI = (url, header) => {
    return new Promise((resolve,reject)=>{
        let requestHeader ={
            headers:{'content-type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...header},
            withCredentials: true
        };
        instance.delete(url, requestHeader)
            .then(async result => {
                if (result.status === 200) {
                    resolve(result);
                }else {
                    reject(result);
                }
            })
            .catch(error=>{
                reject(error);
            })
    });
};