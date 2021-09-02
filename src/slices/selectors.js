import i18n from '../i18n';
import { createSelector } from 'reselect';
import moment from "moment";
import _ from "lodash";
const jobsDataSelector = state => state.envManagement.jobsHistoryData;
const activeJobsSelector = state => state.envManagement.activeJobsData;
const envMgmtSortBy = state => state.envManagement.sortBy;
const envMgmtOrderBy = state => state.envManagement.orderBy;
const envListSelector = state => state.envConfig.envList;
const envConfigSortBy = state => state.envConfig.sortBy;
const envConfigOrderBy = state => state.envConfig.orderBy;
const adaptorSelector = state => state.envConfig.adaptorsList;
const filterArray = state => state.envConfig.ruleList;
const adaptorColumnHeaderList = state => state.envConfig.columnHeaderList;
const tableEnvAdaptorsColumn = state => state.envConfig.tableEnvAdaptorsColumn;
const matchSelectedValue = state => state.envConfig.selectedValue;
const activeLogsListSelector = state => state.envManagement.activeLogsList;
const statisticSelector = state => state.envConfig.statisticsList;
const statsFilterArray = state => state.envConfig.statsRuleList;
const statsAdaptorColumnHeaderList = state => state.envConfig.statsColumnHeaderList;
const tableAdaptorsStatsColumn = state => state.envConfig.tableAdaptorsStatsColumn;
const matchStatsSelectedValue = state => state.envConfig.statsSelectedValue;
const envConfigStatsSortBy = state => state.envConfig.statsSortBy;
const envConfigStatsOrderBy = state => state.envConfig.statsOrderBy;
const importEntityData = state => state.envManagement.importEntityData;
const selectedEntity = state => state.envManagement.selectedEntity;
const userBatchActiveJobList = state => state.envManagement.userBatchActiveJobList;
const batchSortBy = state => state.envManagement.batchSortBy;
const batchOrderBy = state => state.envManagement.batchOrderBy;

const temp_Is = (value, actualObj, columnName, tableEnvAdaptorsColumn) => {
    if(columnName !== 'anyColumn') {
        return value == actualObj[columnName];
    }else{
        const actualKeys = _.map(tableEnvAdaptorsColumn, (columnObj, index)=>{
                    return columnObj.name
            });
        let found = false;
        for(let i = 0; i < actualKeys.length; ++i) {
            const key = actualKeys[i];
            const response = actualObj[key] == value
            if (response) {
                found = true;
                break
            }
        }
        return found;
    }
};

const temp_isNot = (value, actualObj, columnName, tableEnvAdaptorsColumn) => {
    if(columnName !== 'anyColumn') {
        return value != actualObj[columnName];
    }else{
        const actualKeys = _.map(tableEnvAdaptorsColumn, (columnObj, index)=>{
            return columnObj.name
        });
        let found = false;
        for(let i = 0; i < actualKeys.length; ++i) {
            const key = actualKeys[i];
            const response = actualObj[key] != value
            if (response) {
                found = true;
                break
            }
        }
        return found;
    }
};
const temp_startsWith = (value, actualObj, columnName, tableEnvAdaptorsColumn) => {
    if(columnName !== 'anyColumn') {
        return _.startsWith(actualObj[columnName]?.toLowerCase(), value?.toLowerCase())
    }else{
        const actualKeys = _.map(tableEnvAdaptorsColumn, (columnObj, index)=>{
            return columnObj.name
        });
        let found = false;
        for(let i = 0; i < actualKeys.length; ++i) {
            const key = actualKeys[i];
            const response = _.startsWith(actualObj[key], value);
            if (response) {
                found = true;
                break
            }
        }
        return found;
    }
};
const temp_notStartWith = (value, actualObj, columnName, tableEnvAdaptorsColumn) => {
    if(columnName !== 'anyColumn') {
        return !_.startsWith(actualObj[columnName]?.toLowerCase(), value?.toLowerCase())
    }else{
        const actualKeys = _.map(tableEnvAdaptorsColumn, (columnObj)=>{
            return columnObj.name
        });
        let found = false;
        for(let i = 0; i < actualKeys.length; ++i) {
            const key = actualKeys[i];
            const response = !_.startsWith(actualObj[key], value);
            if (response) {
                found = true;
                break
            }
        }

        return found;
    }
};
const temp_endsWith = (value, actualObj, columnName, tableEnvAdaptorsColumn) => {
    if(columnName !== 'anyColumn') {
        return _.endsWith(actualObj[columnName]?.toLowerCase(), value?.toLowerCase())
    }else{
        const actualKeys = _.map(tableEnvAdaptorsColumn, (columnObj, index)=>{
            return columnObj.name
        });
        let found = false;
        for(let i = 0; i < actualKeys.length; ++i) {
            const key = actualKeys[i];
            const response = _.endsWith(actualObj[key], value);
            if (response) {
                found = true;
                break
            }
        }
        return found;
    }
};

