import styles from "./proceedActiveJob.module.scss";
import React, {useEffect, useState} from "react";
import {ICONS} from "../../../utils/iconNames";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {InputBox} from "../../../components/inputBox";
import {INPUT_TYPE} from "../../../utils/common";
import {Button, TextArea} from "@blueprintjs/core";
import {ReflexContainer, ReflexElement, ReflexSplitter} from "react-reflex";
import {HeaderActions} from "../../../components/headerActions";
import {Table} from "../../../components/tables/Table";
import {importingEntitySelector, promoteStatsDetailSelector} from "../../../slices/selectors";
import {onSortingColumn, setSelectedEntity, setSelectedTableRow} from "../../../slices/envManagementSlice";
import {Icons} from "../../../components/icons";
import {ConfirmationDialog} from "../../../components/confirmationDialog";

export const PromoteProceedNeedsConfirm = ({proceedJobContent}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [enabledDetailsBtn, setEnabledDetailsBtn] = useState(true);
    const [enablePromoteStatsDetails, setEnablePromoteStatsDetails] = useState(false);
    const loading = useSelector((state) => state.workSearch.loading);
    const {selectedTableRow, promoteStatsDetailsData} = useSelector((state) => state.envManagement);
    const updatedEntitiesSelector = useSelector(state => importingEntitySelector(state));
    const promoteStatsDetailList = useSelector(state=> promoteStatsDetailSelector(state));
    const [tableColumnNames, setTableColumnNames] = useState([
        {name: 'caption', caption: t('admin.envmgt.promote.stats.type.label'), colWidth: 300},
        {name: 'insertCount', caption: t('admin.envmgt.promote.stats.add.label'), colWidth: 100},
        {name: 'updateCount', caption: t('admin.envmgt.promote.stats.update.label'), colWidth: 100},
        {name: 'deleteCount', caption: t('admin.envmgt.promote.stats.delete.label'), colWidth: 100}]);

    const [detailTableColumnNames, setDetailTableColumnNames] = useState([
        {name: 'name', caption: t('admin.envconfig.adaptors.stats.name.label'), colWidth: 200},
        {name: 'countType', caption: t('sysmgr.clientintegration.action.title'), colWidth: 200}]);

    const onColumnSort = (sortBy, sortDirection) => {
        let orderBy = '';
        if (sortDirection === 'Asc') {
            orderBy = 'asc'
        } else {
            orderBy = 'desc'
        }
        dispatch(onSortingColumn({sortBy, orderBy}))
    };

    const onDetailsClick = () =>{
        dispatch(setSelectedEntity(promoteStatsDetailsData[selectedTableRow.entityName]));
        dispatch(onSortingColumn({sortBy:'name', orderBy: 'asc'}));
        setEnablePromoteStatsDetails(true);
    };
    const alertIcon = <Icons icon={ICONS.WHITE_ALERT_ICON}/>;
    const promoteAction = [];
    promoteAction.push(<Button id={12} icon={alertIcon} text={t('admin.envmgt.promote.stats.detailsButtonLabel')}
                                   className={styles.buttonIcon}  onClick={onDetailsClick}
                                   disabled={enabledDetailsBtn}/>);

    const actionsOnHistoryTableRowClick = (data) => {
        setEnabledDetailsBtn(false);
        dispatch(setSelectedTableRow(data))
    };
    const onDetailOkClick = () =>{
        setEnablePromoteStatsDetails(false);
    };

    return (
        <div className={styles.promoteContentDiv}>
            <ReflexContainer orientation="horizontal">
                <ReflexElement flex={0.4}>
                    <div className={styles.promoteFirstDiv}>
                        <div className={styles.targetedBox}>
                            <div className={styles.targetText}>{t('admin.envconfig.component.adaptors.env.label')}</div>
                            <div className={styles.autoSelectDiv}>
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
                            <div className={styles.targetText}>{t('admin.envmgt.export.title.label')}</div>
                            <div className={styles.autoSelectDiv}>
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
                            <div className={styles.autoSelectDiv}>
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
                            <div
                                className={styles.targetText}>{t('admin.envmgt.export.comment.label')}</div>
                            <div className={styles.autoSelectDiv}>
                                <TextArea
                                    style={{maxWidth: 300, minWidth: 300}}
                                    large={true}
                                    disabled={true}
                                    growVertically={false}
                                    className={styles.textAreaStyle}
                                    value={proceedJobContent?.BatchJobInfo?.comment}
                                />
                            </div>
                        </div>
                    </div>
                </ReflexElement>
                <ReflexSplitter className="horizontal-splitter">
                    <div className="horizontal-splitter-thumb"/>
                </ReflexSplitter>
                <ReflexElement flex={0.6}>
                    <div className={styles.promoteSecondDiv}>
                        <Table
                            loading={loading}
                            tableId={'changesSummary'}
                            defaultSortingFlag={true}
                            headerIcon={<Icons icon={ICONS.GRID_SHOW}/>}
                            headerTitle={t('admin.envmgt.promote.stats.title')}
                            actions={<HeaderActions minimal={true} actions={promoteAction}/>}
                            searchResultCol={tableColumnNames}
                            colNames={tableColumnNames}
                            tableData={updatedEntitiesSelector}
                            searchResult={updatedEntitiesSelector}
                            isSortable={true}
                            appType={'UlteraAdmin'}
                            setTableColumnsWidth={setTableColumnNames}
                            actionsOnTableRowClick={actionsOnHistoryTableRowClick}
                            onColumnSort={onColumnSort}
                            allowMultiRowSelection={false}
                            rowTooltip={t('admin.envmgt.promote.stats.title')}
                        />
                    </div>
                </ReflexElement>
            </ReflexContainer>
            {
                enablePromoteStatsDetails &&
                <ConfirmationDialog
                    showDialog={true}
                    headerText={t('admin.envmgt.promote.stats.detailsButtonLabel')}
                    width={500}
                    divideByX={8}
                    divideByY={20}
                    onYesBtnClick={onDetailOkClick}
                    yesButtonText={t('btn.common.ok')}
                    isCloseButtonShown={true}
                    onClose={onDetailOkClick}
                    body={<div className={styles.parentDetailsDiv}>
                        <Table
                            loading={loading}
                            tableId={'promoteStatsDetail'}
                            defaultSortingFlag={true}
                            actions={<HeaderActions minimal={true} actions={[]}/>}
                            searchResultCol={detailTableColumnNames}
                            colNames={detailTableColumnNames}
                            tableData={promoteStatsDetailList}
                            searchResult={promoteStatsDetailList}
                            isSortable={true}
                            appType={'UlteraAdmin'}
                            setTableColumnsWidth={setDetailTableColumnNames}
                            onColumnSort={onColumnSort}
                            allowMultiRowSelection={false}
                        />
                    </div>}
                />
            }
        </div>
    );
};
