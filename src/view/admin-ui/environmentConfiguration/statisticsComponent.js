import {ConfirmationDialog, HeaderActions, Icons} from "../../../components";
import styles from "./environmentConfiguration.module.scss";
import React, {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {ICONS} from "../../../utils/iconNames";
import {Button} from "@blueprintjs/core";
import {TableFilter} from "../../../components/tables/TableFilter";
import {
    adaptorStatisticsSelector,
    filterableStatsDataSelector
} from "../../../slices/selectors";
import {
    onSortingStatsColumn,
    resetTableAdaptorsStatsColumnWidth,
    setColumnStatsHeaderList,
    setRuleList,
    setStatsRuleList, setStatsSelectedValue,
    setTableAdaptorsStatsColumn,
} from "../../../slices/envConfigSlice";
import {getAdaptorsStatisticList} from "../../../api/environmentConfiguration";
import _ from "lodash";
import FilterComponent from "./filterComponent";
import i18n from "../../../i18n";

export const StatisticsAdaptorComponent = ({enableStatisticPopup, setEnableStatisticPopup}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const filteredStatisticList = useSelector(state => filterableStatsDataSelector(state));
    const updatedStatisticListSelector = useSelector(state => adaptorStatisticsSelector(state));
    const {statsRuleList, tableAdaptorsStatsColumn, statsColumnHeaderList, statsSelectedValue,
        statsSortBy, statsOrderBy, statsLoading, selectedConfigTableRow} = useSelector((state) => state.envConfig);

    const [enableStatsFilterDialog, setEnableStatsFilterDialog] = useState(false);
    const [statsFilterApply, setStatsFilterApply] = useState(false);
    const [displayTableStatsFilterList, setDisplayTableStatsFilterList] = useState(filteredStatisticList);
    const [activeRuleIndex, setActiveRuleIndex] = useState(1);
    const [selectedFilterValue, setSelectedFilterValue] = useState({});
    const [removeSelectedRuleFlag, setRemoveSelectedRuleFlag] = useState(false);
    const [enableClearStatsConfirmation, setEnableClearStatsConfirmation] = useState(false);


    const [selectedColumnHeader, setSelectedColumnHeader] = useState({
        id: 1,
        name: "anyColumn",
        caption: t('any_column_filter_com_adaptor'),
        colWidth: '112px'
    });

    useEffect(() => {
        if (filteredStatisticList && !enableStatsFilterDialog) {
            const updatedDisplayList = [...filteredStatisticList];
            setDisplayTableStatsFilterList(updatedDisplayList)
        }
    }, [filteredStatisticList, enableStatsFilterDialog]);

    const headerEnvIcon = <Icons icon={ICONS.GRAPH}/>;

    const onRefreshClick = () =>{
        onClearBtnClick();
    };

    const adaptorsActions = [];
    adaptorsActions.push(<Button className={styles.btnRefresh} title={t('admin.envconfig.adaptors.stats.title')}
                                 icon={<Icons icon={ICONS.GRID_RESET}/>} text={t('btn.refresh')} onClick={onRefreshClick}/>);

    const handleOkClick = async () => {
        setEnableStatisticPopup(false);
    };
    const onClose = () => {
        onClearBtnClick();
        setEnableStatisticPopup(false);
        dispatch(resetTableAdaptorsStatsColumnWidth());
        dispatch(onSortingStatsColumn({sortBy:'', orderBy: 'desc'}))
    };

    const onOpenFilter = (event) => {
        event.stopPropagation();
        setEnableStatsFilterDialog(true);
    };
    const onFilterClicked = (event, column) => {
        event.stopPropagation();
        setSelectedColumnHeader(column);
        setEnableStatsFilterDialog(true);
    };
    const setTableColumnsWidth = (clonedData) => {
        dispatch(setTableAdaptorsStatsColumn(clonedData))
    };
    const onColumnSort = (sortBy, sortDirection) => {
        let orderBy = '';
        if (sortDirection === 'Asc') {
            orderBy = 'asc'
        } else {
            orderBy = 'desc'
        }
        dispatch(onSortingStatsColumn({sortBy, orderBy}))
    };
    const actionsOnActiveTableRowClick = (data) => {

    };

    const onCloseFilterPopup = () => {
        if (!statsFilterApply) {
            dispatch(setStatsRuleList([{
                id: 1,
                name: `${i18n.t('sysmgr.fields.rule.caption')} 1`,
                column: i18n.t('any_column_filter_com_adaptor'),
                condition: i18n.t('admin_envConfig_filter_condition'),
                value: ''
            }]));
            setActiveRuleIndex(1);
            setSelectedFilterValue({});
            setSelectedColumnHeader({
                id: 1,
                name: "anyColumn",
                caption: t('any_column_filter_com_adaptor'),
                colWidth: '112px'
            })
        }
        setEnableStatsFilterDialog(false);
    };

    const onClearBtnClick = async () => {
        if (statsRuleList.length === 1) {
            setStatsFilterApply(false);
            setEnableStatsFilterDialog(false);
            const resetRuleList = [{
                id: 1,
                name: `${t('sysmgr.fields.rule.caption')} 1`,
                column: t('any_column_filter_com_adaptor'),
                condition: t('admin_envConfig_filter_condition'),
                value: ''
            }];
            setActiveRuleIndex(1);
            dispatch(setStatsRuleList(resetRuleList));
            setSelectedFilterValue({});
            setSelectedColumnHeader({
                id: 1,
                name: "anyColumn",
                caption: t('any_column_filter_com_adaptor'),
                colWidth: '112px'
            });
            await getAdaptorsStatisticList(selectedConfigTableRow);
            setRemoveSelectedRuleFlag(false);
        } else if (statsRuleList.length > 1) {
            setEnableClearStatsConfirmation(true)
        }
    };

    const onRemoveSelectedRule = (rule, index) => {
        setRemoveSelectedRuleFlag(true);
        let clonedRuleList = JSON.stringify(statsRuleList);
        clonedRuleList = JSON.parse(clonedRuleList);
        let remainingArr = clonedRuleList.filter((item) => item.id !== rule.id);
        const updatedRuleArr = _.map(remainingArr, (value, index) => {
            value.id = index + 1;
            return value
        });
        setActiveRuleIndex(1);
        let conditionArray = [];
        if (updatedRuleArr[0].column === t('any_column_filter_com_adaptor') || updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.env.label') ||
            updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.name.label') || updatedRuleArr[0].column === t('admin.envconfig.adaptors.stats.operation.label'))
        {
            conditionArray = [{id: 1, name: "contains", caption: t('admin_envConfig_filter_condition'), colWidth: 112},
                {id: 2, name: "is", caption: t('admin_envConfig_filter_is'), colWidth: 112},
                {id: 3, name: "startsWith", caption: t('label.roleselection.StartWith').toLowerCase(), colWidth: 112},
                {id: 4, name: "endsWith", caption: t('admin_envConfig_filter_endsWith'), colWidth: 112},
                {id: 5, name: "doesNoContain", caption: t('admin_envConfig_filter_doesNot'), colWidth: 112},
                {id: 6, name: "isNot", caption: t('admin_envConfig_filter_isNot'), colWidth: 112},
                {id: 7, name: "doesNotStartWith", caption: t('admin_envConfig_filter_doesNotStart'), colWidth: 112},
                {id: 8, name: "doesNotEndWith", caption: t('admin_envConfig_filter_doesNotEnd'), colWidth: 112},
                {id: 9, name: "isEmpty", caption: t('admin_envConfig_filter_isEmpty'), colWidth: 112}];
        } else if (updatedRuleArr[0].column === t('admin.envconfig.adaptors.stats.numinstances.label') ||
            updatedRuleArr[0].column === t('admin.envconfig.adaptors.stats.avgthroughput.label') ||
            updatedRuleArr[0].column === t('admin.envconfig.adaptors.stats.avgduration.label'))
        {
            conditionArray = [{id: 10, name: "equal", caption: t('admin_envConfig_filter_equal'), colWidth: 112},
                {id: 11, name: "doesNotEqual", caption: t('admin_envConfig_filter_doesNotEqual'), colWidth: 112},
                {id: 12, name: "lessThan", caption: t('admin_envConfig_filter_lessThan').toLowerCase(), colWidth: 112},
                {id: 13, name: "lessThanOrEqual", caption: t('admin_envConfig_filter_lessThanOrEqual'), colWidth: 112},
                {id: 14, name: "greaterThan", caption: t('admin_envConfig_filter_greaterThan'), colWidth: 112},
                {id: 15, name: "greaterThanOrEqual", caption: t('admin_envConfig_filter_greaterThanOrEqual'), colWidth: 112},
                {id: 9, name: "isEmpty", caption: t('admin_envConfig_filter_isEmpty'), colWidth: 112}];
        }
        let dataArrayList;
        if (updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.env.label')) {
            dataArrayList = _.map(updatedStatisticListSelector, (adaptor, index) => {
                return {id: index + 1, name: adaptor.environment}
            });
        } else if (updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.name.label')) {
            dataArrayList = _.map(updatedStatisticListSelector, (adaptor, index) => {
                return {id: index + 1, name: adaptor.name}
            });
        } else if (updatedRuleArr[0].column === t('admin.envmgt.promote.stats.type.label')) {
            dataArrayList = _.map(updatedStatisticListSelector, (adaptor, index) => {
                return {id: index + 1, name: adaptor.adaptorTypeId}
            });
        } else if (updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.process.label')) {
            dataArrayList = _.map(updatedStatisticListSelector, (adaptor, index) => {
                return {id: index + 1, name: adaptor.process}
            });
        } else if (updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.queue.label')) {
            dataArrayList = _.map(updatedStatisticListSelector, (adaptor, index) => {
                return {id: index + 1, name: adaptor.workQueue}
            });
        }
        const columnObjArr = _.filter(statsColumnHeaderList, (item) => {
            return item.caption === updatedRuleArr[0].column
        });
        const conditionObjArr = _.filter(conditionArray, (item) => {
            return item.caption === updatedRuleArr[0].condition
        });
        const valueObjArr = _.filter(dataArrayList, (item) => {
            return item.name === updatedRuleArr[0].value
        });
        setSelectedColumnHeader(columnObjArr[0]);
        if (valueObjArr.length > 0) {
            setSelectedFilterValue(valueObjArr[0]);
        }
        dispatch(setStatsRuleList(updatedRuleArr));
    };

    const updateColumnHeaderList = (tempArray) =>{
        dispatch(setColumnStatsHeaderList(tempArray));
    };

    const updateFilterRuleList = (clonedRuleList) =>{
        dispatch(setStatsRuleList(clonedRuleList))
    };
    const handleStatsValueChange = (item) =>{
        dispatch(setStatsSelectedValue(item));
    };


    return (
        <>
            {enableStatisticPopup &&
            <ConfirmationDialog
                width={1200}
                divideByY={12}
                divideByX={5}
                showDialog={true}
                headerText={`Ultera: ${t('admin.envconfig.adaptors.stats.title')}`}
                onClose={onClose}
                body={
                    <div className={styles.parentDiv}>
                        <div className={styles.parentDivTable}>
                            <TableFilter
                                loading={statsLoading}
                                tableId={'componentAdaptorsStatistics'}
                                ruleList={statsRuleList}
                                onOpenFilter={onOpenFilter}
                                filterApply={statsFilterApply}
                                headerIcon={headerEnvIcon}
                                headerTitle={t('admin.envconfig.adaptors.stats.title')}
                                actions={<HeaderActions minimal={true} actions={adaptorsActions}/>}
                                onFilterClicked={onFilterClicked}
                                searchResultCol={tableAdaptorsStatsColumn}
                                colNames={tableAdaptorsStatsColumn}
                                tableData={displayTableStatsFilterList}
                                searchResult={displayTableStatsFilterList}
                                isSortable={true}
                                filteredAdaptorList={filteredStatisticList}
                                adaptorsList={updatedStatisticListSelector}
                                setTableColumnsWidth={setTableColumnsWidth}
                                actionsOnTableRowClick={actionsOnActiveTableRowClick}
                                onColumnSort={onColumnSort}
                                applyFilter={null}
                                appType={"UlteraAdmin"}
                                setActiveRuleIndex={setActiveRuleIndex}
                                onClearBtnClick={onClearBtnClick}
                                onRemoveSelectedRule={onRemoveSelectedRule}
                                setEnableFilterDialog={setEnableStatsFilterDialog}
                                enableFilterDialog={enableStatsFilterDialog}
                                matchSelectedValue={statsSelectedValue}
                                sortBy={statsSortBy}
                                orderBy={statsOrderBy}
                                showFilterBtnOnColumn={'environment'}
                                noDataText={t('admin.envconfig.adaptors.stats.nodata.msg')}
                            />
                        </div>
                    </div>
                }
                transitionDuration={300}
                isCloseButtonShown={true}
                yesButtonText={t('btn.common.ok')}
                onYesBtnClick={handleOkClick}
            />
            }
            <FilterComponent enableFilterDialog={enableStatsFilterDialog} setFilterApply={setStatsFilterApply}
                             adaptorsList={updatedStatisticListSelector}
                             setSelectedColumnHeader={setSelectedColumnHeader} selectedColumnHeader={selectedColumnHeader}
                             filterApply={statsFilterApply}
                             onClose={onCloseFilterPopup} tableEnvAdaptorsColumn={tableAdaptorsStatsColumn}
                             setEnableFilterDialog={setEnableStatsFilterDialog}
                             activeRuleIndex={activeRuleIndex} setActiveRuleIndex={setActiveRuleIndex}
                             enableClearConfirmation={enableClearStatsConfirmation}
                             setEnableClearConfirmation={setEnableClearStatsConfirmation}
                             setSelectedFilterValue={setSelectedFilterValue} selectedFilterValue={selectedFilterValue}
                             removeSelectedRuleFlag={removeSelectedRuleFlag} selectedValue={statsSelectedValue}
                             setRemoveSelectedRuleFlag={setRemoveSelectedRuleFlag} ruleList={statsRuleList} columnHeaderList={statsColumnHeaderList}
                             onClearBtnClick={onClearBtnClick} updateColumnHeaderList={updateColumnHeaderList}
                             updateFilterRuleList={updateFilterRuleList} handleSelectedValueChange={handleStatsValueChange}/>
        </>
    );
};
