import {ConfirmationDialog, Icons} from "../../../components";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import styles from "./caseSearch.module.scss";
import {ICONS} from "../../../utils/iconNames";
import {AutoSelect} from "../../../components/autoSelect";
import {getOwnershipListForReassign, getUserListForCaseSearchReassign, reassignCaseSearchUser} from "../../../api";
import {useDispatch, useSelector} from "react-redux";
import moment from "moment";

const ReassignUser=(props)=>{
    const {t} = useTranslation();
    const {showReassignPopup, setShowReassignPopup, selectedRows}=props;
    const { userList,ownershipFieldData}=useSelector((state) => state.dashboard);
    const [selectedUser,setSelectedUser]=useState('')
    const [selectedOwnershipField,setSelectedOwnershipField]=useState('')
    const [reassignUserError,setReassignUserError]=useState('')
    const [ownershipFieldError,setOwnershipFieldError]=useState('')
    const [query,setQuery]=useState('');
    const [ownershipQuery,setOwnershipQuery]=useState('');

    const handleOkClick=()=>{
        setShowReassignPopup(false);
        let source=[]
        selectedRows.forEach(row=>{
            source.push({sourceId:row.id})
        })
        let requestObj = {
                batchJobs: source,
                description: "",
                element: selectedOwnershipField,
                envId: "",
                id: "0",
                lastModifiedDate: "",
                lastModifiedUser: "",
                localeId: "en_US",
                name: "[New Item]",
                new: true,
                newOwner: selectedUser.name,
                started: false,
                submitDate: moment().utc().format('YYYY-MM-DDTHH:mm:ss.ss') + 'Z',
                type: 0,
                userId: "",
            }
        reassignCaseSearchUser(requestObj)
    }

    useEffect(()=>{
        if(query) {
            const selectedItem = userList?.find(d1 => d1.description === query);
            if (selectedItem) {
                setSelectedUser(selectedItem);
                setReassignUserError('')
            } else {
                setSelectedUser('');
                setReassignUserError(t('INVALID_SELECT_VALUE_MSG', {fieldName: t('worksearch.reassign.name.label')}))
            }
        }
    },[userList])

    useEffect(()=>{
        if(ownershipQuery) {
            const selectedItem = ownershipFieldData?.find(d1 => d1.description === ownershipQuery);
            if (selectedItem) {
                setSelectedOwnershipField(selectedItem);
                setOwnershipFieldError('')
            } else {
                setSelectedOwnershipField('');
                setOwnershipFieldError(t('INVALID_SELECT_VALUE_MSG', {fieldName: t('admin.envconfig.component.adaptors.field.label')}))
            }
        }
    },[ownershipFieldData])

    return showReassignPopup && <ConfirmationDialog
        width={560}
        divideByX={3.5}
        divideByY={8}
        showDialog={showReassignPopup}
        headerText={`Ultera: ${t('case.reassign.title')}`}
        onClose={()=>{
            setShowReassignPopup(!showReassignPopup)
        }}
        transitionDuration={300}
        isCloseButtonShown={true}
        noButtonTooltip={ t('case.reassign.title')}
        noButtonText={t('btn.common.cancel')}
        onNoBtnClick={()=>{
            setShowReassignPopup(!showReassignPopup)
        }}
        yesButtonTooltip={ t('case.reassign.title')}
        yesButtonText={t('case.reassign.reassignLabel')}
        onYesBtnClick={()=>{handleOkClick()}}
        environmentError={(!selectedUser || !selectedOwnershipField) || (reassignUserError.length>0 || ownershipFieldError.length>0)}
        body={<div>
            <div className={styles.subHeader} title={ t('case.reassign.title')}>
                <div className={styles.headerLabelBox}>
                    <Icons icon={ICONS.WORK_FORWARD}/>
                    <div className={styles.headerText}>{t('case.reassign.title')}</div>
                </div>
                <div className={styles.requiredText}>* {t('label.common.required')}</div>
            </div>
            <div className={styles.validationPanelHeader}  style={{paddingTop:'4px'}}>
                <h4 className={styles.validationPanelHeaderText}>{t('com.ipd.process.reassign.label.instruction')}</h4>
            </div>
            <div className={styles.infoContainer}>
                <div className={styles.infoSubContainer}>
                    <div className={styles.infoBoxTextStyle}>
                        {t('case.reassign.instruction1')}
                        <span className={styles.reassignTextStyle}>{t('case.reassign.instruction2')}</span>
                        {t('case.reassign.instruction3')}
                        <span className={styles.reassignTextStyle}>{t('case.reassign.instruction4')}</span>
                        {t('case.reassign.instruction5')}
                    </div>
                </div>
            </div>
            <div className={styles.contentPopupDiv}>
                <div className={styles.autoSelectBox}>
                    <div className={styles.requiredTextReassignPopup}>*</div>
                    <div className={styles.boldText}>{t('case.reassign.ownerLabel')}</div>
                    <div className={styles.autoSelectDiv} title={t('case.reassign.ownerLabel')}>
                        <AutoSelect
                            loadData={null}
                            loading={false}
                            popoverWidth={220}
                            editable={false}
                            errorText={ownershipFieldError}
                            needBlur={true}
                            onBlurEventHandle={()=>{
                                !selectedOwnershipField && !ownershipQuery && setOwnershipFieldError(t('REQ_VALUE_MSG',{fieldName:t('admin.envconfig.component.adaptors.field.label')}))
                            }}
                            placeHolderText={t('case.reassign.ownerPlaceholder')}
                            onArrowClick={()=>getOwnershipListForReassign('')}
                            dataList={ownershipFieldData?ownershipFieldData:[]}
                            selectedValue={selectedOwnershipField}
                            onItemSelected={(item)=>{
                                let selectedItem=ownershipFieldData?.find(d1 => d1.name === item.name);
                                if(selectedItem) {
                                    setSelectedOwnershipField(selectedItem);
                                }else {
                                    setSelectedOwnershipField('');
                                }
                            }}
                            tooltipPosition={'left'}
                            onSelectQueryChange={(text)=>{
                                getOwnershipListForReassign(text);
                                setOwnershipQuery(text);
                            }}
                        />
                    </div>
                </div>
                <div className={styles.autoSelectBox}>
                    <div className={styles.requiredTextReassignPopup}>*</div>
                    <div className={styles.boldText}>{t('work.search.reassign.instruction.msg2')}</div>
                    <div className={styles.autoSelectDiv} title={t('work.search.reassign.instruction.msg2')}>
                        <AutoSelect
                            loadData={null}
                            loading={false}
                            popoverWidth={220}
                            editable={false}
                            errorText={reassignUserError}
                            needBlur={true}
                            onBlurEventHandle={()=>{
                                !selectedUser && ! query && setReassignUserError(t('REQ_VALUE_MSG',{fieldName:t('worksearch.reassign.name.label')}))
                            }}
                            placeHolderText={t('com.ipd.process.reassign.user.placeholder')}
                            onArrowClick={()=>getUserListForCaseSearchReassign('')}
                            dataList={userList?userList:[]}
                            selectedValue={selectedUser}
                            onItemSelected={(item)=>{
                                let selectedItem=userList?.find(d1 => d1.name === item.name);
                                if(selectedItem) {
                                    setSelectedUser(selectedItem)
                                }else {
                                    setSelectedUser('');
                                }
                            }}
                            tooltipPosition={'left'}
                            onSelectQueryChange={(text)=>{
                                getUserListForCaseSearchReassign(text);
                                setQuery(text);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
        }
    />
};

export default ReassignUser;