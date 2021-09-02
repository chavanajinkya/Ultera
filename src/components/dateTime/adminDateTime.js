import React, {useEffect, useRef, useState} from "react";
import {DatePicker} from "@blueprintjs/datetime";
import {Suggest} from "@blueprintjs/select";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
import styles from './dateTime.module.scss';
import {Icons} from "../icons";
import {ICONS} from "../../utils/iconNames";
import {getTimeSlots} from "../../utils/commonFunctions";
import {
    DATE_FORMAT_FR,
    DATE_FORMAT,
    DATE_TIME_FORMAT,
    DATE_TIME_FORMAT_WITHOUT_SEC,
    DATE_TIME_FORMAT_WITHOUT_SEC_FR
} from "../../utils/common";
import moment from "moment";
import {Tooltip} from "@blueprintjs/core";
import {useTranslation} from "react-i18next";
import MomentLocaleUtils from "react-day-picker/moment";
import "moment/locale/fr";
import i18n from '../../i18n';

export const AdminDateTime = (props) =>{
    const {isDateTimePicker, errorText, onItemSelected=()=>{}, popoverWidth, isDisabled=false, autoFocus, fieldName,
        selectedOperator,selectedValue, needTimeInSec = true , usePortal=true, defaultQuery=false, onPlaceholderTextChange} = props;

    const [activeTime,setActiveTime]=useState(i18n.language?.includes('fr') ? '00:00' : '12:00 AM');
    const [isShow,setIsShow]=useState(true);
    const [selectedTime,setSelectedTime]=useState(selectedValue ? i18n.language?.includes('fr') ? moment(selectedValue).format('HH:mm') : moment(selectedValue).format('hh:mm A') : '');
    const [selectedDate,setSelectedDate]=useState(selectedValue ? selectedValue : null);
    const [dateBoxError,setDateBoxError]=useState('');
    const[currentSelectedDateTimeText,setCurrentSelectedDateTimeText] = useState(null);
    const suggestBoxRef  = useRef(null);
    const DateBoxRef  = useRef(null);
    const {t} = useTranslation();

    const onTimeSelect = (time) => {
        setSelectedTime(time);
        let selectedFormattedDate;
        if(selectedDate) {
            selectedFormattedDate = moment(selectedDate).format(`YYYY-MM-DD`);
        }else{
            selectedFormattedDate = moment().format(`YYYY-MM-DD`);
        }
        const formatTime = i18n.language?.includes('fr') ? moment(time,'hh:mm A').format('HH:mm:ss') : moment(time,'hh:mm A').format('HH:mm:ss');
        const formattedDate = selectedFormattedDate+`T${formatTime}`;
        setSelectedDate(formattedDate);
        setCurrentSelectedDateTimeText(moment(formattedDate,`YYYY-MM-DDT${ i18n.language?.includes('fr') ? 'HH:mm' : 'hh:mm A'}`)
            .format(i18n.language?.includes('fr') ? DATE_TIME_FORMAT_WITHOUT_SEC_FR : DATE_TIME_FORMAT_WITHOUT_SEC));
        onItemSelected(formattedDate);
        setIsShow(false);
    };

    const onDateSelect=(date)=>{
        console.log("Date:",date);
        if(date) {
            try {
                const formatTime = i18n.language?.includes('fr') ? moment(selectedTime ? selectedTime : '00:00', 'HH:mm').format('HH:mm:ss') :
                    moment(selectedTime ? selectedTime : '12:00 AM', 'hh:mm A').format('HH:mm:ss');
                const formattedDate = moment(date).format(`YYYY-MM-DD`) + `T${formatTime}`;
                setSelectedDate(formattedDate);
                setCurrentSelectedDateTimeText(moment(formattedDate,`YYYY-MM-DDT${ i18n.language?.includes('fr') ? 'HH:mm' : 'hh:mm A'}`)
                    .format(i18n.language?.includes('fr') ? DATE_TIME_FORMAT_WITHOUT_SEC_FR : DATE_TIME_FORMAT_WITHOUT_SEC));
                onItemSelected(formattedDate);
                !isDateTimePicker && setIsShow(false);
            }catch(error){
                console.log("Error:",error);
            }
        }
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
        if(currentSelectedDateTimeText != null){
            return currentSelectedDateTimeText;
        }
        if(!selectedDate){
            return '';
        }
        let timeFormat = selectedTime ? selectedTime: i18n.language?.includes('fr') ? '00:00' : '12:00 AM';
        let formattedDate= selectedDate? i18n.language?.includes('fr') ?
            moment(selectedDate,'YYYY-MM-DDTHH:mm:ss').format(DATE_FORMAT_FR) : moment(selectedDate,'YYYY-MM-DDTHH:mm:ss').format(DATE_FORMAT):'';
        let formattedDateWithTime= formattedDate +' '+timeFormat;
        return isDateTimePicker ? formattedDateWithTime : formattedDate;
    };

    const setDateTimeValue = () => {
        const dateTimeStr = getLatestDateTime();

        const dateValue = moment(dateTimeStr,i18n.language?.includes('fr') ? DATE_TIME_FORMAT_WITHOUT_SEC_FR : DATE_TIME_FORMAT_WITHOUT_SEC, true);
        if (dateValue.isValid()) {
            onDateSelect(dateValue.toDate());
            let newTime = i18n.language?.includes('fr') ? moment(dateTimeStr, DATE_TIME_FORMAT_WITHOUT_SEC_FR).format('HH:mm') : moment(dateTimeStr, DATE_TIME_FORMAT_WITHOUT_SEC).format('hh:mm A');
            newTime && setSelectedTime(newTime);
        }else{
            setDateBoxError(t('INVALID_VALUE_MSG', {fieldName: fieldName}))
        }
    };

    useEffect(()=>{
        let timeSlots=getTimeSlots();
        let currentTime= i18n.language?.includes('fr') ? moment().format('HH mm').split(' ') : moment().format('hh mm A').split(' ');
        let matchingSlot =timeSlots.find(t=>{
            return t.startsWith(currentTime[0]) && t.endsWith(currentTime[2])
        });
        setActiveTime(matchingSlot);
    },[]);

    const onTextChange=(e)=> {
        onPlaceholderTextChange && onPlaceholderTextChange(e);
        setCurrentSelectedDateTimeText(e);
        // let datePattern = isDateTimePicker && selectedOperator !== 'ON'? i18n.language?.includes('fr') ?
        //     /^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{1,2}/ :
        //     /^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{1,2} [AP]M/:
        //     /^\d{2}\/\d{2}\/\d{4}$/;
        const datePattern = moment(e,i18n.language?.includes('fr') ? DATE_TIME_FORMAT_WITHOUT_SEC_FR : DATE_TIME_FORMAT_WITHOUT_SEC,true);
        if (!datePattern.isValid()) {
            setDateBoxError(t('INVALID_VALUE_MSG', {fieldName: fieldName}))
        } else {
            setDateBoxError('');
        }
    };

    let selectedComponent= [isShow && <DatePicker className={styles.datePicker} locale={i18n.language?.includes('fr') ? 'fr' : 'en'} localeUtils={MomentLocaleUtils} reverseMonthAndYearMenus={true} value={selectedDate ? new Date(selectedDate) : null} onChange={onDateSelect} minDate={new Date('01/01/1900')} maxDate={new Date('01/01/2099')} />];
    if(isDateTimePicker){
        selectedComponent = [ isShow && <>
            <DatePicker className={styles.datePicker} locale={i18n.language?.includes('fr') ? 'fr' : 'en'} localeUtils={MomentLocaleUtils} reverseMonthAndYearMenus={true} value={selectedDate ? new Date(selectedDate) : null} onChange={onDateSelect}  minDate={new Date('01/01/1900')}  maxDate={new Date('01/01/2099')} />
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
                    query={defaultQuery && selectedValue ? i18n.language?.includes('fr') ?  moment.utc(selectedValue).format('HH:mm') : moment.utc(selectedValue).format('hh:mm A') : ''}
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
        </>
        ];
    }

    return(
        <div style={{border: 'solid 1px #cfe5fa', width:popoverWidth, height: "100%"}}>
            <Tooltip content={errorText || dateBoxError } position={'right'} className={styles.tooltip}
                     targetProps={{className: styles.tooltipTarget}} popoverClassName={styles.tooltipStyle}>
                <Suggest
                    ref={DateBoxRef}
                    itemRenderer={(item, itemProps) => {
                        return item && <div  className={styles.dateContainer}>{item}</div>
                    }}
                    autoFocus={ autoFocus|| false }
                    inputProps={{
                        placeholder : selectedValue ? isDateTimePicker ? (!i18n.language.includes('fr')) ?
                            moment.utc(selectedValue).format(DATE_TIME_FORMAT_WITHOUT_SEC) :
                            moment.utc(selectedValue).format(DATE_TIME_FORMAT_WITHOUT_SEC_FR) : moment(selectedValue).format(DATE_FORMAT) : '',
                        autoFocus: autoFocus||false,
                        rightElement:
                            <div className={styles.arrowIconBox}>
                                {
                                    errorText||dateBoxError ? <div className={styles.errorWrapper} onClick={onDateArrowClick}>
                                            <button className={styles.errorIcon} onClick={onDateArrowClick}/><Icons icon={ICONS.ARROWS_DOWN_DARK}/></div>
                                        : <div className={styles.arrowBox} onClick={onDateArrowClick}><Icons icon={ICONS.ARROWS_DOWN_DARK}/></div>
                                }
                            </div>,

                        onBlur:()=>{
                            setDateTimeValue();
                        },
                    }}
                    onQueryChange={onTextChange}
                    inputValueRenderer={(item) => {return item}}
                    items={selectedComponent}
                    selectedItem={getLatestDateTime()}
                    query={selectedTime || selectedDate ? getLatestDateTime() : selectedValue ?
                        isDateTimePicker ?
                            moment.utc(selectedValue).format(needTimeInSec ? DATE_TIME_FORMAT : (!i18n.language.includes('fr')) ? DATE_TIME_FORMAT_WITHOUT_SEC : DATE_TIME_FORMAT_WITHOUT_SEC_FR):
                            moment(selectedValue).format(DATE_FORMAT):
                        ''}
                    fill={true}
                    popoverProps={{minimal: true, usePortal: usePortal, overflow: "unset"}}
                    className={errorText && styles.errorInputBox}
                />
            </Tooltip>
        </div>
    )
};