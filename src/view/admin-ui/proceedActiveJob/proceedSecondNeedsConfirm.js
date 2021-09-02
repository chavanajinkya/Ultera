import styles from "./proceedActiveJob.module.scss";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {H5, Label} from "@blueprintjs/core";
import {ReflexContainer, ReflexElement, ReflexSplitter} from "react-reflex";
import _ from "lodash";
import {AutoSelect} from "../../../components/autoSelect";
import {ICONS} from "../../../utils/iconNames";
import {getTargetRealms, getTargets} from "../../../api";
import {updateProceedNCMappings, updateTargetRealmsArr, updateTargetsArr} from "../../../slices/envManagementSlice";
import {ConfirmationDialog} from "../../../components/confirmationDialog";

export const ProceedSecondNeedsConfirm = ({proceedJobContent}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [currentRealmError, setCurrentRealmError] = useState('');
    const [targetOptionError, setTargetOptionError] = useState('');
    const [objStoreError, setObjStoreError] = useState('');
    const [currentIndex, setCurrentIndex] = useState(null);
    const {objectStores, proceedNCMappings, selectedTargetRealmArr, selectedTargetOptions} = useSelector((state) => state.envManagement);

    useEffect(()=>{

    },[]);

    const onCurrentRealmSelected = (data, event, currentSelectedIndex) =>{
        if(data) {
            let newProceedMappingArr = JSON.stringify(proceedNCMappings);
            newProceedMappingArr = JSON.parse(newProceedMappingArr);
            newProceedMappingArr.map((mapObject, index)=>{
                if(currentSelectedIndex === index){
                    mapObject.selectedTargetRealm = data;
                }
            });
            dispatch(updateProceedNCMappings(newProceedMappingArr));
            setCurrentRealmError('');
            dispatch(updateTargetRealmsArr([]));
        }else{
            setCurrentIndex(currentSelectedIndex);
            setCurrentRealmError(t('validation_text_invalid_required'))
        }
    };
    const onRealmQueryChange = async (query, event, currentSelectedIndex)=>{
        if(event) {
            const response = await getTargetRealms(query);
            if(response?.data && response.data.length === 0) {
                setCurrentIndex(currentSelectedIndex);
                setCurrentRealmError(t('validation_text_invalid_required'))
            }
        }
    };
    const onTargetRealmArrowDownClick = async () =>{
        await getTargetRealms('');
    };

    const onTargetSelected = (data, event, currentSelectedIndex) =>{
        if(data) {
            let newProceedMappingArr = JSON.stringify(proceedNCMappings);
            newProceedMappingArr = JSON.parse(newProceedMappingArr);
            newProceedMappingArr.map((mapObject, index)=>{
                if(currentSelectedIndex === index){
                    mapObject.selectedTarget = data;
                }
            });
            dispatch(updateProceedNCMappings(newProceedMappingArr));
            setTargetOptionError('');
            dispatch(updateTargetsArr([]));
        }else{
            setTargetOptionError(t('validation_text_invalid_required'))
        }
    };
    const onTargetQueryChange = async (query, event, currentSelectedIndex) =>{
        if(event) {
            const response = await getTargets(proceedNCMappings?.selectedTargetRealm?.name, query);
            if(response?.data && response.data.length === 0){
                setCurrentIndex(currentSelectedIndex);
                setTargetOptionError(t('validation_text_invalid_required'))
            }
        }
    };
    const onTargetArrowDownClick = async () =>{
        await getTargets(proceedNCMappings?.selectedTargetRealm?.name, '');
    };
    const onObjStoreSelected = (data, e, currentSelectedIndex) =>{
        if(data) {
            let newProceedMappingArr = JSON.stringify(proceedNCMappings);
            newProceedMappingArr = JSON.parse(newProceedMappingArr);
            newProceedMappingArr.map((mapObject, index)=>{
                if(currentSelectedIndex === index){
                    mapObject.selectedObjectStore = data;
                }
            });
            dispatch(updateProceedNCMappings(newProceedMappingArr));
            setObjStoreError('');
            dispatch(updateTargetsArr([]));
        }else{
            setCurrentIndex(currentSelectedIndex);
            setObjStoreError(t('validation_text_invalid_required'))
        }
    };

    return (
        <div className={styles.mappingContentDiv}>
            <ReflexContainer orientation="horizontal">
                <ReflexElement flex={0.5} style={{position: "unset"}}>
                    <div className={styles.promoteFirstDiv}>
                        <div className={styles.mappingSubHeader}>
                            <div className={styles.headerLabelBox}>
                                <div className={styles.headerText}>{t('admin.envmgt.mapping.objectstores.title')}</div>
                            </div>
                            <div className={styles.requiredText}>*</div>
                        </div>
                        <div className={styles.sourceHeader}>
                            <H5 className={styles.title1Style}>{t('admin.envmgt.import.mapping.source.title')}</H5>
                            <H5 className={styles.title2Style}>{t('admin.envmgt.import.mapping.target.title')}</H5>
                        </div>
                        {
                            _.map(proceedNCMappings, (mapObject, index)=>
                            {
                                return <>
                                    {  mapObject.type.toLowerCase() === "obj_store" ?
                                        <div className={styles.secondMapping}>
                                            <label className={styles.sourceMapStyle}>{mapObject?.source}</label>
                                            <div className={styles.autoSelectSecondDiv}>
                                                <AutoSelect
                                                    loadData={null}
                                                    loading={false}
                                                    popoverWidth={250}
                                                    editable={false}
                                                    errorText={index === currentIndex && objStoreError}
                                                    dataList={objectStores}
                                                    onItemSelected={onObjStoreSelected}
                                                    currentSelectedIndex={index}
                                                    selectedValue={mapObject?.selectedObjectStore}
                                                    tooltipPosition={'left'} setErrorText={setObjStoreError}
                                                    unValidText={t('validation_text_invalid_required')}
                                                    onArrowClick={onTargetArrowDownClick}
                                                    usePortal={true}
                                                />
                                            </div>
                                        </div> : null
                                    }
                                </>
                            })
                        }
                    </div>
                </ReflexElement>
                <ReflexSplitter className="horizontal-splitter">
                    <div className="horizontal-splitter-thumb"/>
                </ReflexSplitter>
                <ReflexElement flex={0.5} >
                    <div className={styles.promoteSecondDiv}>
                        <div className={styles.mappingSubHeader}>
                            <div className={styles.headerLabelBox}>
                                <div className={styles.headerText}>{t('admin.envmgt.mapping.ldapgroups.title')}</div>
                            </div>
                        </div>
                        <div className={styles.sourceHeader}>
                            <H5 className={styles.title1Style}>{t('admin.envmgt.import.mapping.source.title')}</H5>
                            <H5 className={styles.title1Style}>{t('admin.envmgt.import.mapping.realm.title')}</H5>
                            <H5 className={styles.title2Style}>{t('admin.envmgt.import.mapping.target.title')}</H5>
                        </div>
                        {
                            _.map(proceedNCMappings, (mapObject, index)=>
                            {
                                return <>
                                    {  mapObject.type.toLowerCase() === "ldap_group" ?
                                        <div className={styles.secondMapping}>
                                            <label className={styles.sourceMapStyle}>{mapObject?.source}</label>
                                            <div className={styles.autoSelectSecondDiv} style={{marginRight: 15}}>
                                                <AutoSelect
                                                    loadData={null/*loadEnvironments*/}
                                                    loading={false}
                                                    popoverWidth={250}
                                                    editable={false}
                                                    errorText={index === currentIndex && currentRealmError}
                                                    dataList={selectedTargetRealmArr}
                                                    onItemSelected={onCurrentRealmSelected}
                                                    selectedValue={mapObject?.selectedTargetRealm}
                                                    currentSelectedIndex={index}
                                                    onSelectQueryChange={onRealmQueryChange}
                                                    tooltipPosition={'left'} setErrorText={setCurrentRealmError}
                                                    unValidText={t('validation_text_invalid_required')}
                                                    usePortal={true}
                                                    onArrowClick={onTargetRealmArrowDownClick}
                                                    isFilter={true}
                                                />
                                            </div>
                                            <div className={styles.autoSelectSecondDiv}>
                                                <AutoSelect
                                                    loadData={null/*loadEnvironments*/}
                                                    loading={false}
                                                    popoverWidth={250}
                                                    editable={false}
                                                    errorText={index === currentIndex && targetOptionError}
                                                    dataList={selectedTargetOptions}
                                                    onItemSelected={onTargetSelected}
                                                    selectedValue={mapObject?.selectedTarget}
                                                    currentSelectedIndex={index}
                                                    onSelectQueryChange={onTargetQueryChange}
                                                    tooltipPosition={'left'} setErrorText={setTargetOptionError}
                                                    unValidText={t('validation_text_invalid_required')}
                                                    onArrowClick={onTargetArrowDownClick}
                                                    usePortal={true}
                                                    isFilter={true}
                                                />
                                            </div>
                                        </div> : null
                                    }
                                </>
                            })
                        }
                    </div>
                </ReflexElement>
            </ReflexContainer>
        </div>
    );
};
