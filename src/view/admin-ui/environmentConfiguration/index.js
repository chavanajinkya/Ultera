import React, {useEffect, useState} from 'react'
import {Button, Label} from "@blueprintjs/core";
import {ConfirmationDialog, HeaderActions, Icons} from '../../../components'
import {
    ReflexContainer,
    ReflexElement
} from 'react-reflex'
import {ICONS} from "../../../utils/iconNames";
import styles from "./environmentConfiguration.module.scss";
import {Table} from "../../../components/tables/Table";
import {useDispatch, useSelector} from "react-redux";
import {useLocation} from "react-router";
import {componentAdaptorSelector, environmentsSelector, filterableDataSelector} from "../../../slices/selectors";
import FilterComponent from "./filterComponent";
import {useTranslation} from "react-i18next";
import _ from "lodash";
import {
    onSortingConfigColumn,
    resetTableAdaptorsColumnWidth, setColumnHeaderList, setEnableConfigLogView,
    setRuleList, setSelectedValue, setStatsRuleList,
    setTableEnvAdaptorsColumn, updateSelectedConfigTableRow
} from "../../../slices/envConfigSlice";
import i18n from "../../../i18n";
import {TableFilter} from "../../../components/tables/TableFilter";
import {
    adaptorEnablement, deleteSelectedAdaptor,
    getAdaptorsStatisticList,
    getEnvConfigAdaptorsList
} from "../../../api/environmentConfiguration";
import {StatisticsAdaptorComponent} from "./statisticsComponent";
import {setEnableSingleJobAction} from "../../../slices/envManagementSlice";
import {AddComponentAdaptor} from "./addComponentAdaptor";


