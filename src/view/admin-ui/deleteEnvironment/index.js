import {ConfirmationDialog, Icons} from "../../../components";
import styles from "../exportPopover/exportPopover.module.scss";
import React, {useEffect, useState} from "react";
import {ICONS} from "../../../utils/iconNames";
import {useTranslation} from "react-i18next";
import {Label} from "@blueprintjs/core";
import {AutoSelect} from "../../../components/autoSelect";
import _ from "lodash";
import {deleteEnvironment, getUpdatedActiveList} from "../../../api/adminSubHeaders";

export const DeleteEnvironment = ({showPopover, onClose, EnvList}) => {
    const {t} = useTranslation();
    const [showExceptionPopover, setShowExceptionPopover] = useState(false);
    const [progressDialog, setProgressDialog] = useState(false);
    const [environmentError, setEnvironmentError] = useState('');
    const [environmentId, setEnvironmentId] = useState(null);
    const [environmentList, setEnvironmentList] = useState([]);
    const [enableConfirmationPopup, setEnableConfirmationPopup] = useState(false);

    useEffect(() => {
        if (EnvList.length > 0) {
            const updatedArray = _.map(EnvList, data => {
                return {id: data.envId, name: data.envName}
            });
            setEnvironmentList(updatedArray);
        }
    }, []);

    const handleDialog = () => {
        setProgressDialog(false);
        setEnableConfirmationPopup(false)
    };

    const handleDialogClose = () => {
        setShowExceptionPopover(false);
        setEnableConfirmationPopup(false)
    };

    const handleOkClick = async () => {
        if (!environmentId) {
            setShowExceptionPopover(true);
            setEnvironmentError(t('admin_export_env_error_message'))
        } else {
            setEnvironmentError('');
            setEnableConfirmationPopup(true)
        }
    };
    const onYesBtnClick = async () => {
        const deleteData = {
            envId: environmentId,
        };
        const response = await deleteEnvironment(deleteData);
        if (response.status === 200) {
            const response = await getUpdatedActiveList();
            if(response.status === 200){
                onClose()
            }
            setTimeout(async ()=>{
                await getUpdatedActiveList();
            }, 8000)
        }
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
                headerText={`Ultera: ${t('com.ipd.service.envmgt.batch.jobName.delete')}`}
                onClose={onClose}
                body={
                    <div>
                        <div className={styles.subHeader}>
                            <div className={styles.headerLabelBox}>
                                <Icons icon={ICONS.ENV_DELETE}/>
                                <div
                                    className={styles.headerText}>{t('com.ipd.service.envmgt.batch.jobName.delete')}</div>
                            </div>
                            <div className={styles.requiredText}>* {t('label.common.required')}</div>
                        </div>
                        <div className={styles.contentPopupDiv}>
                            <div className={styles.autoSelectBox}>
                                <div className={styles.requiredText}>*</div>
                                <div className={styles.boldText}>{t('label.envNn.envName')}</div>
                                <div className={styles.autoSelectDiv} title={t('admin.envmgt.delete.environment.tooltip')}>
                                    <AutoSelect
                                        loadData={null}
                                        loading={false}
                                        popoverWidth={250}
                                        editable={false}
                                        errorText={environmentError}
                                        dataList={environmentList}
                                        onItemSelected={onEnvironmentSelected}
                                        selectedValue={selectedObject}
                                        tooltipPosition={'left'} setErrorText={setEnvironmentError}
                                        unValidText={t('admin_export_env_name_error_text')}/>
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
                yesButtonTooltip={t('com.ipd.service.envmgt.batch.jobName.delete')}/>
            }
            {showExceptionPopover &&
            <ConfirmationDialog
                showDialog={true}
                width={350}
                divideByY={3.4}
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
            {progressDialog &&
            <ConfirmationDialog
                showDialog={true}
                divideByY={3.4}
                icon={<div className={styles.loadingGifStyle}/>}
                headerText={t('progress_popup_header')}
                onClose={handleDialog}
                body={<Label>{`${t('message_pleaseWait')}`}</Label>}
                onNoBtnClick={handleDialog}
                transitionDuration={300}
                isCloseButtonShown={false}/>
            }
            {
                enableConfirmationPopup &&
                <ConfirmationDialog
                    showDialog={true}
                    width={350}
                    divideByY={3.4}
                    headerText={t('admin_delete_job_confirmation')}
                    icon={<Icons icon={ICONS.QUESTION_MARK_ICON}/>}
                    onClose={handleDialogClose}
                    body={
                        <div className={styles.exceptionDeleteContent}>
                            {`${t('admin_delete_confirm_msg')}:  ${selectedObject.name}?`}
                            <h4 className={styles.textStyle}>{t('label_click')}<b>{t('ipd.cag.yes')}</b>{t('label_to_continue_or')}<b>{t('ipd.cag.no')}</b> {t('label_to_cancel')}
                            </h4>
                        </div>
                    }
                    isCloseButtonShown={true}
                    noButtonText={t('ipd.cag.no')}
                    onNoBtnClick={handleDialog}
                    yesButtonText={t('ipd.cag.yes')}
                    onYesBtnClick={onYesBtnClick}/>
            }
        </>
    );
};
