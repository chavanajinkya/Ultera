import {createSlice, createDraftSafeSelector} from "@reduxjs/toolkit";
import _ from "lodash";
import moment from "moment";
import i18n from '../i18n';

export const envConfigSlice = createSlice({
    name: "envConfig",
    initialState: {
        sortBy: '',
        orderBy: 'desc',
        envList: [],
        adaptorsList: [],
        dialogLoading:false,
        ruleList: [{
            id: 1,
            name: `${i18n.t('sysmgr.fields.rule.caption')} 1`,
            column: i18n.t('any_column_filter_com_adaptor'),
            condition: i18n.t('admin_envConfig_filter_condition'),
            value: ''
        }],
        tableEnvAdaptorsColumn: [  {id:2, name:'enabled', caption: i18n.t('admin.envconfig.component.adaptors.enabled.label'), colWidth:200},
            {id:3, name:'numOfInstances', caption: i18n.t('sysmgr.fields.numOfInstances.caption'), colWidth:150},
            {id:4, name:'environment', caption:i18n.t('admin.envconfig.component.adaptors.env.label'), colWidth:150},
            {id:5, name:'name', caption: i18n.t('admin.envconfig.component.adaptors.name.label'), colWidth:150},
            {id:6, name:'adaptorTypeId', caption: i18n.t('admin.envmgt.promote.stats.type.label'), colWidth:150},
            {id:7, name:'process', caption: i18n.t('admin.envconfig.component.adaptors.process.label'), colWidth:150},
            {id:8, name:'workQueue', caption: i18n.t('admin.envconfig.component.adaptors.queue.label'), colWidth:150}],
        columnHeaderList: [],
        selectedValue: {id: 1, name: i18n.t('admin_envConfig_filter_allRules')},
        selectedConfigTableRow: null,
        statsRuleList:[{
            id: 1,
            name: `${i18n.t('sysmgr.fields.rule.caption')} 1`,
            column: i18n.t('any_column_filter_com_adaptor'),
            condition: i18n.t('admin_envConfig_filter_condition'),
            value: ''
        }],
        tableAdaptorsStatsColumn: [
            {id:4, name:'environment', caption:i18n.t('admin.envconfig.component.adaptors.env.label'), colWidth:200},
            {id:5, name:'name', caption: i18n.t('admin.envconfig.component.adaptors.name.label'), colWidth:150},
            {id:2, name:'operation', caption: i18n.t('admin.envconfig.adaptors.stats.operation.label'), colWidth:150},
            {id:3, name:'instanceSize', caption: i18n.t('admin.envconfig.adaptors.stats.numinstances.label'), colWidth:150},
            {id:6, name:'averageThroughput', caption: i18n.t('admin.envconfig.adaptors.stats.avgthroughput.label'), colWidth:150},
            {id:7, name:'averageDuration', caption: i18n.t('admin.envconfig.adaptors.stats.avgduration.label'), colWidth:150}
            ],
        statisticsList: [],
        statsColumnHeaderList: [],
        statsSelectedValue: {id: 1, name: i18n.t('admin_envConfig_filter_allRules')},
        statsSortBy: '',
        statsOrderBy: 'desc',
        statsLoading:false,
        enableConfigLogView: false,
        selectedAdaptorsData: {
            enabled: false,
            selectedEnvironment: {},
            enteredName: "[New Item]",
            selectedProcess: {},
            selectedWorkQueue: {},
            selectedIndexOrder: {},
            enteredSchedulerExpression: "",
            enteredNumOfInstances: 1,
            selectedAdaptorType: {}
        }
    },
    reducers: {
        setStatsLoading:(state,data)=>{
            state.statsLoading= data.payload
        },
        setRuleList: (state, data) => {
            state.ruleList = data.payload
        },
        setTableEnvAdaptorsColumn:(state, data) => {
            state.tableEnvAdaptorsColumn = data.payload
        },
        setColumnHeaderList: (state, data) => {
            state.columnHeaderList = data.payload
        },
        setSelectedValue:(state, data) => {
            state.selectedValue = data.payload
        },
        updateEnvConfigEnList:(state, data) => {
            state.envList = data.payload
        },
        updateEnvConfigAdaptorsList:(state, data) => {
            state.adaptorsList = data.payload
        },
        onSortingConfigColumn:(state,data)=>{
            state.sortBy= data.payload.sortBy;
            state.orderBy= data.payload.orderBy
        },
        resetTableAdaptorsColumnWidth:(state) => {
            state.tableEnvAdaptorsColumn = [{id:2, name:'enabled', caption: i18n.t('admin.envconfig.component.adaptors.enabled.label'), colWidth:200},
                {id:3, name:'numOfInstances', caption: i18n.t('sysmgr.fields.numOfInstances.caption'), colWidth:150},
                {id:4, name:'environment', caption:i18n.t('admin.envconfig.component.adaptors.env.label'), colWidth:150},
                {id:5, name:'name', caption: i18n.t('admin.envconfig.component.adaptors.name.label'), colWidth:150},
                {id:6, name:'adaptorTypeId', caption: i18n.t('admin.envmgt.promote.stats.type.label'), colWidth:150},
                {id:7, name:'process', caption: i18n.t('admin.envconfig.component.adaptors.process.label'), colWidth:150},
                {id:8, name:'workQueue', caption: i18n.t('admin.envconfig.component.adaptors.queue.label'), colWidth:150}]
        },
        updateSelectedConfigTableRow:(state, data) => {
            state.selectedConfigTableRow = data.payload
        },
        setDialogLoading:(state, data) => {
            state.dialogLoading = data.payload
        },
        updateAdaptorsStatisticsList:(state, data) => {
            state.statisticsList = data.payload
        },
        setTableAdaptorsStatsColumn:(state, data) => {
            state.tableAdaptorsStatsColumn = data.payload
        },
        setColumnStatsHeaderList:(state, data) => {
            state.statsColumnHeaderList = data.payload
        },
        onSortingStatsColumn:(state,data)=>{
            state.statsSortBy= data.payload.sortBy;
            state.statsOrderBy= data.payload.orderBy
        },
        setStatsRuleList:(state, data) => {
            state.statsRuleList = data.payload
        },
        setStatsSelectedValue:(state, data) => {
            state.statsSelectedValue = data.payload
        },
        resetTableAdaptorsStatsColumnWidth:(state) => {
            state.tableAdaptorsStatsColumn = [
                {id:4, name:'environment', caption:i18n.t('admin.envconfig.component.adaptors.env.label'), colWidth:200},
                {id:5, name:'name', caption: i18n.t('admin.envconfig.component.adaptors.name.label'), colWidth:150},
                {id:2, name:'operation', caption: i18n.t('admin.envconfig.adaptors.stats.operation.label'), colWidth:150},
                {id:3, name:'instanceSize', caption: i18n.t('admin.envconfig.adaptors.stats.numinstances.label'), colWidth:150},
                {id:6, name:'averageThroughput', caption: i18n.t('admin.envconfig.adaptors.stats.avgthroughput.label'), colWidth:150},
                {id:7, name:'averageDuration', caption: i18n.t('admin.envconfig.adaptors.stats.avgduration.label'), colWidth:150}
            ]
        },
        setEnableConfigLogView:(state, data) => {
            state.enableConfigLogView = data.payload
        },
    },
});

// Action creators are generated for each case reducer function
export const {setRuleList, setTableEnvAdaptorsColumn, setColumnHeaderList, setSelectedValue, updateEnvConfigEnList, updateAdaptorsStatisticsList,
    updateEnvConfigAdaptorsList, onSortingConfigColumn, resetTableAdaptorsColumnWidth, updateSelectedConfigTableRow, setDialogLoading,setStatsSelectedValue,
    setTableAdaptorsStatsColumn, onSortingStatsColumn, setStatsRuleList, setStatsLoading, resetTableAdaptorsStatsColumnWidth, setColumnStatsHeaderList,
    setEnableConfigLogView} = envConfigSlice.actions;

export default envConfigSlice.reducer;
