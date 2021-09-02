import {useTranslation} from 'react-i18next';
import {ConfirmationDialog, Icons} from "../../../components";
import {useDispatch,useSelector} from "react-redux";
import styles from "./abortActiveJob.module.scss";
import {abortCurrentActiveJob} from "../../../api";
import {ICONS} from "../../../utils/iconNames";
import React from "react";
import {setEnableSingleJobAction} from "../../../slices/envManagementSlice";
import {getUpdatedActiveList} from "../../../api/adminSubHeaders";

const AbortActiveJob = ({setEnabledButtonArray}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const {enableSingleJobAction} = useSelector((state) => state.envManagement);

    const onClose = () => {
        dispatch(setEnableSingleJobAction({name: '', jobId: enableSingleJobAction.jobId, jobInstanceId: enableSingleJobAction.jobInstanceId}))
    };

    const onAbortConfirmClick = async () => {
        onClose();
        const response = await abortCurrentActiveJob(enableSingleJobAction.jobId);
        if (response.status === 200) {
            const response = await getUpdatedActiveList();
            if(response.status === 200){
                setEnabledButtonArray([])
            }
        }
    };

    return <>
        { enableSingleJobAction.name == 'abort' &&
        <ConfirmationDialog
            showDialog={true}
            icon={<Icons icon={ICONS.QUESTION_MARK_ICON}/>}
            headerText={t('admin_activeJob_abort_title')}
            width={400}
            onYesBtnClick={onAbortConfirmClick}
            yesButtonText={t('btn.common.ok')}
            noButtonText={t('btn.common.cancel')}
            onNoBtnClick={onClose}
            isCloseButtonShown={true}
            onClose={onClose}
            body={<div className={styles.bodyStyle}>
                <h4 className={styles.textStyle}>{t('admin_activeJob_abort')}</h4>
            </div>}
        />
        }
    </>
};

export default AbortActiveJob;