const temp_notEndWith = (value, actualObj, columnName, tableEnvAdaptorsColumn) => {
    if(columnName !== 'anyColumn') {
        return !_.endsWith(actualObj[columnName]?.toLowerCase(), value?.toLowerCase())
    }else{
        const actualKeys = _.map(tableEnvAdaptorsColumn, (columnObj)=>{
            return columnObj.name
        });
        let found = false;
        for(let i = 0; i < actualKeys.length; ++i) {
            const key = actualKeys[i];
            const response = !_.endsWith(actualObj[key], value);
            if (response) {
                found = true;
                break
            }
        }
        return found;
    }
};

const temp_Contains = (value, actualObj, columnName, tableEnvAdaptorsColumn) => {
    if(columnName !== 'anyColumn') {
        return actualObj[columnName]?.toLowerCase()?.includes(value?.toLowerCase())
    }else{
        const actualKeys = _.map(tableEnvAdaptorsColumn, (columnObj)=>{
            return columnObj.name
        });
        let found = false;
        for(let i = 0; i < actualKeys.length; ++i) {
            const key = actualKeys[i];
            let tempValue = JSON.stringify(actualObj[key]);
            const response = tempValue?.includes(value);
            if (response) {
                found = true;
                break
            }
        }
        return found;
    }
};
const temp_DoesNotContain = (value, actualObj, columnName, tableEnvAdaptorsColumn) => {
    if(columnName !== 'anyColumn') {
        return !actualObj[columnName]?.toLowerCase()?.includes(value.toLowerCase())
    }else{
        const actualKeys = _.map(tableEnvAdaptorsColumn, (columnObj)=>{
            return columnObj.name
        });
        let found = false;
        for(let i = 0; i < actualKeys.length; ++i) {
            const key = actualKeys[i];
            let tempValue = JSON.stringify(actualObj[key]);
            const response = !(tempValue?.includes(value));
            if (response) {
                found = true;
                break
            }
        }
        return found;
    }
};
const temp_isEmpty = (actualObj, columnName, tableEnvAdaptorsColumn) => {
    if(columnName !== 'anyColumn') {
        return (actualObj[columnName] == ''|| actualObj[columnName] == null)
    }else{
        const actualKeys = _.map(tableEnvAdaptorsColumn, (columnObj)=>{
            return columnObj.name
        });
        let found = false;
        for(let i = 0; i < actualKeys.length; ++i) {
            const key = actualKeys[i];
            const response = actualObj[key] == '' || actualObj[key] == null;
            if (response) {
                found = true;
                break
            }
        }
        return found;
    }

};

const temp_isLessOrGreaterThan = (value, actualObj, columnName, tableEnvAdaptorsColumn, condition) => {
    if(columnName !== 'anyColumn') {
        if(condition === 'is less than') {
            return value > actualObj[columnName];
        }else if(condition === 'is greater than'){
            return value < actualObj[columnName];
        }
    }else{
        const actualKeys = _.map(tableEnvAdaptorsColumn, (columnObj, index)=>{
            return columnObj.name
        });
        let found = false;
        for(let i = 0; i < actualKeys.length; ++i) {
            const key = actualKeys[i];
            let response;
            if(condition === 'is less than') {
                 response = actualObj[key] < value;
            }else if(condition === 'is greater than'){
                 response = actualObj[key] > value;
            }
            if (response) {
                found = true;
                break
            }
        }
        return found;
    }
};

