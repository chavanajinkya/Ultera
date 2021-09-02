import styles from "./table.module.scss";
import {InputBox} from "../inputBox";
import {Button} from "@blueprintjs/core";
import {Icons} from "../icons";
import {ICONS} from "../../utils/iconNames";
import {Table} from "./Table";
import {ConfirmationDialog} from "../confirmationDialog";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {INPUT_TYPE} from "../../utils/common";
import {phoneNumberMasking, phoneNumberUnMasking} from "../../utils/commonFunctions";
import i18n from "../../i18n";

export  const ValueBuilder=(props)=>{
    const {selectedField, onOkClick, handleClose, showValueBuilderDialog}=props;
    const {t} = useTranslation();
    const [valueBuilderData, setValueBuilderData] = useState({value:''});
    const [valueBuilderDataArray, setValueBuilderDataArray] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [validationError, setValidationError] = useState('');

    useEffect(()=>{
        if(selectedField?.source){
            let clonedArray=[...valueBuilderDataArray];
            selectedField?.source.map(d=>clonedArray.push({value: selectedField.viewType==='PHONENUMBER_TEXTBOX'? phoneNumberMasking(d) :
                    selectedField.viewType==='NUMBER_TEXT_BOX'? parseFloat(d).toFixed(2).replace('.',','): d}));
            setValueBuilderDataArray(clonedArray)
        }
    },[]);

    const addSearchText=()=>{
        let clonedData = [...valueBuilderDataArray];
        if(selectedRow) {
            let index=clonedData.findIndex(d1=>d1.value===selectedRow.value)
            clonedData[index] = {value: selectedField.viewType==='PHONENUMBER_TEXTBOX'? phoneNumberMasking(valueBuilderData.value):
                    selectedField.viewType==="NUMBER_TEXT_BOX" ? parseFloat(valueBuilderData.value).toFixed(2).replace('.',','):valueBuilderData.value}
        } else if(valueBuilderData) {
            clonedData.push({value: selectedField.viewType==='PHONENUMBER_TEXTBOX' ? phoneNumberMasking(valueBuilderData.value):
                    selectedField.viewType==="NUMBER_TEXT_BOX" ? parseFloat(valueBuilderData.value).toFixed(2).replace('.',','):valueBuilderData.value});
        }
        setValueBuilderDataArray(clonedData);
        setValueBuilderData({value:''})
        setSelectedRow(null);
    }

    const removeSelectedValue=()=>{
        if(selectedRow) {
            let d = [...valueBuilderDataArray];
            let index = d.findIndex(d1 => d1.value === selectedRow.value);
            d.splice(index, 1);
            setValueBuilderDataArray(d);
            setValueBuilderData({value: ''})
            setSelectedRow(null)
        }
    }

    const onInputTextChange=(e)=>{
        setValueBuilderData({value : e.target.value});
        if(selectedField.viewType==="INTEGER_TEXT_BOX") {
            const pattern = /^[0-9]+$/;
            if (!pattern.test(e.target.value)) {
                setValidationError('The value entered is not valid.')
            } else  if(e.target.value < -2147483648 || e.target.value > 2147483647){
                setValidationError(t('RANGE_BETWEEN_MSG',{labelText:'Source',min:'-2147483648',max:'2147483647'}))
            } else {
                setValidationError('');
            }
        }else  if(selectedField.viewType==="NUMBER_TEXT_BOX") {
            // const pattern = /^[+-]?([0-9]*[.])?[0-9]+$/;
            if(i18n?.language.includes('fr')){
                const pattern = /^[+-]?([0-9]*[,])?[0-9]+$/;
                const pattern1 = /^[+-]?([0-9]*[,])/;
                if (!pattern.test(e.target.value) && !pattern1.test(e.target.value)) {
                    setValidationError('The value entered is not valid.')
                } else if (e.target.value < -9000000000000000 || e.target.value > 9000000000000000) {
                    setValidationError(t('RANGE_BETWEEN_MSG', {
                        labelText: 'Source',
                        min: '-9000000000000000.00',
                        max: '9000000000000000.00'
                    }))
                } else {
                    setValidationError('');
                }
            }else {
                if (isNaN(e.target.value)) {
                    setValidationError('The value entered is not valid.')
                } else if (e.target.value < -9000000000000000 || e.target.value > 9000000000000000) {
                    setValidationError(t('RANGE_BETWEEN_MSG', {
                        labelText: 'Source',
                        min: '-9000000000000000.00',
                        max: '9000000000000000.00'
                    }))
                } else {
                    setValidationError('');
                }
            }
        }
    }

    const handleOk=()=>{
        let data=valueBuilderDataArray.map(d=>selectedField.viewType==='PHONENUMBER_TEXTBOX'? phoneNumberUnMasking(d.value):
            selectedField.viewType==="NUMBER_TEXT_BOX" ? parseFloat(d.value).toFixed(2) : selectedField.viewType==="INTEGER_TEXT_BOX" ? Number(d.value) :d.value);
        onOkClick(data);
        handleClose();
    }
    const handleCancel=()=>{
        handleClose();
    }

    const handleRemove=()=>{
        removeSelectedValue();
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if(e.shiftKey && e.key==='Enter') {
                handleOk();
            } else if(e.key==='Enter' && valueBuilderData.value==='') {
                handleCancel();
            }
        };
            window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [valueBuilderDataArray,valueBuilderData]);

    return(
        showValueBuilderDialog && <ConfirmationDialog
            showDialog={true}
            width={500}
            divideByX={3}
            divideByY={10}
            headerText={t('value.builder.header')}
            onClose={handleClose}
            noButtonText={t('btn.common.cancel')}
            onNoBtnClick={()=>handleCancel()}
            yesButtonText={t('btn.translationOk.ok')}
            onYesBtnClick={()=>handleOk()}
            yesButtonTooltip={t('valueBuilder.submit')}
            noButtonTooltip={t('valueBuilder.cancel')}
            isCloseButtonShown={true}
            isValueBuilderDialog={true}
            // isDismissOnEnterKey={valueBuilderData.value===''}
            body={
                <div>
                    <div className={styles.dialogSubHeader}>
                        <div className={styles.headerLabelBox}>
                           <div tabIndex={0} style={{width:'220px'}}> <InputBox
                                inputType={selectedField.viewType==='PHONENUMBER_TEXTBOX'? INPUT_TYPE.PHONE: INPUT_TYPE.TEXT}
                                autoFocus={true}
                                errorText={validationError}
                                popoverWidth={styles.valueBuilderPopoverCss}
                                height={'20px'}
                                inputTooltip={t('value.builder.textBox.tooltip')}
                                placeholder={t('valueBuilder.enterText')}
                                onChange={(d)=>onInputTextChange(d)}
                                onInputSubmit={()=>{!validationError && addSearchText()}}
                                value={valueBuilderData.value} /></div>
                            <Button
                                title={selectedRow ? t('APPLY_TITLE') : t('valueBuilder.addTitle')}
                                disabled={valueBuilderData.value === ''  || validationError}
                                className={styles.AddButton}
                                text={selectedRow? t('toolseo.toolname.common.apply'):t('label.columnchooserAdd.add')}
                                onClick={() =>addSearchText()}
                                icon={selectedRow? <Icons icon={ICONS.GRID_OK}/>:<Icons icon={ICONS.GRID_ADD} />}/>
                            <Button
                                title={t('valueBuilder.removeTitle')}
                                disabled={!selectedRow}
                                className={styles.RemoveButton}
                                text={t('label.columnchooserRemove.remove')}
                                onClick={() =>removeSelectedValue()}
                                icon={<Icons icon={ICONS.GRID_REMOVE}/>}/>
                        </div>
                    </div>
                    <div className={styles.dialogTableContent}>
                        <Table
                            tableStyle={{width:'325px'}}
                            searchResultCol={[{name:'value', caption:t('case.viewer.grid.name.value'), colWidth:'325px'}]}
                            tableData={valueBuilderDataArray}
                            actionsOnTableRowClick={(d)=> {
                                setSelectedRow(d);
                                setValueBuilderData(d);
                            }}
                            handleRemove={handleRemove}
                            isHideNoSearchResultMsg={true}/>
                    </div>
                </div>
            }
        />
    )
}