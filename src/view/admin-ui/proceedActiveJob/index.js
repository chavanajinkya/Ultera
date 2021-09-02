import {ConfirmationDialog, Icons} from "../../../components";
import styles from "./proceedActiveJob.module.scss";
import React, {useEffect, useState} from "react";
import {ICONS} from "../../../utils/iconNames";
import {useTranslation} from "react-i18next";
import {Label} from "@blueprintjs/core";
import {useDispatch, useSelector} from "react-redux";
import {setEnableSingleJobAction} from "../../../slices/envManagementSlice";
import {doSaveUpdatedArrOnApply, proceedActiveJobContent, restartCurrentActiveJob} from "../../../api";
import {getUpdatedActiveList} from "../../../api/adminSubHeaders";
import {ImportProceedNeedsConfirmation} from "./importProceedNeedsConfirmation";
import {PromoteProceedNeedsConfirm} from "./promoteProceedNeedsConfirm";
import {ProceedSecondNeedsConfirm} from "./proceedSecondNeedsConfirm";
import _ from "lodash";

export const ProceedActiveJob = ({setEnabledButtonArray}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const {enableSingleJobAction, selectedTableRow, loading, proceedJobContent, proceedNCMappings} = useSelector((state) => state.envManagement);
    const [proceedJobMessage, setProceedJobMessage] = useState('');
    const [enableSortErrorPopup, setEnableSortErrorPopup] = useState(false);
    const [enableSaveMappingDialog, setEnableSaveMappingDialog] = useState(false);
    const [actualArrToSendState, setActualArrToSendState] = useState([]);

    useEffect(() => {
        if (proceedJobContent?.msgKey && proceedJobContent?.msgKey?.includes('finish.job')) {
            setProceedJobMessage(proceedJobContent?.msgKey)
        } else if (proceedJobContent?.msgKey && proceedJobContent?.msgKey?.includes('job.unknownstate.title')) {
            setProceedJobMessage(t('com.ipd.service.envmgt.batch.job.unknownstate.message'))
        } else if (proceedJobContent.ERRORS) {
            const validationMessage = JSON.parse(proceedJobContent.ERRORS)[0];
            setProceedJobMessage(validationMessage?.message);
        } else {
            setProceedJobMessage(proceedJobContent?.errMsg);
        }
    }, [proceedJobContent]);
    useEffect(()=>{
        setActualArrToSendState([])
    }, [proceedNCMappings]);

    const handleRetryClick = async () => {
        if((!proceedJobContent?.msgKey?.includes('job.unknownstate.title')))
        {
            let jobName;
            if(selectedTableRow.jobName === t('com.ipd.service.envmgt.batch.jobName.import')){
                jobName = "import"
            }else if(selectedTableRow.jobName === t('com.ipd.service.envmgt.batch.jobName.export')){
                jobName = "export"
            }else if(selectedTableRow.jobName === t('com.ipd.service.envmgt.batch.jobName.create')){
                jobName = "create"
            } else if(selectedTableRow.jobName === t('com.ipd.service.envmgt.batch.jobName.promote')){
                jobName = "promote"
            }else if(selectedTableRow.jobName === t('com.ipd.service.envmgt.batch.jobName.delete')){
                jobName = "delete"
            }
            const response = await restartCurrentActiveJob(jobName, selectedTableRow.jobId);
            if (response.status === 200) {
                onClose();
                setEnabledButtonArray([]);
                await getUpdatedActiveList();
                setTimeout(async () => {
                    await getUpdatedActiveList();
                }, 8000)
            }
        }else{
            onClose();
        }
    };
    const onClose = () => {
        setProceedJobMessage('');
        dispatch(setEnableSingleJobAction({
            name: '',
            jobId: enableSingleJobAction.jobId,
            jobInstanceId: enableSingleJobAction.jobInstanceId
        }))
    };
    const onDescriptionHeaderClick = () => {
        setEnableSortErrorPopup(true)
    };
    const handleColumnSortOkClick = () => {
        setEnableSortErrorPopup(false);
    };
    const handleApplyClick = async () =>{
        if(actualArrToSendState.length === 0) {
            let clonedMapArr = JSON.stringify(proceedNCMappings);
            clonedMapArr = JSON.parse(clonedMapArr);
            let newArray = clonedMapArr.filter((mapObj, index) => {
                if (mapObj.type.toLowerCase() === 'ldap_group') {
                    if (mapObj.selectedTarget?.displayName != mapObj.target) {
                        mapObj.target = mapObj.selectedTarget?.displayName;
                        return mapObj
                    }
                } else if (mapObj.type.toLowerCase() === 'obj_store') {
                    if (mapObj.selectedObjectStore?.name != mapObj.target) {
                        mapObj.target = mapObj.selectedObjectStore?.name;
                        return mapObj
                    }
                }
            });
            let actualArrToSend = newArray.map((arrObj) => {
                arrObj = _.omit(arrObj, ['selectedTarget', 'selectedObjectStore', 'selectedTargetRealm']);
                return arrObj
            });
            if (actualArrToSend.length > 0) {
                setActualArrToSendState(actualArrToSend);
                setEnableSaveMappingDialog(true);
                const doSaveTheUpdatedArray = await doSaveUpdatedArrOnApply(actualArrToSend);
                if (doSaveTheUpdatedArray.status === 200) {
                    setEnableSaveMappingDialog(false);
                }
            }
        }
    };

    const screenFlag = window.screen.height <= 768;

    return (
        <>
            {(enableSingleJobAction.name === 'proceed' && !loading) &&
            <ConfirmationDialog
                width={800}
                divideByY={screenFlag ? 8 : 6}
                showDialog={true}
                headerText={selectedTableRow?.status === "Finished" ? `Ultera: ${t('admin.envmgt.finish.job.confirmation.dialog.title')}` :
                    proceedJobContent?.ERRORS ? `Ultera: ${t('com.ipd.admin.env.dialog.title.validationException')}` :
                        proceedJobContent?.msgKey?.includes('job.unknownstate.title') ? `Ultera: ${t('com.ipd.service.envmgt.batch.job.unknownstate.title')}` :
                            proceedJobContent?.contextViewTemplate?.includes('/import/') ? `Ultera: ${t('admin.envmgt.import.confirmation.title')}` :
                                proceedJobContent?.contextViewTemplate?.includes('/promote/') ? `Ultera: ${t('admin.envmgt.promote.confirmation.title')}` :
                                    `Ultera: ${t('com.ipd.admin.env.dialog.title.runtimeException')}`}
                onClose={onClose}
                body={
                    <div>
                        <div className={styles.subHeader}>
                            <div className={styles.headerLabelBox}>
                                <Icons
                                    icon={selectedTableRow?.status === "Finished" ? ICONS.QUESTION_MARK_ICON :
                                        proceedJobContent?.msgKey?.includes('job.unknownstate.title') ?  ICONS.MODULE_PREFERENCES :
                                            proceedJobContent?.contextViewTemplate?.includes('/import/') ||
                                            proceedJobContent?.contextViewTemplate?.includes('/promote/') ? ICONS.ENV_RIGHT_TICK :
                                                ICONS.RED_ALERT_ICON}/>
                                <div
                                    className={styles.headerText}>{selectedTableRow?.status === "Finished" ? t('admin.envmgt.finish.job.confirmation.title.text') :
                                    proceedJobContent?.ERRORS ?
                                        t('com.ipd.admin.env.dialog.title.validationException') :
                                        proceedJobContent?.msgKey?.includes('job.unknownstate.title') ?
                                            t('com.ipd.service.envmgt.batch.job.unknownstate.title') :
                                            proceedJobContent?.contextViewTemplate?.includes('/import/confirmation') ?
                                                t('admin.envmgt.import.confirmation.title') :
                                                proceedJobContent?.contextViewTemplate?.includes('/promote/confirm') ?
                                                    t('admin.envmgt.promote.confirmation.title') :
                                                    proceedJobContent?.contextViewTemplate?.includes('/import/mapping') ?
                                                        t('admin.envmgt.import.mapping.title') :
                                                        proceedJobContent?.contextViewTemplate?.includes('/promote/mapping') ?
                                                            t('admin.envmgt.promote.confirmation.title') :
                                                            t('com.ipd.admin.env.dialog.title.runtimeException')}</div>
                            </div>
                            { (proceedJobContent?.contextViewTemplate?.includes('/import/mapping') || proceedJobContent?.contextViewTemplate?.includes('/promote/mapping')) &&
                                <div className={styles.requiredText}>* Required</div>
                            }
                        </div>
                        <div className={styles.contentDiv} style={{height: screenFlag && "calc(100vh - 300px"}}>
                            {proceedJobMessage?.includes('finish.job') ?
                                <label
                                    className={styles.finishContentStyle}>{t('admin.envmgt.finish.job.confirmation.text')}</label> :
                                proceedJobContent?.ERRORS ?
                                    <div className={styles.tableViewParent}>
                                        <div className={styles.tableHeaderView}
                                             onClick={onDescriptionHeaderClick}>{t('label.gridLayout.Description')}</div>
                                        <div className={styles.tableContentView}>{proceedJobMessage}</div>
                                    </div>
                                    :
                                    proceedJobContent?.errMsg ?
                                        <label className={styles.errContentStyle}>{proceedJobContent?.errMsg}</label>
                                        :
                                        proceedJobContent?.contextViewTemplate?.includes('/import/confirmation') ?
                                          <ImportProceedNeedsConfirmation proceedJobContent={JSON.parse(proceedJobContent?.contextModel)}/>  :
                                            proceedJobContent?.contextViewTemplate?.includes('/promote/confirm') ?
                                                <PromoteProceedNeedsConfirm proceedJobContent={JSON.parse(proceedJobContent?.contextModel)}/>  :
                                                (proceedJobContent?.contextViewTemplate?.includes('/import/mapping') ||
                                                    proceedJobContent?.contextViewTemplate?.includes('/promote/mapping')) ?
                                                    <ProceedSecondNeedsConfirm proceedJobContent={JSON.parse(proceedJobContent?.contextModel)}/> :
                                                    <label className={styles.unknownStateStyle}>{proceedJobMessage}</label>
                            }
                        </div>
                    </div>
                }
                transitionDuration={300}
                isCloseButtonShown={true}
                noButtonText={!proceedJobContent?.msgKey?.includes('job.unknownstate.title') && t('btn.common.cancel')}
                noButtonTooltip={t('btn.common.cancel')}
                onNoBtnClick={onClose}
                yesButtonText={((!proceedJobContent?.msgKey?.includes('job.unknownstate.title')) && (!proceedJobContent?.msgKey?.includes('finish.job')) &&
                    (!proceedJobContent?.contextViewTemplate?.includes('/import/confirmation')) && (!proceedJobContent?.contextViewTemplate?.includes('/promote/confirm')) &&
                    (!proceedJobContent?.contextViewTemplate?.includes('/import/mapping')) &&
                    (!proceedJobContent?.contextViewTemplate?.includes('/promote/mapping')))
                    ? t('com.ipd.admin.env.retry.btn.label') : t('btn.common.ok')}
                onYesBtnClick={handleRetryClick}
                thirdButtonText={(proceedJobContent?.contextViewTemplate?.includes('/import/mapping') ||
                    proceedJobContent?.contextViewTemplate?.includes('/promote/mapping'))
                    && t('toolseo.toolname.common.apply')}
                onThirdBtnClick={handleApplyClick}
                />
            }
            {loading &&
            <ConfirmationDialog
                showDialog={true}
                divideByY={3}
                icon={<div className={styles.loadingGifStyle}/>}
                headerText={t('progress_popup_header')}
                body={<Label>{`${t('message_pleaseWait')}...Loading Dialog`}</Label>}
                transitionDuration={300}
                isCloseButtonShown={false}/>
            }
            {
                enableSaveMappingDialog &&
                <ConfirmationDialog
                    showDialog={true}
                    divideByY={3}
                    icon={<div className={styles.loadingGifStyle}/>}
                    headerText={t('progress_popup_header')}
                    body={<Label>{t('admin_proceed_do_save_message')}</Label>}
                    transitionDuration={300}
                    isCloseButtonShown={false}/>
            }
            {
                enableSortErrorPopup &&
                <ConfirmationDialog
                    showDialog={true}
                    divideByY={3}
                    isCloseButtonShown={true}
                    onClose={handleColumnSortOkClick}
                    icon={<Icons icon={ICONS.WHITE_ALERT_ICON}/>}
                    headerText={t('ASSISTANT_INFO_HEADING')}
                    body={<Label>{t("admin_proceed_active_job_text")}</Label>}
                    transitionDuration={300}
                    yesButtonText={t('btn.common.ok')}
                    onYesBtnClick={handleColumnSortOkClick}
                />
            }
        </>
    );
};
