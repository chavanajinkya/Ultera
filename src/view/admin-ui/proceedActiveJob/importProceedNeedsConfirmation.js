import styles from "./proceedActiveJob.module.scss";
import React, {useEffect, useState} from "react";
import {ICONS} from "../../../utils/iconNames";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {InputBox} from "../../../components/inputBox";
import {INPUT_TYPE} from "../../../utils/common";
import {TextArea} from "@blueprintjs/core";
import {H5} from "@blueprintjs/core/lib/cjs/components/html/html";
import {AutoSelect} from "../../../components/autoSelect";
import {Icons} from "../../../components/icons";
import {HeaderActions} from "../../../components/headerActions";
import {Table} from "../../../components/tables/Table";
import {importingEntitySelector, JobsHistorySelector} from "../../../slices/selectors";
import {onSortingColumn} from "../../../slices/envManagementSlice";

export const ImportProceedNeedsConfirmation = ({proceedJobContent}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.workSearch.loading);
    const updatedEntitiesSelector = useSelector(state => importingEntitySelector(state));
    const [tableColumnNames, setTableColumnNames] = useState([
        {name: 'caption', caption: t('admin.envmgt.promote.stats.type.label'), colWidth: 500},
        {name: 'count', caption: t('admin_qty_text'), colWidth: 262}]);

    const onColumnSort = (sortBy, sortDirection) => {
        let orderBy = '';
        if (sortDirection === 'Asc') {
            orderBy = 'asc'
        } else {
            orderBy = 'desc'
        }
        dispatch(onSortingColumn({sortBy, orderBy}))
    };

    return (
        <div className={styles.importContentDiv}>
            <div style={{height: "60%", overflow: "auto"}}>
                <div className={styles.optionStyle}>
                    <div className={styles.optionsText}>{t('admin.envmgt.import.confirm.entered.info.title')}</div>
                    <div className={styles.parentOptions}>
                            <div className={styles.targetedBox}>
                                <div className={styles.targetText}>{t('admin.envconfig.component.adaptors.env.label')}</div>
                                <div className={styles.autoSelectDiv} title={t('admin.envconfig.component.adaptors.env.label')}>
                                    <InputBox
                                        inputType={INPUT_TYPE.TEXT}
                                        isDisabled={true}
                                        value={proceedJobContent?.BatchJobInfo?.envName}
                                        width={"300px"}
                                        maxLength={50}
                                        className={styles.envInputStyle}
                                    />
                                </div>
                            </div>
                            <div className={styles.targetedBox}>
                                <div className={styles.targetText}>{t('admin.envmgt.create.description.label')}</div>
                                <div className={styles.autoSelectDiv} title={t('admin.envmgt.import.description.tooltip')}>
                                    <TextArea
                                        style={{maxWidth: 300, minWidth: 300}}
                                        large={true}
                                        growVertically={false}
                                        disabled={true}
                                        className={styles.textAreaStyle}
                                        value={proceedJobContent?.BatchJobInfo?.description}
                                    />
                                </div>
                            </div>
                    </div>
                </div>
                <div className={styles.optionStyle}>
                    <div className={styles.optionsText}>{t('admin.envmgt.import.confirm.file.info.title')}</div>
                    <div className={styles.parentOptions}>
                        <div className={styles.targetedBox}>
                            <div className={styles.targetText}>{t('admin.envconfig.component.adaptors.env.label')}</div>
                            <div className={styles.autoSelectDiv} title={t('admin.envmgt.export.environment.tooltip')}>
                                <InputBox
                                    inputType={INPUT_TYPE.TEXT}
                                    isDisabled={true}
                                    value={proceedJobContent?.BatchJobInfo?.exportedEnvName}
                                    width={"300px"}
                                    maxLength={50}
                                    className={styles.envInputStyle}
                                />
                            </div>
                        </div>
                        <div className={styles.targetedBox}>
                            <div className={styles.targetText}>{t('admin.envmgt.export.title.label')}</div>
                            <div className={styles.autoSelectDiv} title={t('admin.envmgt.export.title.tooltip')}>
                                <InputBox
                                    inputType={INPUT_TYPE.TEXT}
                                    isDisabled={true}
                                    value={proceedJobContent?.BatchJobInfo?.title}
                                    width={"300px"}
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
                                    isDisabled={true}
                                    value={proceedJobContent?.BatchJobInfo?.version}
                                    width={"300px"}
                                    maxLength={50}
                                    className={styles.envInputStyle}
                                />
                            </div>
                        </div>
                        <div className={styles.targetedBox}>
                            <div className={styles.targetText}>{t('admin.envmgt.export.comment.label')}</div>
                            <div className={styles.autoSelectDiv} title={t('Comments that will be saved into the Export file')}>
                                <TextArea
                                    style={{maxWidth: 300, minWidth: 300}}
                                    large={true}
                                    growVertically={false}
                                    disabled={true}
                                    className={styles.textAreaStyle}
                                    value={proceedJobContent?.BatchJobInfo?.comment}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.importSecondBox}>
                <Table
                    loading={loading}
                    tableId={'ImportingEntities'}
                    defaultSortingFlag={true}
                    headerTitle={t('admin.envmgt.import.confirm.entitiesTitle')}
                    actions={<HeaderActions minimal={true} actions={[]}/>}
                    searchResultCol={tableColumnNames}
                    colNames={tableColumnNames}
                    tableData={updatedEntitiesSelector}
                    searchResult={updatedEntitiesSelector}
                    isSortable={true}
                    appType={'UlteraAdmin'}
                    setTableColumnsWidth={setTableColumnNames}
                    onColumnSort={onColumnSort}
                    rowTooltip={t('admin.envmgt.import.confirm.entitiesTitle')}
                />
            </div>
        </div>
    );
};
