import React, {useState, useRef, useEffect} from 'react';
import styles from "./autoSelect.module.scss";
import {Suggest} from "@blueprintjs/select";
import {ICONS} from "../../utils/iconNames";
import {Icons} from "../icons";
import {MenuItem, Tooltip} from "@blueprintjs/core";

export const AutoSelect = (props) => {
    const {
        selectedValue, dataList, rightReadOnlyIcon, rightSelectIcon, errorText, setErrorText=()=>{}, usePortal= true, queryFilterFlag = true,
        onItemSelected=()=>{}, editable, formLabel, loading, tooltipPosition,onSelectQueryChange, onBlurEventHandle, needBlur=false, currentSelectedIndex,
        unValidText, loadData, popoverWidth,isDisabled=false, onArrowClick, height,autoFocus,showInputTextCenterAlign,showListOnFocus=false,placeHolderText='',
        isEnterKeyPressed=false,setIsEnterKeyPressed=()=>{}, isFilter=false,onInputSubmit=()=>{}
    } = props;

    const [errorLocalText, setErrorLocalText] = useState('');
    const [editOn, setEditOn] = useState(false);
    const [showItemsList, setShowItemsList] = useState(showListOnFocus);
    const [itemsList, setItemsList] = useState([]);
    const suggestBoxRef  = useRef(null);
    const [currentSelectedActiveItem, setCurrentSelectedActiveItem] = useState({});

    useEffect(()=>{
        setItemsList(dataList);
    }, []);

    useEffect(()=>{
        setItemsList(dataList);
    }, [dataList?.length]);

    const onSelect = (item, e) => {
        e.stopPropagation();
        setEditOn(false);
        currentSelectedIndex !==undefined ? onItemSelected(item, e, currentSelectedIndex) : onItemSelected(item, e);
        setItemsList(dataList);
        setErrorText('');
        setErrorLocalText('')
    };

    const onEdit = () => {
        if (loadData) {
            loadData();
        }
        setEditOn(true);
    };

    const onArrowDownClick = () => {
        //setErrorText('');
        onArrowClick && currentSelectedIndex ? onArrowClick(currentSelectedIndex) : onArrowClick && onArrowClick();
        setShowItemsList(true);
        setItemsList(dataList);
        suggestBoxRef.current?.inputElement.focus()
    };

    const onQueryChange = (query, event) => {
        if(query === ''){
            currentSelectedIndex !==undefined ? onItemSelected('', event, currentSelectedIndex) : onItemSelected('', event);
        }
        setShowItemsList(true);
        const filtered = dataList.filter(data => (data.description ?? data.name ?? data.caption).toLowerCase()?.startsWith(query?.toLowerCase()));
        setItemsList(filtered);
        if(filtered.length === 0) {
            setErrorText(unValidText);
            setErrorLocalText(unValidText);
        }else{
            setErrorText('');
            setErrorLocalText('')
        }
    };

    const onSelectQuery=(query, event)=>{
        setShowItemsList(true);
        currentSelectedIndex !==undefined ? onSelectQueryChange(query, event, currentSelectedIndex) : onSelectQueryChange(query, event)
    };

    if (!editable || editOn) {
        return (
            <div className={styles.suggestBox} style={{'--height': height}}>
                <Tooltip content={errorText ? errorText : errorLocalText} position={tooltipPosition ?? 'right'} className={styles.tooltip}
                         targetProps={{className: styles.tooltipTarget}} popoverClassName={styles.tooltipStyle}>
                    <Suggest ref={suggestBoxRef}
                             itemRenderer={(item, { modifiers, handleClick, index }) => (
                                 showItemsList ? <MenuItem id={index} tabIndex={0}
                                     style={{
                                         height:'20px',
                                         width: popoverWidth,
                                         border: "1px solid transparent",
                                         minHeight:'24px',
                                         fontWeight: ((selectedValue && selectedValue.id && item.id === selectedValue.id) ||
                                             selectedValue && selectedValue.caption && item.caption === selectedValue.caption)? 'bold' : 'normal',
                                     }}
                                     className={styles.selectOption}
                                     active={modifiers.active}
                                     onClick={handleClick}
                                     text={item.value ?? item.caption ?? item.sortByName ?? item.envName ?? item.description ?? item.name ?? item.displayName}
                                     key={item.value ?? item.caption ?? item.sortByName ?? item.envName ?? item.description ?? item.name ?? item.displayName}
                                 />:null
                             )}
                             onKeyUp={e => {
                                 if(e.keyCode === 40){
                                     setCurrentSelectedActiveItem(suggestBoxRef?.current?.queryList?.state?.activeItem)
                                 } else if (e.keyCode === 32) {
                                    suggestBoxRef.current?.handleItemSelect(currentSelectedActiveItem, e)
                                 }else if(e.keyCode === 38){
                                     setCurrentSelectedActiveItem(suggestBoxRef?.current?.queryList?.state?.activeItem)
                                 }else if(e.keyCode === 13){
                                     setIsEnterKeyPressed(!isEnterKeyPressed)
                                 }
                             }}
                             closeOnSelect={true}
                             items={itemsList}
                             itemsEqual={'id'}
                             small={true}
                             selectedItem={selectedValue}
                             onItemSelect={onSelect}
                             onQueryChange = {onSelectQueryChange ?  (query, event)=>{onSelectQuery(query, event)} : (query, event)=>{onQueryChange(query, event)}}
                             resetOnClose={false}
                             inputValueRenderer={(item) => {
                                 return item.value ?? item.caption ?? item.sortByName ?? item.envName ?? item.description ?? item.name ?? item.displayName
                             }}
                             query={queryFilterFlag === true ? (selectedValue === null ? '' : (selectedValue?.value ?? selectedValue?.caption ?? selectedValue?.sortByName ?? selectedValue?.envName ?? selectedValue?.description ?? selectedValue?.name ?? selectedValue?.displayName)) : ''}
                             inputProps={{
                                 onBlur:()=>{if(needBlur)onBlurEventHandle()},
                                 autoFocus: autoFocus||false,
                                 small: true,
                                 disabled: isDisabled,
                                 placeholder: placeHolderText,
                                 style: {height: height},
                                 rightElement:
                                     <div className={styles.arrowIconBox}>
                                         {
                                             loading ? <div className={styles.loadingGifStyle}/> :
                                                 (errorText || errorLocalText) ? <div className={styles.errorWrapper} onClick={onArrowDownClick}>
                                                         <button className={styles.errorIcon}  onClick={onArrowDownClick}/><Icons icon={ICONS.ARROWS_DOWN_DARK}/></div>
                                                 : <div className={isDisabled ? styles.arrowBoxDisabled :styles.arrowBox} onClick={onArrowDownClick}><Icons icon={ICONS.ARROWS_DOWN_DARK}/></div>
                                         }

                                     </div>
                             }}
                             className={showInputTextCenterAlign?`${(errorText || errorLocalText) && styles.errorInputBox} ${styles.centeredInput}`:`${(errorText || errorLocalText) && styles.errorInputBox}`}
                             fill={true}
                             popoverProps={{minimal: true, usePortal: usePortal, modifiers:{
                                     preventOverflow: { enabled: false}, flip: { enabled: false} }}}
                             onKeyPressCapture={(e)=>e.key === "Enter" && onInputSubmit()}
                    />
                </Tooltip>
            </div>
        )
    } else {
        let rightIcon = '';
        if (loading) {
            rightIcon = styles.loadingGifStyle;
        }
        return (
            <div className={styles.contentBox} onClick={() => onEdit()}>
                <div>{selectedValue ? selectedValue.name : ''}</div>
                {
                    rightIcon ? <div className={rightIcon}/>
                        :
                        <Icons icon={rightReadOnlyIcon}/>
                }

            </div>
        )
    }

};