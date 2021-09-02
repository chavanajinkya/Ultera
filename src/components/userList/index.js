import React, {useEffect, useState} from "react";
import {ICONS} from "../../utils/iconNames";
import {AutoSelect} from "../autoSelect";
import {useSelector} from "react-redux";
import {getSelectedUser, getUserList} from "../../api";
import {useTranslation} from "react-i18next";
import styles from "../tables/table.module.scss";
import {Icons} from "../icons";

export const UserList=props=>{

    const {userList}=useSelector((state) => state.dashboard);
    const [query,setQuery]=useState('');
    const [loading,setLoading]=useState(false);
    const [selectedUserName,setSelectedUserName]=useState('');
    const [errorText,setErrorText]=useState('');
    const {t} = useTranslation();

    const userListData=async ()=>{
        setLoading(true);
        await getUserList();
        setLoading(false);
    }

    const getFilteredUserData= async (query, event)=>{
        setLoading(true);
        await getUserList(query);
        setLoading(false);
    }

    useEffect(()=>{
        if(query) {
            const filtered = userList.filter(data => (data.description ?? data.name ?? data.caption)?.toLowerCase()?.includes(query?.toLowerCase()));
            if (filtered.length <= 0) {
                setErrorText(t('INVALID_SELECT_VALUE_MSG', {fieldName: t('admin.envmgt.import.mapping.source.title')}))
            } else {
                setErrorText('')
            }
        }else {
            setErrorText('')
        }
    },[userList, query]);

    useEffect(()=>{
        if(props.selectedSource !== props.index) {
            if (props.selectedValue) {
                getSelectedUser(props.selectedValue).then((d1) => {
                    let res = d1?.find(dd => dd.name === props.selectedValue)
                    if (res?.name) {
                        setSelectedUserName(res?.description)
                    }
                })
            }
        }
    },[props.selectedSource]);

    useEffect(()=>{
        setSelectedUserName(props.selectedValue)
    },[props.resetClick])

    return props.selectedSource === props.index ?<AutoSelect
        setIsEnterKeyPressed = {props.setToggleUserSelection}
        isEnterKeyPressed = {props.toggleUserSelection}
        autoFocus={true}
        loadData={null}
        loading={loading}
        popoverWidth={props.popoverWidth}
        errorText={errorText  ? errorText : props.error }
        unValidText={errorText}
        editable={false}
        rightReadOnlyIcon={ICONS.HOME}
        dataList={userList ? userList : [] }
        onArrowClick={()=> userListData()}
        onItemSelected={(d)=>{
            let t=userList?.find(d1 => d1.name === d.name);
            if(t) {
                props.onItemSelected(t);
                setSelectedUserName(t.description)
            }else {
                props.onItemSelected(d);
                setSelectedUserName('');
            }
            setErrorText('')
        }}
        selectedValue={{value:selectedUserName ? selectedUserName : props.selectedValue}}
        onSelectQueryChange={(query, event)=>{
            if(query) {
                getFilteredUserData(query, event);
                setQuery(query)
            }else{
                props.onItemSelected('');
                setSelectedUserName('');
                setQuery('')
            }
        }}
    />:<div className={styles.sourcePlaceHolder}>
        <div className={styles.sourceText}>{selectedUserName ? selectedUserName : props.selectedValue}</div>
        {props.isShowIcon !== false && <Icons icon={ICONS.FORM_USER}/>}
    </div>
}