const temp_ThanOrEqual = (value, actualObj, columnName, tableEnvAdaptorsColumn, condition) => {
    if(columnName !== 'anyColumn') {
        if(condition === 'less than or equal') {
            return value >= actualObj[columnName];
        }else if(condition === 'greater than or equal'){
            return value <= actualObj[columnName];
        }
    }else{
        const actualKeys = _.map(tableEnvAdaptorsColumn, (columnObj, index)=>{
            return columnObj.name
        });
        let found = false;
        for(let i = 0; i < actualKeys.length; ++i) {
            const key = actualKeys[i];
            let response;
            if(condition === 'less than or equal') {
                 response = actualObj[key] <= value;
            }else if(condition === 'greater than or equal'){
                 response = actualObj[key] >= value;
            }
            if (response) {
                found = true;
                break
            }
        }
        return found;
    }
};

const conditionExecute = (columnName, condition, value, actualObj, tableEnvAdaptorsColumn) => {
    switch (condition) {
        case i18n.t('admin_envConfig_filter_is'):
            return temp_Is(value, actualObj,columnName, tableEnvAdaptorsColumn);
        case i18n.t('admin_envConfig_filter_equal'):
            return temp_Is(value, actualObj,columnName, tableEnvAdaptorsColumn);
        case i18n.t('label.roleselection.StartWith').toLowerCase():
            return temp_startsWith(value, actualObj,columnName, tableEnvAdaptorsColumn);
        case i18n.t('admin_envConfig_filter_condition'):
            return temp_Contains(value, actualObj,columnName, tableEnvAdaptorsColumn);
        case i18n.t('admin_envConfig_filter_endsWith'):
            return temp_endsWith(value, actualObj,columnName, tableEnvAdaptorsColumn);
        case i18n.t('admin_envConfig_filter_doesNot'):
            return temp_DoesNotContain(value, actualObj,columnName, tableEnvAdaptorsColumn);
        case i18n.t('admin_envConfig_filter_isNot'):
            return temp_isNot(value, actualObj,columnName, tableEnvAdaptorsColumn);
        case i18n.t('admin_envConfig_filter_doesNotStart'):
            return temp_notStartWith(value, actualObj,columnName, tableEnvAdaptorsColumn);
        case i18n.t('admin_envConfig_filter_doesNotEnd'):
            return temp_notEndWith(value, actualObj,columnName, tableEnvAdaptorsColumn);
        case i18n.t('admin_envConfig_filter_isEmpty'):
            return temp_isEmpty(actualObj,columnName, tableEnvAdaptorsColumn);
        case i18n.t('admin_envConfig_filter_doesNotEqual'):
            return temp_isNot(value,actualObj,columnName, tableEnvAdaptorsColumn);
        case i18n.t('admin_envConfig_filter_lessThan'):
            return temp_isLessOrGreaterThan(value,actualObj,columnName, tableEnvAdaptorsColumn, condition);
        case i18n.t('admin_envConfig_filter_lessThanOrEqual'):
            return temp_ThanOrEqual(value,actualObj,columnName, tableEnvAdaptorsColumn, condition);
        case i18n.t('admin_envConfig_filter_greaterThan'):
            return temp_isLessOrGreaterThan(value,actualObj,columnName, tableEnvAdaptorsColumn, condition);
        case i18n.t('admin_envConfig_filter_greaterThanOrEqual'):
            return temp_ThanOrEqual(value,actualObj,columnName, tableEnvAdaptorsColumn, condition);
        default:
            return actualObj
    }
};

