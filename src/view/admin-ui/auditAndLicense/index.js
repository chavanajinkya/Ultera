import {Icons} from '../../../components'
import {
    ReflexContainer,
    ReflexElement
} from 'react-reflex'
import {ICONS} from "../../../utils/iconNames";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import React, {useState} from "react";
import styles from "./auditAndLicense.module.scss";

const AuditAndLicenseComponent = ({isError}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const {licenseStatus} = useSelector((state) => state.envManagement);


    return <>
        <ReflexContainer orientation="horizontal">
            <ReflexElement flex={1}>
                <div className={styles.licenseParent}>
                    <div className={styles.optionStyle}>
                        <div className={styles.optionsText}>{t('sysmgr.context.licenseinfo.title')}</div>
                        <div className={styles.parentOptions}>
                            <div className={styles.displayInLineStyle}>
                                <Icons icon={ICONS.COMMON_ALARM}/>
                                <label className={styles.messageStyle}>{licenseStatus?.statusMessage}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </ReflexElement>
        </ReflexContainer>
    </>
};

export default AuditAndLicenseComponent;