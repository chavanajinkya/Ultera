import {Button, H5, MenuItem, Radio, RadioGroup} from "@blueprintjs/core";
import {ConfirmationDialog, Icons, InputBox} from '../../../components'
import {ICONS} from "../../../utils/iconNames";
import styles from "./environmentConfiguration.module.scss"
import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {Select} from "@blueprintjs/select";
import {AutoSelect} from "../../../components/autoSelect";
import _ from "lodash";
import {INPUT_TYPE} from "../../../utils/common";
import {useDispatch} from "react-redux";
import {
    setSelectedValue,
} from "../../../slices/envConfigSlice";

const FilterComponent = ({
                             enableFilterDialog,
                             setSelectedColumnHeader,
                             setEnableFilterDialog,
                             adaptorsList,
                             onClose,
                             tableEnvAdaptorsColumn,
                             selectedColumnHeader,
                             setFilterApply,
                             filterApply,
                             activeRuleIndex,
                             setActiveRuleIndex,
                             enableClearConfirmation,
                             setEnableClearConfirmation,
                             onClearBtnClick,
                             selectedFilterValue,
                             setSelectedFilterValue,
                             setSelectedEnabledValue,
                             selectedEnabledValue,
                             setRemoveSelectedRuleFlag,
                             removeSelectedRuleFlag,
                             updateColumnHeaderList,
                             ruleList,
                             columnHeaderList,
                             selectedValue,
                             updateFilterRuleList,
                             handleSelectedValueChange
                         }) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [filterValueError, setFilterValueError] = useState('');

    useEffect(() => {
        if (!removeSelectedRuleFlag) {
            let tempArray = [...tableEnvAdaptorsColumn];
            tempArray.unshift({
                id: 1,
                name: "anyColumn",
                caption: t('any_column_filter_com_adaptor'),
                colWidth: '112px'
            });
            updateColumnHeaderList(tempArray);
            if (selectedColumnHeader?.caption === t('any_column_filter_com_adaptor') || selectedColumnHeader?.caption === t('admin.envconfig.component.adaptors.env.label') ||
                selectedColumnHeader?.caption === t('admin.envconfig.component.adaptors.name.label') || selectedColumnHeader?.caption === t('admin.envmgt.promote.stats.type.label') ||
                selectedColumnHeader?.caption === t('admin.envconfig.component.adaptors.process.label') || selectedColumnHeader?.caption === t('admin.envconfig.component.adaptors.queue.label')
            || selectedColumnHeader?.caption === t('admin.envconfig.adaptors.stats.operation.label')) {
                let clonedRuleList = JSON.stringify(ruleList);
                clonedRuleList = JSON.parse(clonedRuleList);
                clonedRuleList[activeRuleIndex - 1].condition = t('admin_envConfig_filter_condition');
                clonedRuleList[activeRuleIndex - 1].column = selectedColumnHeader.caption;
                clonedRuleList[activeRuleIndex - 1].value = '';
                updateFilterRuleList(clonedRuleList)

            } else if (selectedColumnHeader?.caption === t('admin.envconfig.component.adaptors.enabled.label')) {
                let clonedRuleList = JSON.stringify(ruleList);
                clonedRuleList = JSON.parse(clonedRuleList);
                clonedRuleList[activeRuleIndex - 1].condition = t('admin_envConfig_filter_is');
                clonedRuleList[activeRuleIndex - 1].column = selectedColumnHeader.caption;
                clonedRuleList[activeRuleIndex - 1].value = "True";
                updateFilterRuleList(clonedRuleList);
                setSelectedEnabledValue && setSelectedEnabledValue("True")

            } else if (selectedColumnHeader?.caption === t('sysmgr.fields.numOfInstances.caption') || selectedColumnHeader?.caption === t('admin.envconfig.adaptors.stats.avgthroughput.label')
            || selectedColumnHeader?.caption === t('admin.envconfig.adaptors.stats.avgduration.label') || selectedColumnHeader?.caption === t('admin.envconfig.adaptors.stats.numinstances.label'))
            {
                let clonedRuleList = JSON.stringify(ruleList);
                clonedRuleList = JSON.parse(clonedRuleList);
                clonedRuleList[activeRuleIndex - 1].condition = t('admin_envConfig_filter_equal');
                clonedRuleList[activeRuleIndex - 1].column = selectedColumnHeader.caption;
                clonedRuleList[activeRuleIndex - 1].value = '';
                updateFilterRuleList(clonedRuleList)
            }
        }

    }, [selectedColumnHeader]);

    const itemsList = [{id: 1, name: t('admin_envConfig_filter_allRules')}, {
        id: 2,
        name: t('admin_envConfig_filter_anyRules')
    }];

    const onFilterBtnClick = () => {
        setFilterApply(true);
        setEnableFilterDialog(false);
    };

    const getColumnConditionsList = (column) => {
        if (column === t('any_column_filter_com_adaptor') || column === t('admin.envconfig.component.adaptors.env.label') ||
            column === t('admin.envconfig.component.adaptors.name.label') || column === t('admin.envmgt.promote.stats.type.label') ||
            column === t('admin.envconfig.component.adaptors.process.label') || column === t('admin.envconfig.component.adaptors.queue.label') ||
            column === t('admin.envconfig.adaptors.stats.operation.label')) {
            return [{
                id: 1,
                name: "contains",
                caption: t('admin_envConfig_filter_condition'),
                colWidth: 112
            },
                {id: 2, name: "is", caption: t('admin_envConfig_filter_is'), colWidth: 112},
                {
                    id: 3,
                    name: "startsWith",
                    caption: t('label.roleselection.StartWith').toLowerCase(),
                    colWidth: 112
                },
                {id: 4, name: "endsWith", caption: t('admin_envConfig_filter_endsWith'), colWidth: 112},
                {id: 5, name: "doesNoContain", caption: t('admin_envConfig_filter_doesNot'), colWidth: 112},
                {id: 6, name: "isNot", caption: t('admin_envConfig_filter_isNot'), colWidth: 112},
                {id: 7, name: "doesNotStartWith", caption: t('admin_envConfig_filter_doesNotStart'), colWidth: 112},
                {id: 8, name: "doesNotEndWith", caption: t('admin_envConfig_filter_doesNotEnd'), colWidth: 112},
                {id: 9, name: "isEmpty", caption: t('admin_envConfig_filter_isEmpty'), colWidth: 112}];
        } else if (column === t('admin.envconfig.component.adaptors.enabled.label')) {
            return [
                {id: 2, name: "is", caption: t('admin_envConfig_filter_is'), colWidth: 112},
                {id: 9, name: "isEmpty", caption: t('admin_envConfig_filter_isEmpty'), colWidth: 112},
            ];
        } else if (column === t('sysmgr.fields.numOfInstances.caption') || column === t('admin.envconfig.adaptors.stats.avgthroughput.label') ||
            column === t('admin.envconfig.adaptors.stats.avgduration.label') || column === t('admin.envconfig.adaptors.stats.numinstances.label')) {
            return [{id: 10, name: "equal", caption: t('admin_envConfig_filter_equal'), colWidth: 112},
                {id: 11, name: "doesNotEqual", caption: t('admin_envConfig_filter_doesNotEqual'), colWidth: 112},
                {
                    id: 12,
                    name: "lessThan",
                    caption: t('admin_envConfig_filter_lessThan').toLowerCase(),
                    colWidth: 112
                },
                {
                    id: 13,
                    name: "lessThanOrEqual",
                    caption: t('admin_envConfig_filter_lessThanOrEqual'),
                    colWidth: 112
                },
                {id: 14, name: "greaterThan", caption: t('admin_envConfig_filter_greaterThan'), colWidth: 112},
                {
                    id: 15,
                    name: "greaterThanOrEqual",
                    caption: t('admin_envConfig_filter_greaterThanOrEqual'),
                    colWidth: 112
                },
                {id: 9, name: "isEmpty", caption: t('admin_envConfig_filter_isEmpty'), colWidth: 112}];
        }
    };

    // const handleValueChange = (item) => {
    //     dispatch(setSelectedValue(item));
    // };
    const onRuleItemClick = (event, index) => {
        event.stopPropagation();
        setActiveRuleIndex(index + 1);
    };
    const onRemoveRuleClick = (event, ruleObject, index) => {
        event.stopPropagation();
        let clonedRuleList = JSON.stringify(ruleList);
        clonedRuleList = JSON.parse(clonedRuleList);
        let valueArr = clonedRuleList.filter((item) => item.id !== ruleObject.id);
        if (valueArr.length === index) {
            if (valueArr[index - 1].value === '') {
                valueArr[index - 1].name = `Rule ${index}`;
            }
            setActiveRuleIndex(index);
        } else if (valueArr.length > index) {
            _.map(valueArr, (valueObj, index) => {
                if (valueArr[index].value === '') {
                    valueArr[index].name = `Rule ${index + 1}`;
                }
            });
            setActiveRuleIndex(index + 1);
        }
        const updatedValueArr = _.map(valueArr, (value, index) => {
            value.id = index + 1;
            return value
        });
        updateFilterRuleList(updatedValueArr);

    };
    const onColumnHeaderSelect = (data) => {
        setSelectedFilterValue({});
        setSelectedColumnHeader(data)
    };
    const onConditionSelect = (data) => {
        let clonedData = JSON.stringify(ruleList);
        clonedData = JSON.parse(clonedData);
        clonedData[activeRuleIndex - 1].condition = data.caption;
        if (data?.caption === t('admin_envConfig_filter_isEmpty')) {
            clonedData[activeRuleIndex - 1].value = '';
        }
        updateFilterRuleList(clonedData)
    };
    const onFilterValueChange = (event, index) => {
        if (selectedColumnHeader?.caption !== t('sysmgr.fields.numOfInstances.caption')) {
            let clonedRules = JSON.stringify(ruleList);
            clonedRules = JSON.parse(clonedRules);
            if (event.target.value.length <= 50) {
                clonedRules[index].value = event.target.value
            }
            updateFilterRuleList(clonedRules);
        } else {
            let numbersOnly = /^[0-9]*$/;
            if (event.target.value.match(numbersOnly)) {
                if (!isNaN(parseInt(event.target.value)) || _.isEmpty(event.target.value)) {
                    setFilterValueError('');
                    let clonedRules = JSON.stringify(ruleList);
                    clonedRules = JSON.parse(clonedRules);
                    if (event.target.value.length <= 50) {
                        clonedRules[index].value = event.target.value
                    }
                    updateFilterRuleList(clonedRules)
                }
            }else{
                let clonedRules = JSON.stringify(ruleList);
                clonedRules = JSON.parse(clonedRules);
                if (event.target.value.length <= 50) {
                    clonedRules[index].value = event.target.value
                }
                updateFilterRuleList(clonedRules);
                setFilterValueError(t('validation_text_invalid_required'))
            }
        }
    };
    const onFilterValueSelect = (data) => {
        setSelectedFilterValue(data);
        let clonedRules = JSON.stringify(ruleList);
        clonedRules = JSON.parse(clonedRules);
        clonedRules[activeRuleIndex - 1].value = data.name;
        updateFilterRuleList(clonedRules)
    };

    const onAddRuleClick = () => {
        if (ruleList.length < 3) {
            const found = ruleList.find(element => element.id === activeRuleIndex + 1);
            if (!found) {
                let clonedRuleList = JSON.stringify(ruleList);
                clonedRuleList = JSON.parse(clonedRuleList);
                clonedRuleList.push({
                    id: activeRuleIndex + 1,
                    name: `${t('sysmgr.fields.rule.caption')} ${activeRuleIndex + 1}`,
                    column: t('any_column_filter_com_adaptor'),
                    condition: t('admin_envConfig_filter_condition'),
                    value: ''
                });
                setActiveRuleIndex(activeRuleIndex + 1);
                updateFilterRuleList(clonedRuleList);
            } else {
                let clonedRuleList = JSON.stringify(ruleList);
                clonedRuleList = JSON.parse(clonedRuleList);
                clonedRuleList.push({
                    id: ruleList.length + 1,
                    name: `${t('sysmgr.fields.rule.caption')} ${ruleList.length + 1}`,
                    column: t('any_column_filter_com_adaptor'),
                    condition: t('admin_envConfig_filter_condition'),
                    value: ''
                });
                setActiveRuleIndex(ruleList.length + 1);
                updateFilterRuleList(clonedRuleList)
            }
            setSelectedColumnHeader({
                id: 1,
                name: "anyColumn",
                caption: t('any_column_filter_com_adaptor'),
                colWidth: '112px'
            });
            setRemoveSelectedRuleFlag(false)
        }
    };
    const handleRadioChange = (event, index) => {
        setSelectedEnabledValue && setSelectedEnabledValue(event.target.value);
        let clonedData = JSON.stringify(ruleList);
        clonedData = JSON.parse(clonedData);
        clonedData[index].value = event.target.value;
        updateFilterRuleList(clonedData)
    };
    const checkValueField = () => {
        if(ruleList.length === 1 && filterValueError){
            return true
        }else {
            const found = ruleList.find(element => element.value !== '');
            return found === undefined;
        }
    };
    const checkIsEmpty = () => {
        const found = ruleList.find(element => element.condition === t('admin_envConfig_filter_isEmpty'));
        return found === undefined
    };
    const onYesBtnClick = () => {
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
        updateFilterRuleList(resetRuleList);
        setSelectedColumnHeader({
            id: 1,
            name: "anyColumn",
            caption: t('any_column_filter_com_adaptor'),
            colWidth: '112px'
        });
        setSelectedFilterValue({});
        setEnableClearConfirmation(false);
        setRemoveSelectedRuleFlag(false);
    };
    const handleDialogClose = () => {
        setEnableClearConfirmation(false);
    };

    const getValueDataList = (selectedColumnHeader) => {
        let dataArrayList = [];
        if (selectedColumnHeader?.caption === t('admin.envconfig.component.adaptors.env.label')) {
            const uniqueList = [...new Set(adaptorsList.map(obj=> {return obj.environment}))];
            dataArrayList = _.map(uniqueList, (adaptor, index) => {
                return {id: index + 1, name: adaptor}
            });
        } else if (selectedColumnHeader?.caption === t('admin.envconfig.component.adaptors.name.label')) {
            const uniqueList = [...new Set(adaptorsList.map(obj=> {return obj.name}))];
            dataArrayList = _.map(uniqueList, (adaptor, index) => {
                return {id: index + 1, name: adaptor}
            });
        } else if (selectedColumnHeader?.caption === t('admin.envmgt.promote.stats.type.label')) {
            const uniqueList = [...new Set(adaptorsList.map(obj=> {return obj.adaptorTypeId}))];
            dataArrayList = _.map(uniqueList, (adaptor, index) => {
                return {id: index + 1, name: adaptor}
            });
        } else if (selectedColumnHeader?.caption === t('admin.envconfig.component.adaptors.process.label')) {
            const uniqueList = [...new Set(adaptorsList.map(obj=> {return obj.process}))];
            dataArrayList = _.map(uniqueList, (adaptor, index) => {
                return {id: index + 1, name: adaptor}
            });
        } else if (selectedColumnHeader?.caption === t('admin.envconfig.component.adaptors.queue.label')) {
            const uniqueList = [...new Set(adaptorsList.map(obj=> {return obj.workQueue}))];
            dataArrayList = _.map(uniqueList, (adaptor, index) => {
                return {id: index + 1, name: adaptor}
            });
        }else if (selectedColumnHeader?.caption === t('admin.envconfig.adaptors.stats.operation.label')) {
            const uniqueList = [...new Set(adaptorsList.map(obj=> {return obj.operation}))];
            dataArrayList = _.map(uniqueList, (adaptor, index) => {
                return {id: index + 1, name: adaptor}
            });
        }
        dataArrayList = _.orderBy(dataArrayList, 'name', 'asc');

        return dataArrayList
    };
    const onFilterValueQueryChange = (query, event) => {
        let clonedData = JSON.stringify(ruleList);
        clonedData = JSON.parse(clonedData);
        clonedData[activeRuleIndex - 1].value = query;
        updateFilterRuleList(clonedData)
    };

    let selectedObject = null;
    if (selectedColumnHeader) {
        const objValue = _.filter(columnHeaderList, (item) => {
            return item.caption === selectedColumnHeader.caption
        });
        if (objValue.length > 0) {
            selectedObject = objValue[0]
        }
    }
    const onBlurEventHandle = (index) => {
        let clonedData = JSON.stringify(ruleList);
        clonedData = JSON.parse(clonedData);
        let dataArrayList = getValueDataList(selectedColumnHeader);

        let getValue = _.find(dataArrayList, (array) => {
            array.name.includes(clonedData[index].value)
        });
        if (!getValue) {
            setSelectedFilterValue({})
        }
    };

    const getValueObject = (tab) => {
        let selectedObject = null;
        const objValue = _.filter(columnHeaderList, (item) => {
            return item.caption === tab.column
        });
        if (objValue.length > 0) {
            selectedObject = objValue[0]
        }
        return selectedObject;
    };

    const getConditionObject = (tab) => {
        let selectedObject = null;
        const column = tab.column;
        const conditionList = getColumnConditionsList(column);
        const objValue = _.filter(conditionList, (item) => {
            return item.caption === tab.condition
        });
        if (objValue.length > 0) {
            selectedObject = objValue[0]
        }
        return selectedObject;
    };

    const getSelectedValueObject = (tab) => {
        let selectedObject = null;
        const objValueArray = _.filter(columnHeaderList, (item) => {
            return item.caption === tab.column
        });
        const valueDataList = getValueDataList(objValueArray[0]);
        const objValue = _.filter(valueDataList, (item) => {
            return item.name === tab.value
        });
        if (objValue.length > 0) {
            selectedObject = objValue[0]
        }else{
            selectedObject = {id:-1,name:tab.value};
        }
        return selectedObject;
    };

    return <>
        {
            enableFilterDialog &&
            <ConfirmationDialog
                width={500}
                divideByX={3}
                divideByY={6}
                showDialog={true}
                headerText={t('ipd.widgets.button.filter.label')}
                onClose={onClose}
                body={
                    <div className={styles.contentDiv}>
                        <div className={styles.matchStyle}>
                            <div className={styles.mainMatchStyle}>
                                <div className={styles.matchText}>{t('admin_filter_adaptor_match_text')}</div>
                                <Select
                                    items={itemsList}
                                    itemRenderer={(item, { modifiers, handleClick, index }) => (
                                        <MenuItem id={index} tabIndex={0}
                                                                  style={{
                                                                      width: "auto",
                                                                      border: "1px solid transparent",
                                                                      minHeight:'24px',
                                                                      fontWeight: selectedValue && item.id === selectedValue.id ? 'bold' : 'normal',
                                                                  }}
                                                                  className={styles.selectOption}
                                                                  active={modifiers.active}
                                                                  onClick={handleClick}
                                                                  text={item.name}
                                                                  key={item.name}
                                        />
                                    )}
                                    itemsEqual={'id'}
                                    selectedItem={selectedValue}
                                    onItemSelect={handleSelectedValueChange}
                                    popoverProps={{minimal: true}}
                                    filterable={false}
                                >
                                    <div className={styles.arrowBox} tabindex={0} >
                                        <div className={styles.itemNameStyle}>{selectedValue.name}</div>
                                        <Icons icon={ICONS.ARROWS_DOWN_DARK}/>
                                    </div>
                                </Select>
                            </div>
                            {ruleList?.map((tab, index) => {
                                return <div key={index}
                                            className={activeRuleIndex === (index + 1) ? styles.containerStyle : styles.collapsedStyle}>
                                    <div
                                        className={activeRuleIndex === (index + 1) ? styles.selectedTabContainerStyle : styles.collapsedContainerStyle}
                                        onClick={(event) => {
                                            onRuleItemClick(event, index)
                                        }}>
                                        <div className={styles.headerContainerStyle}>
                                            <div>
                                                {
                                                    tab.value && !filterValueError ?
                                                        <H5 className={styles.titleStyle}>{`${tab.column}`+ " "}<i>{tab.condition}</i>{" " + `${tab.value}`}</H5>
                                                     :
                                                        tab.condition === t('admin_envConfig_filter_isEmpty') ?
                                                            <H5 className={styles.titleStyle}>{`${tab.column}`+ " "}<i>{tab.condition}</i></H5>
                                                            :
                                                            <H5 className={styles.titleStyle}>{tab.name}</H5>
                                                }
                                            </div>
                                            <div id={"close"}
                                                title={t('admin_remove_rule_stats_tooltip')}
                                                style={{display: ruleList.length === 1 && "none"}}
                                                onClick={(event) => onRemoveRuleClick(event, tab, index)}
                                                className={styles.closeBtnStyle}/>
                                        </div>
                                    </div>
                                    <div className={styles.collapsibleContainerStyle}
                                         style={{border: activeRuleIndex !== (index + 1) && "0px"}}>
                                        <div  className={activeRuleIndex === (index + 1) ? styles.fadein : styles.fadeout}>
                                            <div className={styles.collapseContent} style={{opacity:activeRuleIndex === (index + 1) ? 1 : 0,
                                                display:activeRuleIndex === (index + 1) ? 'block' : 'none'}} >
                                                <div
                                                    className={styles.targetText}>{t('sysmgr.clientintegration.column.title')}</div>
                                                <div className={styles.autoSelectDiv}>
                                                    <AutoSelect
                                                        needBlur={false}
                                                        loadData={null}
                                                        loading={false}
                                                        popoverWidth={450}
                                                        editable={false}
                                                        dataList={columnHeaderList}
                                                        onItemSelected={onColumnHeaderSelect}
                                                        selectedValue={getValueObject(tab)}
                                                        setErrorText={() => {
                                                        }}
                                                        queryFilterFlag = {false}
                                                        showListOnFocus={true}
                                                        tooltipPosition={'bottom-right'} isFilter={true}/>
                                                </div>
                                                <div className={styles.targetText}>{"Condition"}</div>
                                                <div className={styles.autoSelectDiv}>
                                                    <AutoSelect
                                                        key={tab.column}
                                                        needBlur={false}
                                                        loadData={null}
                                                        loading={false}
                                                        popoverWidth={450}
                                                        editable={false}
                                                        dataList={getColumnConditionsList(tab.column)}
                                                        setErrorText={() => {
                                                        }}
                                                        queryFilterFlag = {false}
                                                        onItemSelected={onConditionSelect}
                                                        selectedValue={getConditionObject(tab)}
                                                        tooltipPosition={'bottom-right'}
                                                        showListOnFocus={true} isFilter={true}/>
                                                </div>
                                                <div
                                                    className={styles.targetText}>{t('case.viewer.grid.name.value')}</div>
                                                <div className={styles.autoSelectDiv}>
                                                    {(tab.column === t('admin.envconfig.component.adaptors.enabled.label')) ?
                                                        <RadioGroup
                                                            inline={true}
                                                            name="group"
                                                            disabled={tab.condition === t('admin_envConfig_filter_isEmpty')}
                                                            onChange={(event) => {
                                                                handleRadioChange(event, index)
                                                            }}
                                                            selectedValue={selectedEnabledValue}
                                                        >
                                                            <Radio label="True" value={"True"}/>
                                                            <Radio label="False" value={"False"}/>
                                                        </RadioGroup>
                                                        :
                                                        (tab.column === t('any_column_filter_com_adaptor') || tab.column === t('sysmgr.fields.numOfInstances.caption') ||
                                                            tab.column === t('admin.envconfig.adaptors.stats.numinstances.label') || tab.column === t('admin.envconfig.adaptors.stats.avgthroughput.label')
                                                        || tab.column === t('admin.envconfig.adaptors.stats.avgduration.label')) ?
                                                            <InputBox
                                                                inputType={INPUT_TYPE.TEXT}
                                                                isDisabled={tab.condition === t('admin_envConfig_filter_isEmpty')}
                                                                onChange={(event) => {
                                                                    onFilterValueChange(event, index)
                                                                }}
                                                                value={tab.value}
                                                                className={styles.envInputStyle}
                                                                errorText={filterValueError}
                                                                height={24}
                                                                fromFilterComponent={true}
                                                                tooltipPosition={"bottom-right"}
                                                            />
                                                            :
                                                            <div className={styles.autoSelectDiv}>
                                                                <AutoSelect
                                                                    needBlur={true}
                                                                    onBlurEventHandle={() => {
                                                                        onBlurEventHandle(index)
                                                                    }}
                                                                    onSelectQueryChange={onFilterValueQueryChange}
                                                                    loadData={null}
                                                                    loading={false}
                                                                    isDisabled={tab.condition === t('admin_envConfig_filter_isEmpty')}
                                                                    popoverWidth={450}
                                                                    editable={false}
                                                                    dataList={getValueDataList({caption:tab.column})}
                                                                    setErrorText={() => {
                                                                    }}
                                                                    onItemSelected={onFilterValueSelect}
                                                                    selectedValue={getSelectedValueObject(tab)}
                                                                    tooltipPosition={'bottom-right'}
                                                                    showListOnFocus={true}/>
                                                            </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            })}
                        </div>
                        <div className={styles.footerButtonContainer}>
                            <div style={{display: "flex"}}>
                                <Button tabIndex={0}
                                    title={t('admin_add_rule_stats_tooltip')}
                                    className={styles.footerYesButton}
                                    disabled={ruleList.length > 2}
                                    onClick={onAddRuleClick}>
                                    <Icons icon={ICONS.SPRITE_ADD_ICON}/></Button>
                            </div>
                            <div style={{display: "flex"}}>
                                <Button tabIndex={0} title={t('ipd.widgets.button.filter.label')} className={styles.footerYesButton}
                                        text={t('ipd.widgets.button.filter.label')}
                                        onClick={onFilterBtnClick}
                                        disabled={checkValueField() && checkIsEmpty()}
                                />
                                <Button tabIndex={0} title={t('Clear_button_text')} className={styles.footerYesButton}
                                        text={t('Clear_button_text')}
                                        onClick={onClearBtnClick}
                                        disabled={!filterApply}
                                />
                                <Button tabIndex={0} title={t('btn.common.cancel')} className={styles.footerButton}
                                        text={t('btn.common.cancel')}
                                        onClick={onClose}/>
                            </div>
                        </div>
                    </div>
                }
                transitionDuration={300}
                isCloseButtonShown={true}
            />
        }
        {
            enableClearConfirmation &&
            <ConfirmationDialog
                showDialog={true}
                width={350}
                divideByX={3}
                divideByY={3.5}
                headerText={t('admin_clear_filter_header_text')}
                onClose={handleDialogClose}
                body={
                    <h4 className={styles.textStyle}>{t('admin_filter_confirm_msg')}</h4>
                }
                isCloseButtonShown={true}
                noButtonText={t(t('case.reassign.status.cancel'))}
                onNoBtnClick={handleDialogClose}
                yesButtonText={t('Clear_button_text')}
                onYesBtnClick={onYesBtnClick}/>
        }
    </>
};

export default FilterComponent;