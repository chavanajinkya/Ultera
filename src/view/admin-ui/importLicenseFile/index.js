import {ConfirmationDialog, Icons} from "../../../components";
import styles from "./../importPopover/importPopover.module.scss";
import React, {useRef, useState} from "react";
import {ICONS} from "../../../utils/iconNames";
import {useTranslation} from "react-i18next";
import {Button, Label} from "@blueprintjs/core";
import {getUpdatedActiveList, importFile, triggerPromoteCallAPI} from "../../../api/adminSubHeaders";
import {useSelector} from "react-redux";
import i18n from '../../../i18n';

export const ImportLicenseFileComponent = ({showPopover, onClose}) => {
    const {t} = useTranslation();
    const {loading}  = useSelector((state) => state.dashboard);
    const [browseFile, setBrowseFile] = useState(null);
    const [showExceptionError, setShowExceptionError] = useState('');
    const inputFileRef = useRef(null);
    const [showExceptionPopover, setShowExceptionPopover] = useState(false);
    const [enableErrorIcon, setEnableErrorIcon] = useState(true);

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
                        docId: result.response.docId,
                    };
                    const response  = await triggerPromoteCallAPI(requestedData);
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

    const checkKey = (e, index) => {
        if (e.keyCode == '9' || e.keyCode == '13') {
            // enter or tab
            let start = document.getElementById(index);
            start.focus();
        }
    };

    return (
        <>
            { showPopover &&
            <ConfirmationDialog
                width={630}
                showDialog={showPopover}
                headerText={`Ultera: ${t('admin.license.upload.dialog.title')}`}
                onClose={onClose}
                body={
                    <div>
                        <div className={styles.subHeader}>
                            <div className={styles.headerLabelBox}>
                                <Icons icon={ICONS.ENV_PROCEED_AUDIT}/>
                                <div className={styles.headerText}>{t('admin.license.upload.dialog.title')}</div>
                            </div>
                            <div className={styles.requiredText}>* {t('label.common.required')}</div>
                        </div>
                        <div className={styles.importLicenseDiv}>
                            <div className={styles.autoSelectBox}>
                                <div className={styles.fileParent}>
                                    <div className={styles.boldTextFile}><div className={styles.requiredTextFile}>*</div>{t('admin.envmgt.import.fileName.label')}</div>
                                    <Button id={2} onClick={onBrowse} className={styles.importFileButton}><div className={styles.iconParent}><Icons icon={ICONS.ZIP_BLACK}/></div>{t('admin.envmgt.import.browse.button.text')}</Button>
                                </div>
                                <div className={styles.autoSelectDivImport}>
                                    <label style={{color:"#9f0000", textAlign: "center", marginTop: 10}}>{t('FILE_REQUIRED_MSG')}</label>
                                    <input  id = {1} title={t('admin.envmgt.import.fileName.tooltip')} type={"text"} disabled value={browseFile ? browseFile.name : ""}
                                            className={styles.fileImportInputStyle}  onKeyDown={(e) => {
                                        checkKey(e, 1)
                                    }}>
                                    </input>
                                    <input type={'file'} accept={'application/x-zip-compressed'} ref={inputFileRef} onChange={onFileSelect}
                                           style={{display: 'none'}}/>
                                </div>
                            </div>
                            <div className={styles.warningLicenseMsg}>
                                <div className={styles.warningIcon} style={{width: i18n?.language.includes('fr') ? 43 : 43 }}><Icons icon={ICONS.COMMON_WARNING}/></div>
                                <div style={{marginLeft: 10}}>{t('admin.license.upload.cleanup.warning')}</div>
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
                environmentError={enableErrorIcon}
                yesButtonTooltip={t('com.ipd.service.envmgt.batch.jobName.promote')}/>
            }
            {showExceptionPopover &&
            <ConfirmationDialog
                showDialog={true}
                divideByY={3.3}
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