const EnvironmentConfigComponent = ({resetEnvConfigState, setEnabledButtonArray}) => {
    const location = useLocation();
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.workSearch.loading);
    const {ruleList, selectedConfigTableRow, dialogLoading} = useSelector((state) => state.envConfig);
    const updatedEnvListSelector = useSelector(state => environmentsSelector(state));
    const updatedAdaptorListSelector = useSelector(state => componentAdaptorSelector(state));
    const {tableEnvAdaptorsColumn, columnHeaderList, selectedValue} = useSelector((state) => state.envConfig);
    const {sortBy, orderBy} = useSelector((state) => state.envManagement);
    const filteredAdaptorList = useSelector(state => filterableDataSelector(state));
    const [enableClearConfirmation, setEnableClearConfirmation] = useState(false);
    const [activeRuleIndex, setActiveRuleIndex] = useState(1);
    const [enableFilterDialog, setEnableFilterDialog] = useState(false);
    const [selectedCondition, setSelectedCondition] = useState({});
    const [conditionList, setConditionList] = useState([]);
    const [selectedFilterValue, setSelectedFilterValue] = useState({});
    const [selectedEnabledValue, setSelectedEnabledValue] = useState("False");
    const [filterApply, setFilterApply] = useState(false);
    const [enableDeleteConfirmation, setEnableDeleteConfirmation] = useState(false);
    const [enableStatisticPopup, setEnableStatisticPopup] = useState(false);
    const [displayTableFilterList, setDisplayTableFilterList] = useState(filteredAdaptorList);
    const [removeSelectedRuleFlag, setRemoveSelectedRuleFlag] = useState(false);
    const [enableAddAdaptorPopup, setEnableAddAdaptorPopup] = useState(false);
    const [tableEnvListColumn, setTableEnvListColumn] = useState([{
        id: 2,
        name: 'envId',
        caption: t('sysmgr.fields.id.caption'),
        colWidth: 250
    },
        {id: 3, name: 'envName', caption: t('admin.envconfig.component.adaptors.name.label'), colWidth: 200},
        {id: 4, name: 'description', caption: t('admin.envmgt.create.description.label'), colWidth: 200},
        {id: 5, name: 'lastModifiedUser', caption: t('sysmgr.fields.lastModifiedUser.caption'), colWidth: 180},
        {id: 6, name: 'lastModifiedDate', caption: t('sysmgr.fields.lastModifiedDate.caption'), colWidth: 180}]);

    const [disableAdaptorActionIcon, setDisableAdaptorActionIcon] =
        useState([t('toolseo.toolname.sysadmin.enable'), t('toolseo.toolname.sysadmin.disable'), t('toolseo.toolname.ipd.sysmgr.contextview.tool.edit'),
            t('toolseo.toolname.ipd.sysmgr.contextview.tool.remove'), t('toolseo.toolname.ipd.sysmgr.contextview.tool.copy'), t('toolseo.toolname.sysadmin.stats'),
            t('toolseo.toolname.sysadmin.log')]);

    const [selectedColumnHeader, setSelectedColumnHeader] = useState({
        id: 1,
        name: "anyColumn",
        caption: t('any_column_filter_com_adaptor'),
        colWidth: '112px'
    });

    useEffect(() => {
        return () => {
            setDisableAdaptorActionIcon([t('toolseo.toolname.sysadmin.enable'), t('toolseo.toolname.sysadmin.disable'), t('toolseo.toolname.ipd.sysmgr.contextview.tool.edit'),
                t('toolseo.toolname.ipd.sysmgr.contextview.tool.remove'), t('toolseo.toolname.ipd.sysmgr.contextview.tool.copy'), t('toolseo.toolname.sysadmin.stats'),
                t('toolseo.toolname.sysadmin.log')])
        }
    }, [location.pathname, resetEnvConfigState]);

    useEffect(() => {
        onClearBtnClick();
        dispatch(resetTableAdaptorsColumnWidth())
    }, [resetEnvConfigState]);

    useEffect(() => {
        if (filteredAdaptorList && !enableFilterDialog) {
            const updatedDisplayList = [...filteredAdaptorList];
            setDisplayTableFilterList(updatedDisplayList)
        }
    }, [filteredAdaptorList, enableFilterDialog]);

    const headerEnvIcon = <Icons icon={ICONS.MODULE_PREFERENCES}/>;
    const addIcon = <Icons icon={ICONS.GRID_ADD}/>;
    const logIcon = <Icons icon={ICONS.ENV_LOG}/>;
    const disableIcon = <Icons icon={ICONS.DELETE_OUTLINE}/>;
    const enableIcon = <Icons icon={ICONS.SUCCESS}/>;
    const gridEditIcon = <Icons icon={ICONS.GRID_EDIT}/>;
    const gridDeleteIcon = <Icons icon={ICONS.GRID_REMOVE}/>;
    const copyIcon = <Icons icon={ICONS.GRID_DUPLICATE}/>;
    const graphIcon = <Icons icon={ICONS.GRAPH}/>;

    const checkDisableButtonList = (buttonText) => {
        const disabledArray = _.find(disableAdaptorActionIcon, (button) => {
            return button === buttonText;
        });
        return disabledArray
    };
    const onEnableDisableClick = async (enableValue) => {
        const response = await adaptorEnablement(selectedConfigTableRow, enableValue);
        if (response.status === 200) {
            await getEnvConfigAdaptorsList();
        }
    };
    const onDeleteAdaptorClick = () => {
        setEnableDeleteConfirmation(true);
    };
    const onDeleteOkClick = async () => {
        setEnableDeleteConfirmation(false);
        const deleteRes = await deleteSelectedAdaptor(selectedConfigTableRow);
        if(deleteRes.status === 200){
            await getEnvConfigAdaptorsList();
            setDisableAdaptorActionIcon([t('toolseo.toolname.sysadmin.enable'), t('toolseo.toolname.sysadmin.disable'), t('toolseo.toolname.ipd.sysmgr.contextview.tool.edit'),
                t('toolseo.toolname.ipd.sysmgr.contextview.tool.remove'), t('toolseo.toolname.ipd.sysmgr.contextview.tool.copy'), t('toolseo.toolname.sysadmin.stats'),
                t('toolseo.toolname.sysadmin.log')])
        }
    };
    const onDeleteClose = () => {
        setEnableDeleteConfirmation(false);
    };
    const onStatisticsClick = async () => {
        const response = await getAdaptorsStatisticList(selectedConfigTableRow);
        if(response.status === 200) {
            setEnableStatisticPopup(true);
        }
    };
    const onLogBtnClick = () =>{
        dispatch(setEnableConfigLogView(true));
        dispatch(setEnableSingleJobAction({name: 'log', jobId: selectedConfigTableRow.id, jobInstanceId: selectedConfigTableRow.id}))
    };

    const onAddComponentAdaptorClick = () =>{
        setEnableAddAdaptorPopup(true)
    };

    const envListActions = [];
    const adaptorsActions = [];
    adaptorsActions.push(<Button icon={enableIcon} title={t('toolseo.tooltipname.sysadmin.enable')}
                                 text={t('toolseo.toolname.sysadmin.enable')} className={styles.buttonIcon}
                                 disabled={checkDisableButtonList(t('toolseo.toolname.sysadmin.enable'))}
                                 onClick={() => {
                                     onEnableDisableClick(true)
                                 }}/>);
    adaptorsActions.push(<Button icon={disableIcon} title={t('toolseo.tooltipname.sysadmin.disable')}
                                 text={t('toolseo.toolname.sysadmin.disable')} className={styles.buttonIcon}
                                 disabled={checkDisableButtonList(t('toolseo.toolname.sysadmin.disable'))}
                                 onClick={() => {
                                     onEnableDisableClick(false)
                                 }}/>);
    adaptorsActions.push(<Button icon={addIcon} title={t('toolseo.tooltipname.ipd.sysmgr.contextview.tool.add')}
                                 text={t('toolseo.toolname.ipd.sysmgr.contextview.tool.add')}
                                 className={styles.buttonIcon} onClick={onAddComponentAdaptorClick}
                                 disabled={checkDisableButtonList(t('toolseo.toolname.ipd.sysmgr.contextview.tool.add'))}/>);
    adaptorsActions.push(<Button icon={gridEditIcon} title={t('toolseo.tooltipname.ipd.sysmgr.contextview.tool.edit')}
                                 text={t('toolseo.toolname.ipd.sysmgr.contextview.tool.edit')}
                                 className={styles.buttonIcon}
                                 disabled={checkDisableButtonList(t('toolseo.toolname.ipd.sysmgr.contextview.tool.edit'))}/>);
    adaptorsActions.push(<Button icon={gridDeleteIcon}
                                 title={t('toolseo.tooltipname.ipd.sysmgr.contextview.tool.remove')}
                                 text={t('toolseo.toolname.ipd.sysmgr.contextview.tool.remove')}
                                 className={styles.buttonIcon}
                                 disabled={checkDisableButtonList(t('toolseo.toolname.ipd.sysmgr.contextview.tool.remove'))}
                                 onClick={onDeleteAdaptorClick}/>);
    adaptorsActions.push(<Button icon={copyIcon} title={t('toolseo.tooltipname.ipd.sysmgr.contextview.tool.copy')}
                                 text={t('toolseo.toolname.ipd.sysmgr.contextview.tool.copy')}
                                 className={styles.buttonIcon}
                                 disabled={checkDisableButtonList(t('toolseo.toolname.ipd.sysmgr.contextview.tool.copy'))}/>);
    adaptorsActions.push(<Button icon={graphIcon} title={t('toolseo.tooltipname.sysadmin.stats')}
                                 text={t('toolseo.toolname.sysadmin.stats')} className={styles.buttonIcon}
                                 disabled={checkDisableButtonList(t('toolseo.toolname.sysadmin.stats'))}
                                 onClick={onStatisticsClick}/>);
    adaptorsActions.push(<Button icon={logIcon} title={t('toolseo.tooltip.sysadmin.log')}
                                 text={t('toolseo.toolname.sysadmin.log')} className={styles.buttonIcon}
                                 disabled={checkDisableButtonList(t('toolseo.toolname.sysadmin.log'))}
                                 onClick={onLogBtnClick}/>);

    const actionsOnActiveTableRowClick = (data) => {
        if (!Array.isArray(data)) {
            setDisableAdaptorActionIcon([]);
            dispatch(updateSelectedConfigTableRow(data))
        } else {
            const clonedArr = [t('toolseo.toolname.ipd.sysmgr.contextview.tool.edit'),
                t('toolseo.toolname.ipd.sysmgr.contextview.tool.copy'), t('toolseo.toolname.sysadmin.log')];
            setDisableAdaptorActionIcon(clonedArr);
            dispatch(updateSelectedConfigTableRow(data))
        }
    };

    const onCloseFilterPopup = () => {
        if (!filterApply) {
            dispatch(setRuleList([{
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
        setEnableFilterDialog(false);
    };

    const onClearBtnClick = async () => {
        if (ruleList.length === 1) {
            setFilterApply(false);
            setEnableFilterDialog(false);
            const resetRuleList = [{
                id: 1,
                name: `${t('sysmgr.fields.rule.caption')} 1`,
                column: t('any_column_filter_com_adaptor'),
                condition: t('admin_envConfig_filter_condition'),
                value: ''
            }];
            setActiveRuleIndex(1);
            dispatch(setRuleList(resetRuleList));
            setSelectedFilterValue({});
            setSelectedColumnHeader({
                id: 1,
                name: "anyColumn",
                caption: t('any_column_filter_com_adaptor'),
                colWidth: '112px'
            });
            await getEnvConfigAdaptorsList();
            setRemoveSelectedRuleFlag(false);
        } else if (ruleList.length > 1) {
            setEnableClearConfirmation(true)
        }
    };

    const onOpenFilter = (event) => {
        event.stopPropagation();
        setEnableFilterDialog(true);
    };
    const onFilterClicked = (event, column) => {
        event.stopPropagation();
        setSelectedColumnHeader(column);
        setEnableFilterDialog(true);
    };

    const onColumnSort = (sortBy, sortDirection) => {
        let orderBy = '';
        if (sortDirection === 'Asc') {
            orderBy = 'asc'
        } else {
            orderBy = 'desc'
        }
        dispatch(onSortingConfigColumn({sortBy, orderBy}))
    };
    const setTableColumnsWidth = (clonedData) => {
        dispatch(setTableEnvAdaptorsColumn(clonedData))
    };

    const onRemoveSelectedRule = (rule, index) => {
        setRemoveSelectedRuleFlag(true);
        let clonedRuleList = JSON.stringify(ruleList);
        clonedRuleList = JSON.parse(clonedRuleList);
        let remainingArr = clonedRuleList.filter((item) => item.id !== rule.id);
        const updatedRuleArr = _.map(remainingArr, (value, index) => {
            value.id = index + 1;
            return value
        });
        setActiveRuleIndex(1);
        let conditionArray = [];
        if (updatedRuleArr[0].column === t('any_column_filter_com_adaptor') || updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.env.label') ||
            updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.name.label') || updatedRuleArr[0].column === t('admin.envmgt.promote.stats.type.label') ||
            updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.process.label') || updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.queue.label')) {
            conditionArray = [{id: 1, name: "contains", caption: t('admin_envConfig_filter_condition'), colWidth: 112},
                {id: 2, name: "is", caption: t('admin_envConfig_filter_is'), colWidth: 112},
                {id: 3, name: "startsWith", caption: t('label.roleselection.StartWith').toLowerCase(), colWidth: 112},
                {id: 4, name: "endsWith", caption: t('admin_envConfig_filter_endsWith'), colWidth: 112},
                {id: 5, name: "doesNoContain", caption: t('admin_envConfig_filter_doesNot'), colWidth: 112},
                {id: 6, name: "isNot", caption: t('admin_envConfig_filter_isNot'), colWidth: 112},
                {id: 7, name: "doesNotStartWith", caption: t('admin_envConfig_filter_doesNotStart'), colWidth: 112},
                {id: 8, name: "doesNotEndWith", caption: t('admin_envConfig_filter_doesNotEnd'), colWidth: 112},
                {id: 9, name: "isEmpty", caption: t('admin_envConfig_filter_isEmpty'), colWidth: 112}];
            setConditionList(conditionArray);
        } else if (updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.enabled.label')) {
            conditionArray = [
                {id: 2, name: "is", caption: t('admin_envConfig_filter_is'), colWidth: 112},
                {id: 9, name: "isEmpty", caption: t('admin_envConfig_filter_isEmpty'), colWidth: 112},
            ];
            setConditionList(conditionArray);

        } else if (updatedRuleArr[0].column === t('sysmgr.fields.numOfInstances.caption')) {
            conditionArray = [{id: 10, name: "equal", caption: t('admin_envConfig_filter_equal'), colWidth: 112},
                {id: 11, name: "doesNotEqual", caption: t('admin_envConfig_filter_doesNotEqual'), colWidth: 112},
                {id: 12, name: "lessThan", caption: t('admin_envConfig_filter_lessThan').toLowerCase(), colWidth: 112},
                {id: 13, name: "lessThanOrEqual", caption: t('admin_envConfig_filter_lessThanOrEqual'), colWidth: 112},
                {id: 14, name: "greaterThan", caption: t('admin_envConfig_filter_greaterThan'), colWidth: 112},
                {
                    id: 15,
                    name: "greaterThanOrEqual",
                    caption: t('admin_envConfig_filter_greaterThanOrEqual'),
                    colWidth: 112
                },
                {id: 9, name: "isEmpty", caption: t('admin_envConfig_filter_isEmpty'), colWidth: 112}];
            setConditionList(conditionArray);
        }
        let dataArrayList;
        if (updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.env.label')) {
            dataArrayList = _.map(updatedAdaptorListSelector, (adaptor, index) => {
                return {id: index + 1, name: adaptor.environment}
            });
        } else if (updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.name.label')) {
            dataArrayList = _.map(updatedAdaptorListSelector, (adaptor, index) => {
                return {id: index + 1, name: adaptor.name}
            });
        } else if (updatedRuleArr[0].column === t('admin.envmgt.promote.stats.type.label')) {
            dataArrayList = _.map(updatedAdaptorListSelector, (adaptor, index) => {
                return {id: index + 1, name: adaptor.adaptorTypeId}
            });
        } else if (updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.process.label')) {
            dataArrayList = _.map(updatedAdaptorListSelector, (adaptor, index) => {
                return {id: index + 1, name: adaptor.process}
            });
        } else if (updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.queue.label')) {
            dataArrayList = _.map(updatedAdaptorListSelector, (adaptor, index) => {
                return {id: index + 1, name: adaptor.workQueue}
            });
        }
        const columnObjArr = _.filter(columnHeaderList, (item) => {
            return item.caption === updatedRuleArr[0].column
        });
        const conditionObjArr = _.filter(conditionArray, (item) => {
            return item.caption === updatedRuleArr[0].condition
        });
        const valueObjArr = _.filter(dataArrayList, (item) => {
            return item.name === updatedRuleArr[0].value
        });
        setSelectedColumnHeader(columnObjArr[0]);
        setSelectedCondition(conditionObjArr[0]);
        if (valueObjArr.length > 0) {
            setSelectedFilterValue(valueObjArr[0]);
        }
        if (updatedRuleArr[0].column === t('admin.envconfig.component.adaptors.enabled.label')) {
            setSelectedEnabledValue(updatedRuleArr[0].value)
        }
        dispatch(setRuleList(updatedRuleArr));
    };
    const updateColumnHeaderList = (tempArray) =>{
        dispatch(setColumnHeaderList(tempArray));
    };
    const updateFilterRuleList = (clonedRuleList) =>{
        dispatch(setRuleList(clonedRuleList))
    };
    const handleSelectedValueChange = (item) =>{
        dispatch(setSelectedValue(item));
    };

    return <>
        <ReflexContainer orientation="horizontal">
            <ReflexElement flex={1}>
                {
                    location.pathname === '/environments' ?
                        <Table
                            loading={loading}
                            tableId={'environments'}
                            headerIcon={headerEnvIcon}
                            defaultSortingFlag={true}
                            headerTitle={t('admin.envconfig.envlist.title')}
                            actions={<HeaderActions minimal={true} actions={envListActions}/>}
                            searchResultCol={tableEnvListColumn}
                            tableData={updatedEnvListSelector}
                            colNames={tableEnvListColumn}
                            setTableColumnsWidth={setTableEnvListColumn}
                            searchResult={updatedEnvListSelector}
                            isSortable={true}
                            appType={"UlteraAdmin"}
                            onColumnSort={onColumnSort}
                            setEnabledButtonArray={setEnabledButtonArray}
                        /> :
                        location.pathname === '/componentAdaptors' &&
                        <TableFilter
                            loading={loading}
                            tableId={'componentAdaptors'}
                            ruleList={ruleList}
                            onOpenFilter={onOpenFilter}
                            filterApply={filterApply}
                            headerIcon={headerEnvIcon}
                            headerTitle={t('admin.envconfig.component.adaptors.title')}
                            actions={<HeaderActions minimal={true} actions={adaptorsActions}/>}
                            onFilterClicked={onFilterClicked}
                            searchResultCol={tableEnvAdaptorsColumn}
                            colNames={tableEnvAdaptorsColumn}
                            tableData={displayTableFilterList}
                            searchResult={displayTableFilterList}
                            isSortable={true}
                            filteredAdaptorList={filteredAdaptorList}
                            adaptorsList={updatedAdaptorListSelector}
                            setTableColumnsWidth={setTableColumnsWidth}
                            actionsOnTableRowClick={actionsOnActiveTableRowClick}
                            onColumnSort={onColumnSort}
                            applyFilter={null}
                            appType={"UlteraAdmin"}
                            setActiveRuleIndex={setActiveRuleIndex}
                            onClearBtnClick={onClearBtnClick}
                            onRemoveSelectedRule={onRemoveSelectedRule}
                            setEnableFilterDialog={setEnableFilterDialog}
                            enableFilterDialog={enableFilterDialog}
                            matchSelectedValue={selectedValue}
                            setEnabledButtonArray={setEnabledButtonArray}
                            sortBy={sortBy}
                            orderBy={orderBy}
                            resetEnvConfigState={resetEnvConfigState}
                            showFilterBtnOnColumn={'enabled'}
                        />
                }
            </ReflexElement>
        </ReflexContainer>
        <FilterComponent enableFilterDialog={enableFilterDialog} setFilterApply={setFilterApply}
                         adaptorsList={updatedAdaptorListSelector}
                         setSelectedColumnHeader={setSelectedColumnHeader} selectedColumnHeader={selectedColumnHeader}
                         filterApply={filterApply}
                         onClose={onCloseFilterPopup} tableEnvAdaptorsColumn={tableEnvAdaptorsColumn}
                         setEnableFilterDialog={setEnableFilterDialog}
                         activeRuleIndex={activeRuleIndex} setActiveRuleIndex={setActiveRuleIndex}
                         enableClearConfirmation={enableClearConfirmation}
                         setEnableClearConfirmation={setEnableClearConfirmation}
                         setSelectedFilterValue={setSelectedFilterValue} selectedFilterValue={selectedFilterValue}
                         setSelectedEnabledValue={setSelectedEnabledValue} selectedEnabledValue={selectedEnabledValue}
                         removeSelectedRuleFlag={removeSelectedRuleFlag} selectedValue={selectedValue}
                         setRemoveSelectedRuleFlag={setRemoveSelectedRuleFlag} ruleList={ruleList} columnHeaderList={columnHeaderList}
                         onClearBtnClick={onClearBtnClick} updateColumnHeaderList={updateColumnHeaderList} updateFilterRuleList={updateFilterRuleList}
                         handleSelectedValueChange={handleSelectedValueChange}/>
        {
            dialogLoading &&
            <ConfirmationDialog
                showDialog={true}
                divideByX={3}
                icon={<div className={styles.loadingGifStyle}/>}
                headerText={t('progress_popup_header')}
                body={<Label style={{height: 100}}>{t('message_pleaseWait')}</Label>}
                transitionDuration={300}
                isCloseButtonShown={false}/>
        }
        {
            enableDeleteConfirmation &&
            <ConfirmationDialog
                showDialog={true}
                icon={<Icons icon={ICONS.QUESTION_MARK_ICON}/>}
                headerText={'Confirmation'}
                width={400}
                divideByX={3}
                onYesBtnClick={onDeleteOkClick}
                yesButtonText={t('ipd.cag.yes')}
                noButtonText={t('ipd.cag.no')}
                onNoBtnClick={onDeleteClose}
                isCloseButtonShown={true}
                onClose={onDeleteClose}
                body={<div className={styles.bodyStyle}>
                    <h4 className={styles.textStyle}>{t('admin_adaptor_delete_msg')}</h4>
                    <h4 className={styles.textStyle}>{t('label_click')}<b>{t('ipd.cag.yes')}</b>{t('label_to_continue_or')}<b>{t('ipd.cag.no')}</b> {t('label_to_cancel')}
                    </h4>
                </div>}
            />
        }
        { enableStatisticPopup &&
            <StatisticsAdaptorComponent enableStatisticPopup={true}
                                        setEnableStatisticPopup={setEnableStatisticPopup}/>
        }
        {
            enableAddAdaptorPopup &&
                <AddComponentAdaptor enableAddAdaptorPopup={true} setEnableAddAdaptorPopup={setEnableAddAdaptorPopup}/>
        }
    </>
};

export default EnvironmentConfigComponent;