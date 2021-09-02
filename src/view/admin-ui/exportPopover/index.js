import {ConfirmationDialog, Icons, InputBox} from "../../../components";
import styles from "./exportPopover.module.scss";
import React, {useEffect, useState} from "react";
import {ICONS} from "../../../utils/iconNames";
import {useTranslation} from "react-i18next";
import {Label, TextArea} from "@blueprintjs/core";
import {INPUT_TYPE} from "../../../utils/common";
import {AutoSelect} from "../../../components/autoSelect";
import _ from "lodash";
import {exportEnvironment, getUpdatedActiveList} from "../../../api/adminSubHeaders";
import {useSelector} from "react-redux";

export const ExportPopoverComponent = ({showPopover, onClose, exportEnvList}) => {
    const {t} = useTranslation();
    const {loading}  = useSelector((state) => state.dashboard);
    const [versionState, setVersionState] = useState('');
    const [descriptionState, setDescriptionState] = useState('');
    const [titleState, setTitleState] = useState('');
    const [showExceptionPopover, setShowExceptionPopover] = useState(false);
    const [environmentError, setEnvironmentError] = useState('');
    const [environmentId, setEnvironmentId] = useState(null);
    const [environmentList, setEnvironmentList] = useState([]);

    useEffect( () => {
        if (exportEnvList.length > 0) {
            const updatedArray = _.map(exportEnvList, data => {
                return {id: data.envId, name: data.envName}
            });
            setEnvironmentList(updatedArray);
        }
    }, []);

    const handleDialogClose = () =>{
        setShowExceptionPopover(false);
    };

    const handleOkClick = async () => {
        if (!environmentId) {
            setShowExceptionPopover(true);
            setEnvironmentError(t('admin_export_env_error_message'))
        } else {
            setEnvironmentError('');
            const exportData = {
                envId: environmentId,
                title: titleState,
                version: versionState,
                comment: descriptionState
            };
            const response = await exportEnvironment(exportData);
            if (response.status === 200) {
                const response = await getUpdatedActiveList();
                if(response.status === 200){
                    onClose()
                }
                setTimeout(async ()=>{
                    await getUpdatedActiveList();
                }, 8000)
            }
        }
    };
    const onEnvTitleChange = (event) =>{
        setTitleState(event.target.value)
    };
    const onEnvVersionChange = (event) => {
        setVersionState(event.target.value)
    };
    const handleDescriptionChange = (event) => {
        setDescriptionState(event.target.value)
    };
    const onEnvironmentSelected = (data) => {
        setEnvironmentId(data.id);
        setEnvironmentError('')
    };
    let selectedObject = null;
    if (environmentId) {
        const objValue = _.filter(environmentList, (item) => {
            return item.id === environmentId
        });
        if (objValue.length > 0) {
            selectedObject = objValue[0]
        }
    }
    if(environmentError){
        selectedObject = null
    }

    return (
        <>
            {showPopover &&
            <ConfirmationDialog
                width={500}
                showDialog={showPopover}
                headerText={`Ultera: ${t('com.ipd.service.envmgt.batch.jobName.export')}`}
                onClose={onClose}
                body={
                    <div>
                        <div className={styles.subHeader}>
                            <div className={styles.headerLabelBox}>
                                <Icons icon={ICONS.ENV_IMPORT}/>
                                <div className={styles.headerText}>{t('com.ipd.service.envmgt.batch.jobName.export')}</div>
                            </div>
                            <div className={styles.requiredText}>* {t('label.common.required')}</div>
                        </div>
                        <div className={styles.contentDiv}>
                            <div className={styles.autoSelectBox}>
                                <div className={styles.requiredText}>*</div>
                                <div className={styles.boldText}>{t('label.envNn.envName')}</div>
                                <div className={styles.autoSelectDiv}>
                                    <AutoSelect
                                        loadData={null/*loadEnvironments*/}
                                        loading={false}
                                        popoverWidth={250}
                                        editable={false}
                                        errorText={environmentError}
                                        rightReadOnlyIcon={ICONS.HOME}
                                        dataList={environmentList}
                                        onItemSelected={onEnvironmentSelected}
                                        selectedValue={selectedObject}
                                        tooltipPosition={'left'} setErrorText={setEnvironmentError}
                                        unValidText={t('admin_export_env_name_error_text')}/>
                                </div>
                            </div>
                            <div className={styles.parentTextDiv}>
                                <div className={styles.targetedBox}>
                                    <div className={styles.targetText}>{t('admin.envmgt.export.title.label')}</div>
                                    <div className={styles.autoSelectDiv} title={t('admin.envmgt.export.title.label')}>
                                        <InputBox
                                            inputType={INPUT_TYPE.TEXT}
                                            isDisabled={false}
                                            onChange={onEnvTitleChange}
                                            value={titleState}
                                            width={"250px"}
                                            maxLength={50}
                                            className={styles.envInputStyle}
                                        />
                                    </div>
                                </div>
                                <div className={styles.targetedBox}>
                                    <div className={styles.targetText}>{t('admin.envmgt.export.version.label')}</div>
                                    <div className={styles.autoSelectDiv} title={t('admin.envmgt.export.version.tooltip')}>
                                        <InputBox
                                            inputType={INPUT_TYPE.TEXT}
                                            isDisabled={false}
                                            onChange={onEnvVersionChange}
                                            value={versionState}
                                            width={"250px"}
                                            maxLength={50}
                                            className={styles.envInputStyle}
                                        />
                                    </div>
                                </div>
                                <div className={styles.targetedBox}>
                                    <div
                                        className={styles.targetText}>{t('admin.envmgt.export.comment.label')}</div>
                                    <div className={styles.autoSelectDiv} title={t('admin.envmgt.export.comment.tooltip')}>
                                        <TextArea
                                            style={{maxWidth: 250, minWidth: 250}}
                                            large={true}
                                            growVertically={false}
                                            className={styles.textAreaStyle}
                                            onChange={handleDescriptionChange}
                                            value={descriptionState}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                transitionDuration={300}
                isCloseButtonShown={true}
                noButtonText={t('btn.common.cancel')}
                noButtonTooltip={t('btn.common.cancel')}
                onNoBtnClick={onClose}
                yesButtonText={t('btn.common.ok')}
                onYesBtnClick={handleOkClick}
                environmentError={environmentError}
                yesButtonTooltip={t('com.ipd.service.envmgt.batch.jobName.export')}/>
            }
            {showExceptionPopover &&
            <ConfirmationDialog
                showDialog={true}
                width={350}
                divideByY={3}
                headerText={t('admin_dialog_header')}
                icon={<Icons icon={ICONS.RED_ALERT_ICON}/>}
                onClose={handleDialogClose}
                body={
                    <div className={styles.exceptionContent}>
                        <div className={styles.bulletPoint}/>
                        {environmentError}
                    </div>
                }
                isCloseButtonShown={true}
                yesButtonText={t('btn.common.ok')}
                onYesBtnClick={handleDialogClose}/>
            }
            {loading &&
            <ConfirmationDialog
                showDialog={true}
                icon={<div className={styles.loadingGifStyle}/>}
                headerText={t('progress_popup_header')}
                body={<Label>{t('message_pleaseWait')}</Label>}
                transitionDuration={300}
                isCloseButtonShown={false}/>
            }
        </>
    );
};
