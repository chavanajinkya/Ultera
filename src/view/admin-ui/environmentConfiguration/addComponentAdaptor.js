import {ConfirmationDialog, HeaderActions, Icons, InputBox} from "../../../components";
import styles from "./environmentConfiguration.module.scss";
import React, {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {ICONS} from "../../../utils/iconNames";
import _ from "lodash";
import {Checkbox} from "@blueprintjs/core";
import {AutoSelect} from "../../../components/autoSelect";
import {getEnvironmentList} from "../../../api";
import {INPUT_TYPE} from "../../../utils/common";

export const AddComponentAdaptor = ({enableAddAdaptorPopup, setEnableAddAdaptorPopup}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const {selectedAdaptorsData} = useSelector((state) => state.envConfig);
    const {environmentList} = useSelector((state) => state.dashboard);
    const [environmentError, setEnvironmentError] = useState('');
    const [adaptorNameErrorState, setAdaptorNameErrorState] = useState('');

    useEffect(() => {
        const fetchData = async () => {
           // await getEnvironmentList()
        }
        fetchData()
    }, []);

    const handleOkClick = async () => {
        setEnableAddAdaptorPopup(false);
    };
    const onClose = () =>{
        setEnableAddAdaptorPopup(false);
    };
    const onChangeEnabled = (e) =>{
        console.log("e", e);
        //setSelectedEnabledValue()
    };
    const onEnvironmentSelected = () =>{

    };

    const onEnvQueryChange = () =>{

    };
    const onAdaptorNameChange = () =>{

    };
    const onSchedulerExpChange = () =>{

    };

    return (
        <>
            {enableAddAdaptorPopup &&
            <ConfirmationDialog
                width={750}
                height={window.screen.height > 1000 && 700}
                divideByY={12}
                divideByX={4}
                showDialog={true}
                headerText={`Ultera: ${t('admin.envconfig.component.adaptor.title')}`}
                onClose={onClose}
                body={
                    <div className={styles.parentDiv}>
                        <div className={styles.subHeader}>
                            <div className={styles.headerLabelBox}>
                                <Icons icon={ICONS.MODULE_PREFERENCES}/>
                                <div
                                    className={styles.headerText}>{t('admin.envconfig.component.adaptor.title')}</div>
                            </div>
                            <div className={styles.requiredText}>* Required</div>
                        </div>
                        <div className={styles.firstHalfStyle}>
                            <div className={styles.targetedBox}>
                                <label className={styles.targetText}>{t('label.viewEnabled.enable')}</label>
                                <Checkbox style={{marginBottom: 5}} value={selectedAdaptorsData.enabled} onChange={onChangeEnabled} />
                            </div>
                            <div className={styles.targetedBox}>
                                <label className={styles.targetText}><div className={styles.requiredText}>* </div>{t('admin.envmgt.export.environment.label')}</label>
                                <div className={styles.autoSelectParent}>
                                <AutoSelect
                                    loadData={null/*loadEnvironments*/}
                                    loading={false}
                                    popoverWidth={250}
                                    editable={false}
                                    errorText={environmentError}
                                    dataList={environmentList}
                                    onItemSelected={onEnvironmentSelected}
                                    selectedValue={selectedAdaptorsData.selectedEnvironment}
                                    onSelectQueryChange={onEnvQueryChange}
                                    tooltipPosition={'left'} setErrorText={setEnvironmentError}
                                    unValidText={t('validation_text_invalid_required')}
                                    usePortal={true}
                                />
                                </div>
                            </div>
                            <div className={styles.targetedBox}>
                                <label className={styles.targetText}><div className={styles.requiredText}>* </div>{t('admin.envconfig.component.adaptors.name.label')}</label>
                                <InputBox
                                    inputType={INPUT_TYPE.TEXT}
                                    isDisabled={false}
                                    onChange={onAdaptorNameChange}
                                    value={selectedAdaptorsData.enteredName}
                                    width={"370px"}
                                    height={"19px"}
                                    style={{border: adaptorNameErrorState && "1px solid red"}}
                                    className={styles.envInputStyle}
                                    errorText={adaptorNameErrorState}
                                    maxLength={50}
                                    popoverWidth={styles.popoverCss}
                                    tooltipPosition={"left-top"}
                                />
                            </div>
                            <div className={styles.targetedBox}>
                                <label className={styles.targetText}><div className={styles.requiredText}>* </div>{t('admin.envconfig.component.adaptors.process.label')}</label>
                                <div className={styles.autoSelectParent}>
                                    <AutoSelect
                                        loadData={null/*loadEnvironments*/}
                                        loading={false}
                                        popoverWidth={250}
                                        editable={false}
                                        errorText={environmentError}
                                        dataList={environmentList}
                                        onItemSelected={onEnvironmentSelected}
                                        selectedValue={selectedAdaptorsData.selectedProcess}
                                        onSelectQueryChange={onEnvQueryChange}
                                        tooltipPosition={'left'} setErrorText={setEnvironmentError}
                                        unValidText={t('validation_text_invalid_required')}
                                        usePortal={true}
                                    />
                                </div>
                            </div>
                            <div className={styles.targetedBox}>
                                <label className={styles.targetText}><div className={styles.requiredText}>* </div>{t('admin.envconfig.component.adaptors.queue.label')}</label>
                                <div className={styles.autoSelectParent}>
                                    <AutoSelect
                                        loadData={null/*loadEnvironments*/}
                                        loading={false}
                                        popoverWidth={250}
                                        editable={false}
                                        errorText={environmentError}
                                        dataList={environmentList}
                                        onItemSelected={onEnvironmentSelected}
                                        selectedValue={selectedAdaptorsData.selectedWorkQueue}
                                        onSelectQueryChange={onEnvQueryChange}
                                        tooltipPosition={'left'} setErrorText={setEnvironmentError}
                                        unValidText={t('validation_text_invalid_required')}
                                        usePortal={true}
                                    />
                                </div>
                            </div>
                            <div className={styles.targetedBox}>
                                <label className={styles.targetText}><div className={styles.requiredText}>* </div>{t('admin.envconfig.component.adaptors.indexorder.label')}</label>
                                <div className={styles.autoSelectParent}>
                                    <AutoSelect
                                        loadData={null/*loadEnvironments*/}
                                        loading={false}
                                        popoverWidth={250}
                                        editable={false}
                                        errorText={environmentError}
                                        dataList={environmentList}
                                        onItemSelected={onEnvironmentSelected}
                                        selectedValue={selectedAdaptorsData.selectedIndexOrder}
                                        onSelectQueryChange={onEnvQueryChange}
                                        tooltipPosition={'left'} setErrorText={setEnvironmentError}
                                        unValidText={t('validation_text_invalid_required')}
                                        usePortal={true}
                                    />
                                </div>
                            </div>
                            <div className={styles.targetedBox}>
                                <label className={styles.targetText}><div className={styles.requiredText}>* </div>{t('admin.envconfig.component.adaptors.expression.label')}</label>
                                <InputBox
                                    inputType={INPUT_TYPE.TEXT}
                                    isDisabled={false}
                                    onChange={onSchedulerExpChange}
                                    value={selectedAdaptorsData.enteredSchedulerExpression}
                                    width={"370px"}
                                    height={"19px"}
                                    style={{border: adaptorNameErrorState && "1px solid red"}}
                                    className={styles.envInputStyle}
                                    errorText={adaptorNameErrorState}
                                    maxLength={50}
                                    popoverWidth={styles.popoverCss}
                                    tooltipPosition={"left-top"}
                                />
                            </div>
                            <div className={styles.targetedBox}>
                                <label className={styles.targetText}><div className={styles.requiredText}>* </div>{t('admin.envconfig.component.adaptors.instances.label')}</label>
                                <InputBox
                                    inputType={INPUT_TYPE.TEXT}
                                    isDisabled={false}
                                    onChange={onAdaptorNameChange}
                                    value={selectedAdaptorsData.enteredNumOfInstances}
                                    width={"370px"}
                                    height={"19px"}
                                    style={{border: adaptorNameErrorState && "1px solid red"}}
                                    className={styles.envInputStyle}
                                    errorText={adaptorNameErrorState}
                                    maxLength={50}
                                    popoverWidth={styles.popoverCss}
                                    tooltipPosition={"left-top"}
                                />
                            </div>
                            <div className={styles.targetedBox}>
                                <label className={styles.targetText}><div className={styles.requiredText}>* </div>{t('admin.envconfig.component.adaptors.type.label')}</label>
                                <div className={styles.autoSelectParent}>
                                    <AutoSelect
                                        loadData={null/*loadEnvironments*/}
                                        loading={false}
                                        popoverWidth={250}
                                        editable={false}
                                        errorText={environmentError}
                                        dataList={environmentList}
                                        onItemSelected={onEnvironmentSelected}
                                        selectedValue={selectedAdaptorsData.selectedAdaptorType}
                                        onSelectQueryChange={onEnvQueryChange}
                                        tooltipPosition={'left'} setErrorText={setEnvironmentError}
                                        unValidText={t('validation_text_invalid_required')}
                                        usePortal={true}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.optionStyle}>
                            <div className={styles.optionsText}>{t('admin.envconfig.component.adaptors.parammap.label')}</div>
                            <div className={styles.parentOptions}>
                                <div className={styles.displayInLineStyle}>
                                    <label className={styles.messageStyle}>{t('admin.envconfig.component.adaptors.noparams')}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                transitionDuration={300}
                isCloseButtonShown={true}
                yesButtonText={t('btn.common.ok')}
                onYesBtnClick={handleOkClick}
            />
            }
        </>
    );
};
