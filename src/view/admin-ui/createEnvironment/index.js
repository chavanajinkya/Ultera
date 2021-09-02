import {ConfirmationDialog, Icons, InputBox} from "../../../components";
import styles from "./createEnvironment.module.scss";
import React, {useEffect, useState} from "react";
import {ICONS} from "../../../utils/iconNames";
import {useTranslation} from "react-i18next";
import {Checkbox, Label} from "@blueprintjs/core";
import {INPUT_TYPE} from "../../../utils/common";
import {createNewEnvironment, getAvailableModules, getUpdatedActiveList} from "../../../api/adminSubHeaders";
import _ from "lodash";
import {useSelector} from "react-redux";
export const CreateEnvironmentPopover = ({showPopover, onClose}) => {
    const {t} = useTranslation();
    const {loading} = useSelector((state) => state.dashboard);
    const [envNameState, setEnvNameState] = useState('');
    const [envNameErrorState, setEnvNameErrorState] = useState('');
    const [descriptionState, setDescriptionState] = useState('');
    const [showExceptionPopover, setShowExceptionPopover] = useState(false);
    const [showExceptionError, setShowExceptionError] = useState('');
    const [availModuleList, setAvailModuleList] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]);

    useEffect(async ()=>{
        try{
        const response = await getAvailableModules();
        if(response.status === 200){
            const sortedObjs = _.sortBy(response?.data?.response?.choiceLists[0]?.selections, 'description');
            setAvailModuleList(sortedObjs)
        }
        }catch (e) {
        }
    }, []);

    const handleDialogClose = () => {
        setShowExceptionPopover(false);
        setShowExceptionError('')
    };

    const handleOkClick = async () => {
        if (!envNameState) {
            setShowExceptionPopover(true);
            setEnvNameErrorState(t('ipd.framework.validation.message.required'))
        } else {
            try {
                const newData = {
                    description: descriptionState,
                    envName: envNameState,
                    moduleSelections: selectedModules
                };
                const response = await createNewEnvironment(newData);
                if (response.status === 200) {
                    const response = await getUpdatedActiveList();
                    if(response.status === 200){
                        onClose()
                    }
                    setTimeout(async ()=>{
                        await getUpdatedActiveList();
                    }, 8000)
                }
            } catch (e) {
                console.log("error", e.response)
            }
        }

    };
    const handleDescriptionChange = (event) => {
        setDescriptionState(event.target.value)
    };
    const onEnvNameChange = (event) =>{
        setEnvNameState(event.target.value)
        let format = /[!@#$%^*+=\[\]{};':"\\|,<>?]+/;
        if (format.test(event.target.value)) {
            setEnvNameErrorState(t('sysmgr.entity.name.valid'))
        } else {
            setEnvNameErrorState('')
        }
    };
    const onModuleChange = (module) => {
        const tempArray = [...selectedModules];
        tempArray.push(module.id);
        setSelectedModules(tempArray)
    };

    return (
        <>
            { showPopover && !loading &&
            <ConfirmationDialog
                width={475}
                showDialog={showPopover}
                headerText={`Ultera: ${t('com.ipd.service.envmgt.batch.jobName.create')}`}
                onClose={onClose}
                body={
                    <div>
                        <div className={styles.subHeader}>
                            <div className={styles.headerLabelBox}>
                                <Icons icon={ICONS.ENV_CREATE}/>
                                <div
                                    className={styles.headerText}>{t('com.ipd.service.envmgt.batch.jobName.create')}</div>
                            </div>
                            <div className={styles.requiredText}>* {t('label.common.required')}</div>
                        </div>
                        <div className={styles.contentDiv}>
                            <div className={styles.autoSelectBox}>
                                <div className={styles.requiredText}>*</div>
                                <div className={styles.boldText}>{t('admin.envmgt.create.name.label')}</div>
                                <div className={styles.autoSelectDiv} title={t('admin.envmgt.create.name.tooltip')}>
                                    <InputBox
                                        inputType={INPUT_TYPE.TEXT}
                                        isDisabled={false}
                                        onChange={onEnvNameChange}
                                        value={envNameState}
                                        width={"250px"}
                                        style={{border: envNameErrorState && "1px solid red"}}
                                        className={styles.envInputStyle}
                                        errorText={envNameErrorState}
                                        maxLength={50}
                                        popoverWidth={styles.popoverCss}
                                        tooltipPosition={"left-top"}
                                    />
                                </div>
                            </div>
                            <div className={styles.targetedBox}>
                                <div className={styles.targetText}>{t('admin.envmgt.create.description.label')}</div>
                                <div className={styles.autoSelectDiv} title={t('admin.envmgt.create.description.tooltip')}>
                                    <InputBox
                                        inputType={INPUT_TYPE.TEXT}
                                        isDisabled={false}
                                        onChange={handleDescriptionChange}
                                        value={descriptionState}
                                        width={"250px"}
                                        maxLength={50}
                                        className={styles.envInputStyle}
                                    />
                                </div>
                            </div>
                            <div className={styles.targetedBox}>
                                <div
                                    className={styles.targetText}>{t('admin.envmgt.create.availablemodule.label')}</div>
                                <div className={styles.moduleDiv}>
                                    {
                                        _.map(availModuleList, (module)=>{
                                            return <Checkbox id={module.id} label={module.description} value={selectedModules} onChange={()=>{onModuleChange(module)}} />
                                        })
                                    }
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
                environmentError={envNameErrorState}
                yesButtonTooltip={t('com.ipd.service.envmgt.batch.jobName.create')}
                onYesBtnClick={handleOkClick}/>
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
                            t('ipd.framework.validation.message.required') :
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
                body={<Label>{`${t('message_pleaseWait')}`}</Label>}
                transitionDuration={300}
                isCloseButtonShown={false}/>
            }
        </>
    );
};