export const JobsHistorySelector = createSelector(jobsDataSelector, envMgmtSortBy,envMgmtOrderBy,
    (jobsHistoryData, envMgmtSortBy, envMgmtOrderBy) => {
    let newArray = [];
    if(jobsHistoryData) {
        const clonedJobsHistory = _.orderBy([...jobsHistoryData], [envMgmtSortBy], [envMgmtOrderBy]);
        clonedJobsHistory.forEach((job) => {
            const newObj = {...job};
            newObj.startDate = moment(job.startDate).format(i18n.t('date_format_translation'));
            newArray.push(newObj)
        });
    }
    return newArray
});
export const ActiveJobsSelector = createSelector(activeJobsSelector, envMgmtSortBy, envMgmtOrderBy,
    (activeJobsData,envMgmtSortBy,envMgmtOrderBy ) => {
    let newArray = [];
    if(activeJobsData) {
        const clonedActiveJobs = _.orderBy([...activeJobsData], [envMgmtSortBy], [envMgmtOrderBy]);
        clonedActiveJobs.forEach((job) => {
            const newObj = {...job};
            newObj.startDate = moment(job.startDate).format(i18n.t('date_format_translation'));
            newArray.push(newObj)
        });
    }
    return newArray
});

export const environmentsSelector = createSelector(envListSelector,envConfigSortBy, envConfigOrderBy,
    (envList, envConfigSortBy, envConfigOrderBy) => {
    let newArray = [];
    if(envList) {
        const clonedEnvList = _.orderBy([...envList], [envConfigSortBy], [envConfigOrderBy]);
        clonedEnvList.forEach((envObj) => {
            const newObj = {...envObj};
            newObj.lastModifiedDate = moment(envObj.lastModifiedDate).format(i18n.t('date_format_translation'));
            newArray.push(newObj)
        });
    }
    return newArray
});

export const componentAdaptorSelector = createSelector(adaptorSelector,envConfigSortBy, envConfigOrderBy,
    (adaptorsList, envConfigSortBy, envConfigOrderBy) => {

        const updatedAdaptorList = _.orderBy([...adaptorsList], [envConfigSortBy], [envConfigOrderBy]);

        return updatedAdaptorList
    });

export const filterableDataSelector = createSelector(adaptorSelector, filterArray,adaptorColumnHeaderList, tableEnvAdaptorsColumn, matchSelectedValue,envConfigSortBy,envConfigOrderBy,
    (adaptorSelector,filterArray,adaptorColumnHeaderList, tableEnvAdaptorsColumn, matchSelectedValue, envConfigSortBy, envConfigOrderBy ) => {
        let concatenatedArray = [];
        let modifiedTableData = adaptorSelector;
        _.each(filterArray,(filter)=>{
            const matchedObj = _.filter(adaptorColumnHeaderList, (adaptorObj)=> {
                return adaptorObj.caption == filter.column
            });
            const columnName = matchedObj[0]?.name;
            const value = filter.value;
            const condition = filter.condition;
            if(matchSelectedValue.name == i18n.t('admin_envConfig_filter_allRules')) {
                modifiedTableData = _.filter(modifiedTableData, (actualObj) => {
                    return conditionExecute(columnName, condition, value, actualObj, tableEnvAdaptorsColumn);
                })
            }else{
                let selectiveArr = _.filter(modifiedTableData, (actualObj) => {
                    return conditionExecute(columnName, condition, value, actualObj, tableEnvAdaptorsColumn);
                });
                concatenatedArray = concatenatedArray.concat(selectiveArr);
                concatenatedArray = _.uniqBy(concatenatedArray, 'id');
            }
        });
        let clonedAdaptorList;
        if(matchSelectedValue.name == i18n.t('admin_envConfig_filter_allRules')) {
            clonedAdaptorList = _.orderBy([...modifiedTableData], [envConfigSortBy], [envConfigOrderBy]);
        }else{
            clonedAdaptorList = _.orderBy([...concatenatedArray], [envConfigSortBy], [envConfigOrderBy]);
        }
        return clonedAdaptorList
    });

