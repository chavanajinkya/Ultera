import React, {useEffect, useRef, useState} from "react";
import {DatePicker} from "@blueprintjs/datetime";
import {Suggest} from "@blueprintjs/select";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
import styles from './dateTime.module.scss';
import {Icons} from "../icons";
import {ICONS} from "../../utils/iconNames";
import {getTimeSlots} from "../../utils/commonFunctions";
import {DATE_FORMAT, DATE_TIME_FORMAT, DATE_TIME_FORMAT_WITHOUT_SEC} from "../../utils/common";
import moment from "moment";
import {Tooltip} from "@blueprintjs/core";
import {useTranslation} from "react-i18next";
import MomentLocaleUtils from "react-day-picker/moment";
import "moment/locale/fr";
import i18n from '../../i18n';

export const DateTime=(props)=>{
    const {isDateTimePicker, errorText, onItemSelected=()=>{}, popoverWidth, isDisabled=false, autoFocus,
        selectedOperator,selectedValue, needTimeInSec = true , usePortal=true, minDate, onInputSubmit=()=>{}} = props;

    const [activeTime,setActiveTime]=useState('12:00 AM');
    const [isShow,setIsShow]=useState(true);
    const [selectedTime,setSelectedTime]=useState('');
    const [selectedDate,setSelectedDate]=useState('');
    const [dateBoxError,setDateBoxError]=useState('');
    const suggestBoxRef  = useRef(null);
    const DateBoxRef  = useRef(null);
    const {t} = useTranslation();

    useEffect(()=>{
        if(selectedTime||selectedDate) {
            let formattedDate = getLatestDateTime();
            onItemSelected(isDateTimePicker && formattedDate ?
                moment(formattedDate).format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z' : formattedDate && selectedOperator === 'ON' ?
                    moment(formattedDate).format('YYYY-MM-DD') + 'T12:00:00.000Z' :
                    formattedDate ? moment(formattedDate).format('YYYY-MM-DD') + 'T12:00:00.000Z' : formattedDate);
        }
    },[selectedTime,selectedDate]);

    const onTimeSelect = (time) => {
        setSelectedTime(time);
        setIsShow(false);
    };

    const onDateSelect=(date)=>{
        setSelectedDate(date);
        !isDateTimePicker && setIsShow(false);
    };

    const onArrowDownClick = () => {
        setIsShow(true);
        suggestBoxRef.current?.inputElement.focus()
    };

    const onDateArrowClick = () => {
        setIsShow(true);
        DateBoxRef.current?.inputElement.focus()
    };

    const getLatestDateTime=()=>{
        let timeFormat = selectedTime ? selectedTime: '12:00 AM';
        let formattedDate= selectedDate? moment(selectedDate).format(DATE_FORMAT):'';
        let formattedDateWithTime=selectedTime ||selectedDate? selectedDate ? moment(selectedDate).format(DATE_FORMAT)+' '+timeFormat:
            moment().format(DATE_FORMAT)+' '+timeFormat :'';
        return isDateTimePicker ? formattedDateWithTime : formattedDate;
    };

    useEffect(()=>{
        let timeSlots=getTimeSlots();
        let currentTime= moment().format('hh mm A').split(' ');
        let matchingSlot =timeSlots.find(t=>{
          return t.startsWith(currentTime[0]) && t.endsWith(currentTime[2])
        });
        setActiveTime(matchingSlot);
    },[]);

    const onTextChange=(e)=> {
        setDateBoxError(null)
        const regex = /{[n|N]}/;
        const subtractRegex = /{[n|N][-][0-9]{0,5}}/;
        const addRegex = /{[n|N][+][0-9]{0,5}}/;
        const subRegex0 = /{[n|N][-|+]0}/;
        if(e.includes('{') && e.includes('}')){
            if (e.match(regex) || e.match(subtractRegex) || e.match(addRegex)) {
                if(e.match(subRegex0)) {
                    setDateBoxError(t('INVALID_VALUE_MSG', {fieldName: t('admin.envmgt.import.mapping.source.title')}))
                    onItemSelected('');
                }
                else onItemSelected(`${e}`);
            } else {
                setDateBoxError(t('INVALID_VALUE_MSG', {fieldName: t('admin.envmgt.import.mapping.source.title')}))
                onItemSelected('');
            }
            } else if(!e.startsWith('{')){
            let datePattern = isDateTimePicker && selectedOperator !== 'ON' ?
                /^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{1,2} [AP]M/ :
                /^\d{2}\/\d{2}\/\d{4}$/;
            if (!datePattern.test(e)) {
                setDateBoxError(t('INVALID_VALUE_MSG', {fieldName: t('admin.envmgt.import.mapping.source.title')}))
            } else {
                setDateBoxError('');
                if (datePattern.test(e)) {
                    onItemSelected(isDateTimePicker ?
                        moment(e).format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z' : selectedOperator === 'ON' ?
                            moment(e).format('YYYY-MM-DD') + 'T12:00:00.000Z' : moment(e).format('YYYY-MM-DD'));
                }
            }
            if (e === '') {
                onItemSelected('');
                setSelectedDate('');
                setDateBoxError('');
            }
        }
    };
    let selectedComponent= [isShow && <DatePicker className={styles.datePicker} locale={i18n.language?.includes('fr') ? 'fr' : 'en'} localeUtils={MomentLocaleUtils} reverseMonthAndYearMenus={true} onChange={onDateSelect} defaultValue={minDate && new Date()} minDate={minDate?new Date(minDate) : new Date('01/01/1900')} maxDate={new Date('01/01/2099')} />];
    if(isDateTimePicker){
        selectedComponent = [ isShow && <>
            <DatePicker className={styles.datePicker} locale={i18n.language?.includes('fr') ? 'fr' : 'en'} localeUtils={MomentLocaleUtils} reverseMonthAndYearMenus={true} onChange={onDateSelect}  defaultValue={minDate && new Date()} minDate={minDate?new Date(minDate) : new Date('01/01/1900')} maxDate={new Date('01/01/2099')} />
            <div style={{padding:'10px'}}>
                <Suggest
                    items={getTimeSlots()}
                    ref={suggestBoxRef}
                    itemRenderer={(item, itemProps) => {
                        return item && <div className={styles.selectOption} onClick={itemProps.handleClick}
                                    style={{
                                        width: popoverWidth,
                                        fontWeight: item.includes('30') ? 'bold' : 'normal',
                                    }}>{item}</div>}}
                    onItemSelect={onTimeSelect}
                    selectedItem={selectedTime}
                    fill={true}
                    popoverProps={{minimal: true, usePortal:usePortal}}
                    inputValueRenderer={(item) => {
                        return item
                    }}
                    onQueryChange={onTextChange}
                    scrollToActiveItem={true}
                    activeItem={activeTime}
                    inputProps={{
                        small: true,
                        disabled: isDisabled,
                        placeholder: '',
                        style: {border:'1px solid #b5bcc7'},
                        rightElement:
                            <div className={styles.arrowIconBox}>
                                <div className={styles.arrowBox} onClick={onArrowDownClick}><Icons icon={ICONS.ARROWS_DOWN_DARK}/></div>
                            </div>
                    }}
                />
            </div>
        </>];
    }

   return(
       <div style={{border: 'solid 1px #cfe5fa', width:'100%', height: "100%"}}>
           <Tooltip content={errorText || dateBoxError } position={'right'} className={styles.tooltip}
                    targetProps={{className: styles.tooltipTarget}} popoverClassName={styles.tooltipStyle}>
           <Suggest
                onKeyUp={(e)=>e.key === "Enter" && onInputSubmit()}
               ref={DateBoxRef}
               itemRenderer={(item, itemProps) => {
                   return item && <div className={styles.dateContainer}>{item}</div>
               }}
               autoFocus={ autoFocus|| false }
               inputProps={{
                   placeholder : selectedValue ? isDateTimePicker?moment.utc(selectedValue).format(needTimeInSec ? DATE_TIME_FORMAT : DATE_TIME_FORMAT_WITHOUT_SEC):moment(selectedValue).format(DATE_FORMAT):'',
                   autoFocus: autoFocus||false,
                   rightElement:
                       <div className={styles.arrowIconBox}>
                           {
                               errorText||dateBoxError ? <div className={styles.errorWrapper} onClick={onDateArrowClick}>
                                       <button className={styles.errorIcon} onClick={onDateArrowClick}/><Icons icon={ICONS.ARROWS_DOWN_DARK}/></div>
                                   : <div className={styles.arrowBox} onClick={onDateArrowClick}><Icons icon={ICONS.ARROWS_DOWN_DARK}/></div>
                           }
                       </div>
               }}
               onQueryChange={onTextChange}
               inputValueRenderer={(item) => {return item}}
               items={selectedComponent}
               selectedItem={getLatestDateTime()}
               query={selectedValue ? selectedValue.includes('{') ? selectedValue : selectedTime || selectedDate ? getLatestDateTime() : selectedValue ?
                       isDateTimePicker ?
                           moment.utc(selectedValue).format(DATE_TIME_FORMAT):
                           moment(selectedValue).format(DATE_FORMAT):
                       '': ''}
               fill={true}
               popoverProps={{minimal: true, usePortal: usePortal, modifiers:{
                preventOverflow: { enabled: false}, flip: { enabled: false} }}}
               className={errorText && styles.errorInputBox}
               />
           </Tooltip></div>
   )
}