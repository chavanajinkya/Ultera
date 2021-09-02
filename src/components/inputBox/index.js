import React from 'react'
import {Icon, InputGroup, Tooltip} from "@blueprintjs/core";
import styles from './inputBox.module.scss';
import {Icons} from "../icons";
import {INPUT_TYPE,} from "../../utils/common";
import {phoneNumberMasking} from '../../utils/commonFunctions';

export const InputBox=(props)=>{
    const{className, value, isDisabled, onChange, onBlur, errorText, tooltipPosition,inputType, iconName, maxLength,fromFilterComponent,onInputSubmit=()=>{},
        placeholder, width, onIconClick, height, autoFocus, onKeyPressMethod, style, iconTooltip='',inputTooltip, popoverWidth}=props;

    const onEnterClick = (event, onKeyPressMethod) => {
        event.key === 'Enter' && onKeyPressMethod()
    };


    return <div  className={styles.inputBoxContainer}
                 style={{'--height': height, '--width': width}}>
        <Tooltip transitionDuration={1000} content={errorText} position={tooltipPosition ?? 'right'} popoverClassName={popoverWidth && popoverWidth}>
            <InputGroup
                title={inputTooltip}
                autoFocus={autoFocus ?? false}
                type={inputType}
                maxlength={inputType===INPUT_TYPE.PHONE && 14}
                className={className? className : errorText? styles.errorInputBox : maxLength? styles.loginInputBox : styles.inputBox }
                onKeyDown={(evt) => inputType===INPUT_TYPE.NUMBER && ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
                value={inputType===INPUT_TYPE.PHONE? phoneNumberMasking(value): value}
                disabled={isDisabled}
                onChange={onChange}
                onKeyPressCapture={(e)=>e.key === "Enter" && onInputSubmit()}
                onBlur={onBlur}
                rightElement={errorText? <button title={iconTooltip} className={styles.errorIcon} style={{'--height': fromFilterComponent ? "15px" :height}}/>: typeof iconName === "object"? <div title={iconTooltip} onClick={onIconClick} style={{cursor:'pointer'}}><Icons icon={iconName}/></div> :
                    typeof iconName === "string" ? <div onClick={onIconClick} className={styles.iconStyle}><Icon icon={iconName} color={"#0673b8"}/></div>  : null}
                maxLength={maxLength}
                placeholder={placeholder}
                style={style && style}
                onKeyPress={onKeyPressMethod ? event => onEnterClick(event, onKeyPressMethod) : null}
            />
    </Tooltip>
    </div>
};