export const ActiveLogsListSelector = createSelector(activeLogsListSelector,
    (activeLogsList ) => {
        let newArray = [];
        if(activeLogsList) {
            activeLogsList?.forEach((log) => {
                const newObj = {...log};
                newObj.logDate = moment(log.logDate).format(i18n.t('logs_date_format_translation'));
                newArray.push(newObj)
            });
        }
        return newArray
    });

export const filterableStatsDataSelector = createSelector(statisticSelector, statsFilterArray, statsAdaptorColumnHeaderList, tableAdaptorsStatsColumn, matchStatsSelectedValue, envConfigStatsSortBy, envConfigStatsOrderBy,
    (statisticSelector,statsFilterArray,statsAdaptorColumnHeaderList, tableAdaptorsStatsColumn, matchStatsSelectedValue, envConfigStatsSortBy, envConfigStatsOrderBy ) => {

    let concatenatedArray = [];
        let modifiedTableData = statisticSelector;
        _.each(statsFilterArray,(filter)=>{
            const matchedObj = _.filter(statsAdaptorColumnHeaderList, (adaptorObj)=> {
                return adaptorObj.caption == filter.column
            });
            const columnName = matchedObj[0]?.name;
            const value = filter.value;
            const condition = filter.condition;
            if(matchStatsSelectedValue.name == i18n.t('admin_envConfig_filter_allRules')) {
                modifiedTableData = _.filter(modifiedTableData, (actualObj) => {
                    return conditionExecute(columnName, condition, value, actualObj, tableAdaptorsStatsColumn);
                })
            }else{
                let selectiveArr = _.filter(modifiedTableData, (actualObj) => {
                    return conditionExecute(columnName, condition, value, actualObj, tableAdaptorsStatsColumn);
                });
                concatenatedArray = concatenatedArray.concat(selectiveArr);
                concatenatedArray = _.uniqBy(concatenatedArray, 'id');
            }
        });
        let clonedAdaptorList;
        if(matchStatsSelectedValue.name == i18n.t('admin_envConfig_filter_allRules')) {
            clonedAdaptorList = _.orderBy([...modifiedTableData], [envConfigStatsSortBy], [envConfigStatsOrderBy]);
        }else{
            clonedAdaptorList = _.orderBy([...concatenatedArray], [envConfigStatsSortBy], [envConfigStatsOrderBy]);
        }

        return clonedAdaptorList
    });

export const adaptorStatisticsSelector = createSelector(statisticSelector,envConfigStatsSortBy, envConfigStatsOrderBy,
    (statisticList, envConfigStatsSortBy, envConfigStatsOrderBy) => {

        const updatedStatisticsList = _.orderBy([...statisticList], [envConfigStatsSortBy], [envConfigStatsOrderBy]);

        return updatedStatisticsList
    });

export const importingEntitySelector = createSelector(importEntityData, envMgmtSortBy,envMgmtOrderBy,
    (ImportEntityData, envMgmtSortBy, envMgmtOrderBy) => {
        let clonedImportEntities;
        if(ImportEntityData) {
             clonedImportEntities = _.orderBy([...ImportEntityData], [envMgmtSortBy], [envMgmtOrderBy]);
        }
        return clonedImportEntities
    });

export const promoteStatsDetailSelector = createSelector(selectedEntity, envMgmtSortBy,envMgmtOrderBy,
    (selectedEntity, envMgmtSortBy, envMgmtOrderBy) => {
        let clonedImportEntities;
        if(selectedEntity) {
            clonedImportEntities = _.orderBy([...selectedEntity], [envMgmtSortBy], [envMgmtOrderBy]);
        }
        return clonedImportEntities
    });

export const userBatchJobsSelector = createSelector(userBatchActiveJobList, batchSortBy, batchOrderBy,
    (userBatchActiveJobList, batchSortBy, batchOrderBy ) => {
        let newArray = [];
        if(userBatchActiveJobList) {
            newArray = _.orderBy([...userBatchActiveJobList], [batchSortBy], [batchOrderBy]);
        }
        return newArray
    });
