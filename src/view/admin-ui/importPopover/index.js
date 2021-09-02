import {ConfirmationDialog, Icons, InputBox} from "../../../components";
import styles from "./importPopover.module.scss";
import React, {useEffect, useRef, useState} from "react";
import {ICONS} from "../../../utils/iconNames";
import {useTranslation} from "react-i18next";
import {Button, Label, TextArea} from "@blueprintjs/core";
import {INPUT_TYPE} from "../../../utils/common";
import {getUpdatedActiveList, importFile, triggerImportCallAPI} from "../../../api/adminSubHeaders";
import {useSelector} from "react-redux";

export const ImportPopoverComponent = ({showPopover, onClose}) => {
    const {t} = useTranslation();
    const {loading, importDocId}  = useSelector((state) => state.dashboard);
    const [browseFile, setBrowseFile] = useState(null);
    const [targetEnvState, setTargetEnvState] = useState('');
    const [descriptionState, setDescriptionState] = useState('');
    const [showExceptionPopover, setShowExceptionPopover] = useState(false);
    const [showExceptionError, setShowExceptionError] = useState('');
    const inputFileRef = useRef(null);
    const [enableErrorIcon, setEnableErrorIcon] = useState(false);
    const [targetEnvError, setTargetEnvError] = useState('');

    const onBrowse = () => {
        inputFileRef.current.click();
    };

    const handleDialogClose = () => {
        setShowExceptionPopover(false);
        setShowExceptionError('')
    };

    const handleOkClick = async () => {
        if (!browseFile) {
            setShowExceptionPopover(true);
            setEnableErrorIcon(true)
        } else {
            try {
                const result = await importFile(browseFile, browseFile?.name);
                if(result.response){
                    const requestedData = {
                        description: descriptionState,
                        docId: result.response.docId,
                        envName: targetEnvState
                    };
                    const response  = await triggerImportCallAPI(requestedData);
                    if (response) {
                        const response = await getUpdatedActiveList();
                        if(response.status === 200){
                            onClose()
                        }
                        setTimeout(async ()=>{
                            await getUpdatedActiveList();
                        }, 8000)
                    }
                }
                if (result?.exceptionVO?.message) {
                    setShowExceptionError(result?.exceptionVO?.message)
                }
            } catch (e) {
                console.log("error", e.response)
            }
        }

    };
    const onTargetEnvNameChange = (event) => {
        setTargetEnvState(event.target.value);
        let format = /[!@#$%^&*()+=\[\]{};':"\\|,<>\/?]+/;
        if (format.test(event.target.value)) {
            setTargetEnvError(t('admin_import_target_env_error_msg'))
        } else {
            setTargetEnvError('')
        }
    };
    const handleDescriptionChange = (event) => {
        setDescriptionState(event.target.value)
    };

    const onFileSelect = (e) => {
        if (e.target?.files[0]) {
            let file = e.target.files[0];
            let reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = function () {
                setBrowseFile(file);
                setEnableErrorIcon(false)
            };
        }
    };

    return (
        <>
            { showPopover &&
                <ConfirmationDialog
                    width={630}
                    showDialog={showPopover}
                    headerText={`Ultera: ${t('com.ipd.service.envmgt.batch.jobName.import')}`}
                    onClose={onClose}
                    body={
                        <div>
                            <div className={styles.subHeader}>
                                <div className={styles.headerLabelBox}>
                                    <Icons icon={ICONS.ENV_IMPORT}/>
                                    <div
                                        className={styles.headerText}>{t('com.ipd.service.envmgt.batch.jobName.import')}</div>
                                </div>
                                <div className={styles.requiredText}>* {t('label.common.required')}</div>
                            </div>
                            <div className={styles.contentDiv}>
                                <div style={{display: "flex"}}>
                                    <div className={styles.requiredText}>*</div>
                                    <div className={styles.boldText}>{t('admin.envmgt.import.fileName.label')}</div>
                                    <div className={styles.autoSelectDiv}>
                                        <input title={t('admin.envmgt.import.fileName.tooltip')} type={"text"} disabled value={browseFile ? browseFile.name : ""}
                                               className={styles.fileInputStyle}/>
                                        <input type={'file'} ref={inputFileRef} onChange={onFileSelect}
                                               style={{display: 'none'}}/>
                                        <button className={styles.errorIcon} style={{display: !enableErrorIcon && "none"}}/>
                                        <Button title={t('admin.envmgt.import.browse.button.text')} onClick={onBrowse} className={styles.buttonBrowse}>{t('admin.envmgt.import.browse.button.text')}</Button>
                                    </div>
                                </div>
                                <div className={styles.targetedBox}>
                                    <div className={styles.targetText}>{t('admin.envmgt.import.name.label')}</div>
                                    <div className={styles.autoSelectDiv} title={t('admin.envmgt.import.name.tooltip')}>
                                        <div style={{border: targetEnvError && "solid #d46464 1px"}}>
                                            <InputBox
                                                inputType={INPUT_TYPE.TEXT}
                                                isDisabled={false}
                                                onChange={onTargetEnvNameChange}
                                                value={targetEnvState}
                                                width={"335px"}
                                                className={styles.envInputStyle}
                                                errorText={targetEnvError}
                                                tooltipPosition={"bottom-left"}
                                                maxLength={50}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.targetedBox}>
                                    <div
                                        className={styles.targetText}>{t('admin.envmgt.import.description.label')}</div>
                                    <div className={styles.autoSelectDiv}>
                                        <TextArea
                                            title={t('admin.envmgt.import.description.tooltip')}
                                            maxLength={100}
                                            style={{maxWidth: 335, minWidth: 335}}
                                            growVertically={false}
                                            large={true}
                                            className={styles.textAreaStyle}
                                            onChange={handleDescriptionChange}
                                            value={descriptionState}
                                            spellCheck={"false"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    transitionDuration={300}
                    isCloseButtonShown={true}
                    noButtonText={t('btn.common.cancel')}
                    onNoBtnClick={onClose}
                    noButtonTooltip={t('btn.common.cancel')}
                    yesButtonText={t('btn.common.ok')}
                    onYesBtnClick={handleOkClick}
                    environmentError={enableErrorIcon}
                    yesButtonTooltip={t('com.ipd.service.envmgt.batch.jobName.import')}/>
            }
            {(showExceptionPopover || showExceptionError.length > 0) &&
            <ConfirmationDialog
                showDialog={true}
                divideByY={3}
                width={showExceptionPopover ? 350 : 500}
                headerText={showExceptionPopover ? t('admin_dialog_header') : t('com.ipd.admin.env.dialog.title.authorizationException')}
                icon={<Icons icon={ICONS.RED_ALERT_ICON}/>}
                onClose={handleDialogClose}
                body={
                    <div className={styles.exceptionContent}>
                        <div className={styles.bulletPoint}/>
                        {showExceptionPopover ?
                            t('file_is_required_text') :
                            showExceptionError
                        }
                    </div>
                }
                isCloseButtonShown={true}
                yesButtonText={t('btn.common.ok')}
                onYesBtnClick={handleDialogClose}/>
            }
            {loading &&
            <ConfirmationDialog
                showDialog={true}
                divideByY={3}
                icon={<div className={styles.loadingGifStyle}/>}
                headerText={t('progress_popup_header')}
                body={<Label>{`${t('admin_import_progress_message')} ${t('message_pleaseWait')}`}</Label>}
                transitionDuration={300}
                isCloseButtonShown={false}/>
            }
        </>
    );
};
