export const getTimeSlots=()=>{
    let x = 15;
    let times = [];
    let tt = 0;
    let ap = ['AM', 'PM'];

    for (let i=0;tt<24*60; i++) {
        let hh = Math.floor(tt/60);
        let mm = (tt%60);
        times[i] = (hh === 0 ?'12':"0" + (hh % 12)).slice(-2) + ':' + ("0" + mm).slice(-2) +' '+ ap[Math.floor(hh/12)];
        tt = tt + x;
    }
    return times;
};

export const phoneNumberMasking = ( phoneNum ) => {
    if( phoneNum ) {
        return ("" + phoneNum).replace( /\D+/g, "" ).replace( /([0-9]{1,3})([0-9]{3})([0-9]{4}$)/gi, "($1) $2-$3" );
    }
    return phoneNum;
};

export const phoneNumberUnMasking = ( phoneNum ) => {
    if( phoneNum ) {
        return  phoneNum.replace('(','').replace(')','').replace('-','').replace(' ','');
    }
    return phoneNum;
};
