import React, {useEffect, useState} from "react";
import styles from "./table.module.scss";
import {Button, Checkbox, Elevation, Intent, TextArea} from "@blueprintjs/core";
import {Icons, InputBox, UserList, DateTime, ConfirmationDialog} from "../index";
import {ICONS} from "../../utils/iconNames";
import {
    DATE_FORMAT,
    DATE_TIME_FORMAT,
    INPUT_TYPE,
    OPERATOR_SEQUENCE,
    SORT_DIRECTION,
    VALIDATION_PROPERTY
} from "../../utils/common";
import {useTranslation} from "react-i18next";
import {AutoSelect} from "../autoSelect";
import {getUserList} from "../../api";
import {useDispatch, useSelector} from "react-redux";
import {ValueBuilder} from "./ValueBuilder";
import {phoneNumberMasking, phoneNumberUnMasking} from "../../utils/commonFunctions";
import moment from "moment";
import _ from "lodash";
import {
    ReflexContainer,
    ReflexSplitter,
    ReflexElement
} from 'react-reflex'
import {ValidationAssistant} from "./ValidationAssistant";
import {setError, setHasValid} from "../../slices/dashboardSlice";
import i18n from "../../i18n";

const disabledColName=['target'];

export const SearchCriteriaTable=(props)=> {
    const {
        tableData = [],
        tableId,
        applyFilter,
        isError,
        handleSourceCellDataChange,
        handleOperatorCellDataChange,
        resetValidationsData,
        setResetValidationsData,
        getSearchResultData,
        searchClick,
        resetClick
    } = props;
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [searchCriteriaData, setSearchCriteriaData] = useState([]);
    const [searchCriteriaValidationData, setSearchCriteriaValidationData] = useState([]);
    const [selectedSource, setSelectedSource] = useState(null);
    const [selectedOperatorCell, setSelectedOperatorCell] = useState(null);
    const [showValueBuilderDialog, setShowValueBuilderDialog] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    const {userList, choiceList,activeSubTabIndex,activeTabIndex,currentTemplate} = useSelector((state) => state.dashboard);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedHeaderCell, setSelectedHeaderCell] = useState({});
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [openValidationAssistant, setOpenValidationAssistant] = useState(false);
    const [validationError, setValidationError] = useState({});
    const [currentSelectedCheckOption, setCurrentSelectedCheckOption] = useState('');
    const [selectedTargetCell, setSelectedTargetCell] = useState(null);
    const [documentStartElement, setDocumentStartElement] = useState();
    const leftPanelSize = Number(localStorage.getItem(currentTemplate.id)) || 520;
    const leftPanelFlexValue = leftPanelSize / window.innerWidth;
    const [isEnterKeyPressed, setIsEnterKeyPressed] = useState(false);
    const [selectedMinDate, setSelectedMinDate] = useState(new Date());
    const [toggleUserSelection, setToggleUserSelection] = useState(false);

    const booleanSelectionList=[
        {id: '', name: ''},
        {id: '0', name: t('com.ipd.common.boolean.false')},
        {id: '1', name: t('com.ipd.common.boolean.true')}
    ]

    const [criteriaData, setCriteriaData] = useState([
        {name: 'target', caption: t('admin.envmgt.import.mapping.target.title'), colWidth: 262},
        {name: 'operator', caption: t('labelOperator'), colWidth: 112},
        {name: 'source', caption: t('admin.envmgt.import.mapping.source.title'), colWidth: 262}
    ]);

    useEffect(() => {
        getUserList();
    }, []);

    function resizableGrid(table) {
        let row = table.getElementsByTagName('thead')[0],
            cols = row ? row.children : undefined;
        if (!cols) return;
        let tableHeight = table.offsetHeight;
        for (let i = 0; i < cols?.length; i++) {
            let div = createDiv(tableHeight);
            cols[i].appendChild(div);
            cols[i].style.position = 'relative';
            setListeners(div);
        }

        function setListeners(div) {
            let pageX, curCol, nxtCol, curColWidth, nxtColWidth, tableWidth;
            div.addEventListener('mousedown', function (e) {
                tableWidth = document.getElementById(tableId).offsetWidth;
                curCol = e.target.parentElement;
                nxtCol = curCol.nextElementSibling;
                pageX = e.pageX;
                let padding = paddingDiff(curCol);
                curColWidth = curCol.offsetWidth - padding;
            });
            div.addEventListener('mouseover', function (e) {
                e.target.style.borderRight = '2px solid transparent';
            })
            div.addEventListener('mouseout', function (e) {
                e.target.style.borderRight = '';
            })
            document.addEventListener('mousemove', function (e) {
                if (curCol) {
                    let diffX = e.pageX - pageX;
                    curCol.style.width = (curColWidth + diffX) + 'px';
                    document.getElementById(tableId).style.width = tableWidth + diffX + "px"
                    let clonedData = [...criteriaData]
                    let index = clonedData?.findIndex(d1 => d1.caption === curCol.innerText)
                    clonedData[index] = {
                        name: criteriaData[index].name,
                        caption: curCol.innerText,
                        colWidth: curColWidth + diffX
                    }
                    setCriteriaData(clonedData);
                }
            });
            document.addEventListener('mouseup', function (e) {
                curCol = undefined;
                nxtCol = undefined;
                pageX = undefined;
                nxtColWidth = undefined;
                curColWidth = undefined
            });
        }

        function createDiv(height) {
            let div = document.createElement('div');
            div.style.top = 0;
            div.style.right = 0;
            div.style.width = '5px';
            div.style.position = 'absolute';
            div.style.cursor = 'col-resize';
            div.style.userSelect = 'none';
            div.style.height = height + 'px';
            return div;
        }

        function paddingDiff(col) {
            if (getStyleVal(col, 'box-sizing') === 'border-box') {
                return 0;
            }
            let padLeft = getStyleVal(col, 'padding-left');
            let padRight = getStyleVal(col, 'padding-right');
            return (parseInt(padLeft) + parseInt(padRight));
        }

        function getStyleVal(elm, css) {
            return (window.getComputedStyle(elm, null).getPropertyValue(css))
        }
    }

    useEffect(() => {
        let filterDataBasedOnVisibility = tableData.filter((d) => d.visibility !== 1);
        let criteriaDefinitions = _.map(filterDataBasedOnVisibility, (data, index) => {
            return {
                target: createTargetColumnCells(data.caption, data.visibility),
                operator: createInteractiveCellForOperator(data, index),
                source: createInteractiveCell(data, index)
            }
        });
        setSearchCriteriaData(criteriaDefinitions);
        let tables = document.getElementsByClassName(tableId);
        for (let i = 0; i < tables?.length; i++) {
            resizableGrid(tables[i]);
        }
    }, [tableData, selectedSource, selectedOperatorCell, criteriaData, currentSelectedCheckOption,selectedMinDate]);

    useEffect(() => {
        setOpenValidationAssistant(false);
        let validationData = tableData.filter((d) => d.visibility === 3 || d.visibility === 4);
        let data = [];
        let sortedData = validationData.sort((a, b) => a.visibility - b.visibility);
        sortedData.forEach(item => {
            return item.visibility === 3 && (item.source.length <= 0 || item.source === '[]') ? data.push({
                    pane: '',
                    property: t('admin.envmgt.import.mapping.source.title'),
                    message: t('REQ_VALUE_MSG', {fieldName: item.caption}),
                    name: item.name
                }) :
                item.visibility === 4 && (item.source.length <= 0 || item.source === '[]') ? data.push({
                    pane: '',
                    property: t('admin.envmgt.import.mapping.source.title'),
                    message: t('REQ_ONE_VALUE_MSG', {fieldName: item.caption}),
                    name: item.name
                }) : null
        })
        setSearchCriteriaValidationData(data);
        data.length > 0 && setOpenValidationAssistant(true);
        data.length > 0 ? dispatch(setHasValid(false)) : dispatch(setHasValid(true));
    }, [tableData.length]);

    useEffect(() => {
        setSearchCriteriaValidationData([]);
        setResetValidationsData(false);
    }, [resetValidationsData]);

    useEffect(()=>{
        if(tableData[selectedSource]?.viewType === 'COMBO_BOX' &&
            tableData[selectedSource]?.operator !== 'IN' &&
            tableData[selectedSource]?.operator !== 'IS NOT IN' && isEnterKeyPressed){
            setIsEnterKeyPressed(false);
            let data = [];
            let validationData = tableData.filter((d) => d.visibility === 3 || d.visibility === 4);
            let d1 = validationData.filter(t1 => t1.visibility === 3);
            let test = validationData.filter(t1 => t1.visibility === 4);
            d1.forEach(t1 => {
                (t1.source.length <= 0 || t1.source === '[]') && data.push({
                    pane: '',
                    property: t('admin.envmgt.import.mapping.source.title'),
                    message: t('REQ_VALUE_MSG', {fieldName: t1.caption}),
                    name: t.name
                })
            })
            let op = test.find(t => t.source.length > 0 && t.source != '[]');
            if (!op) {
                test.forEach(t1 => data.push({
                    pane: '',
                    property: t('admin.envmgt.import.mapping.source.title'),
                    message: t('REQ_ONE_VALUE_MSG', {fieldName: t1.caption}),
                    name: t1.name
                }))
            }
            data.length <= 0 ? dispatch(setHasValid(true)) : dispatch(setHasValid(false));
            if (data.length <= 0 && searchCriteriaValidationData.length<=0) {
                getSearchResultData(true);
            }
            setSelectedSource(null);
        }
    },[tableData])

    const handleSourceCellChange = (data1, fieldName) => {
        handleSourceCellDataChange(data1, fieldName);
    }

    const onNumberBoxChange = (data, index, e) => {
        const pattern = /^[0-9]+$/;
        if (!pattern.test(e.target.value)) {
            setValidationError({
                error: t('INVALID_VALUE_MSG', {fieldName: t('admin.envmgt.import.mapping.source.title')}),
                index: index
            })
        } else if (e.target.value < -2147483648 || e.target.value > 2147483647) {
            setValidationError({
                error: t('RANGE_BETWEEN_MSG', {
                    labelText: 'Source',
                    min: '-2147483648',
                    max: '2147483647'
                }), index: index
            })
        } else {
            validationError.index === index && setValidationError('')
        }
        handleSourceCellChange(e.target.value, data.name);
    }

    const onInputBlur = (data, index) => {
        if (validationError.index === index) {
            handleSourceCellChange('', data.name);
            setValidationError('')
        }
    }

    const onFloatInputBoxChange = (data, index, e) => {
        if (i18n?.language.includes('fr')) {
            const pattern = /^[+-]?([0-9]*[,])?[0-9]+$/;
            const pattern1 = /^[+-]?([0-9]*[,])/;
            if (!pattern.test(e.target.value) && !pattern1.test(e.target.value)) {
                setValidationError({
                    error: t('INVALID_VALUE_MSG', {fieldName: t('admin.envmgt.import.mapping.source.title')}),
                    index: index
                })
            } else if (e.target.value < -9000000000000000 || e.target.value > 9000000000000000) {
                setValidationError({
                    error: t('RANGE_BETWEEN_MSG', {
                        labelText: 'Source',
                        min: t('validation.float.min'),
                        max: t('validation.float.max')
                    }), index: index
                })
            } else {
                validationError.index === index && setValidationError('')
            }
        }else {
            // const pattern = /^[+-]?([0-9]*[.])?[0-9]+$/;
            if (isNaN(e.target.value)) {
                setValidationError({
                    error: t('INVALID_VALUE_MSG', {fieldName: t('admin.envmgt.import.mapping.source.title')}),
                    index: index
                })
            } else if (e.target.value < -9000000000000000 || e.target.value > 9000000000000000) {
                setValidationError({
                    error: t('RANGE_BETWEEN_MSG', {
                        labelText: 'Source',
                        min: t('validation.float.min'),
                        max: t('validation.float.max')
                    }), index: index
                })
            } else {
                validationError.index === index && setValidationError('')
            }
        }
        handleSourceCellChange((e.target.value).replace(',','.'), data.name);
    }

    const handleDateChange = (source, data, d, index, isDateTimePicker) => {
        if (moment(source.lower).isAfter(d)) {
            setValidationError({
                error: t('ipd.framework.validation.message.range', {lower: isDateTimePicker ? moment.utc(source.lower).format(DATE_TIME_FORMAT) : moment(source.lower).format(DATE_TIME_FORMAT), upper:isDateTimePicker ? moment.utc(d).format(DATE_TIME_FORMAT) : moment(d).format(DATE_TIME_FORMAT)}),
                index: selectedSource
            })
        } else {
            validationError.index === index && setValidationError('')
        }
        handleSourceCellChange({lower: source.lower, upper: d}, data.name)
    }

    const onContinueClick = () => {
        if (validationError.index === selectedSource) {
            setSelectedSource(null);
            handleSourceCellChange('', tableData[validationError.index]?.name);
        } else {
            let data = [];
            let validationData = tableData.filter((d) => d.visibility === 3 || d.visibility === 4);
            let d1 = validationData.filter(t1 => t1.visibility === 3);
            let test = validationData.filter(t1 => t1.visibility === 4);
            d1.forEach(t1 => {
                (t1.source.length <= 0 || t1.source === '[]') && data.push({
                    pane: '',
                    property: t('admin.envmgt.import.mapping.source.title'),
                    message: t('REQ_VALUE_MSG', {fieldName: t1.caption}),
                    name: t.name
                })
            })
            let op = test.find(t => t.source.length > 0 && t.source != '[]');
            if (!op) {
                test.forEach(t1 => data.push({
                    pane: '',
                    property: t('admin.envmgt.import.mapping.source.title'),
                    message: t('REQ_ONE_VALUE_MSG', {fieldName: t1.caption}),
                    name: t1.name
                }))
            }
            setSearchCriteriaValidationData(data);
            data.length <= 0 ? setOpenValidationAssistant(false) : setOpenValidationAssistant(true);
            data.length <= 0 ? dispatch(setHasValid(true)) : dispatch(setHasValid(false));
            if (data.length <= 0) {
                getSearchResultData(true);
            }
            setSelectedSource(null);
        }
    }

    const onColumnSort = (columName, sortDir) => {
        let d = [...searchCriteriaValidationData];
        d.sort(function (c, d) {
            let a = c[columName].trim();
            let b = d[columName].trim();
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        })
        if (sortDir === SORT_DIRECTION.ASC) {
            setSearchCriteriaValidationData(d);
        } else {
            setSearchCriteriaValidationData(d.reverse());
        }
    }

    useEffect(() => {
        if(searchClick.isSearchBtnClick) {
            onContinueClick();
            setSelectedSource(null);
            setSelectedOperatorCell(null);
        }
    }, [searchClick]);

    useEffect(() => {
        setSelectedSource(null);
        setSelectedOperatorCell(null);
    }, [activeSubTabIndex, activeTabIndex,resetClick]);

    const createTargetColumnCells = (data, visibility) => {
        let targetCell = null
        switch (visibility) {
            case VALIDATION_PROPERTY.EDITABLE:
                targetCell = <div>{data}</div>;
                break;
            case VALIDATION_PROPERTY.HIDDEN:
                targetCell = <div>{data}</div>;
                break;
            case VALIDATION_PROPERTY.READONLY:
                targetCell = <div>{data}</div>;
                break;
            case VALIDATION_PROPERTY.REQUIRED:
                targetCell = <div><span className={styles.requiredText}>{'*'}</span>{data}</div>;
                break;
            case VALIDATION_PROPERTY.REQUIRED_ONE:
                targetCell = <div className={styles.flex}>
                    <span className={styles.requiredText}>{'*'}</span>
                    <span className={styles.requiredOneText}>{'(1) '}</span>
                    {data}
                </div>;
                break;
            default:
                return <div>{}</div>;
        }
        return targetCell;
    }

    const createInteractiveCellForOperator = (data, index) => {
        let filteredData = [];
        if (data.visibility === VALIDATION_PROPERTY.REQUIRED_ONE || data.visibility === VALIDATION_PROPERTY.REQUIRED) {
            filteredData = data.operatorData.filter((d) => d.allowRequired);
        } else {
            filteredData = data.operatorData
        }
        let newData=filteredData.map(t1=>({...t1, ...OPERATOR_SEQUENCE.find(t2 => t1.id === t2.id)}));
        let sortedOperatorData=_.sortBy(newData,'seqId')
        if (data.operatorData?.length > 0) {
            return selectedOperatorCell === index ?
                <div
                    style={{border: selectedOperatorCell === index ? '1px dashed darkblue' : '1px dashed transparent'}}>
                    <AutoSelect
                        autoFocus={true}
                        showInputTextCenterAlign={true}
                        loadData={null}
                        loading={false}
                        popoverWidth={criteriaData[1].colWidth}
                        unValidText={t('INVALID_SELECT_VALUE_MSG', {fieldName: t('labelOperator')})}
                        editable={false}
                        rightReadOnlyIcon={ICONS.HOME}
                        dataList={sortedOperatorData}
                        onItemSelected={(d) => {
                            if(d===''){
                                handleOperatorCellDataChange(data.operatorData.find(t1 => t1.id === data.operator), data.name);
                            }else {
                                handleOperatorCellDataChange(d, data.name);
                                setSelectedSource(null);
                            }
                        }}
                        selectedValue={{value: data.operatorData.find(t1 => t1.id === data.operator)?.caption}}
                    />
                </div> : <div onClick={() => {
                    data.visibility !== 2 && setSelectedOperatorCell(index);
                    setSelectedSource(null);
                    setSelectedTargetCell(null);
                }}
                              className={styles.operatorContainer} style={data.visibility === 2 ? {
                    display: 'hidden',
                    cursor: 'not-allowed'
                } : {}}>
                    {data.operatorData.find(t1 => t1.id === data.operator)?.caption}
                </div>
        }
    }

    const showBetweenTextBoxes = (colWidth, source, data, inputType, index, icon, viewType) => {
        if (selectedSource === index) {
            return <div className={styles.betweenBoxContainer}>
                <InputBox autoFocus={true}
                          height={'17px'}
                          inputType={inputType}
                          value={source?.lower}
                          onChange={(e) => handleSourceCellChange({
                                  lower: inputType === 'PHONENUMBER_TEXTBOX' ? phoneNumberUnMasking(e.target.value) : e.target.value,
                                  upper: inputType === 'PHONENUMBER_TEXTBOX' ? phoneNumberUnMasking(source?.upper) : source?.upper
                              },
                              data.name)}/>
                <div className={styles.andText}>{t('TEXT_AND')}</div>
                <InputBox
                    height={'17px'}
                    value={source?.upper}
                    inputType={inputType}
                    errorText={validationError.index === index ? validationError.error : ''}
                    onChange={(e) => {
                        if (viewType !== 'STRING_TEXT_BOX') {
                            if (Number(e.target.value) < Number(source.lower)) {
                                setValidationError({
                                    error: t('ipd.framework.validation.message.range', {
                                        lower: viewType === "NUMBER_TEXT_BOX" ? parseFloat(source.lower).toFixed(2) : source.lower,
                                        upper: t('validation.float.max')
                                    }), index: index
                                });
                            } else {
                                setValidationError({error: '', index: index});
                            }
                        }
                        handleSourceCellChange({
                            lower: inputType === 'PHONENUMBER_TEXTBOX' ? phoneNumberUnMasking(source?.lower) : source?.lower,
                            upper: inputType === 'PHONENUMBER_TEXTBOX' ? phoneNumberUnMasking(e.target.value) : e.target.value
                        }, data.name)
                    }}/>
            </div>
        } else {
            return <div className={styles.sourcePlaceHolder}>
                {source.lower?.length && source.upper?.length ? <div className={styles.sourceText} style={{'--width':colWidth+'px'}}>
                    <div style={{display:'flex', width: colWidth<130?'70%':'90%',flexDirection:'row', justifyContent: 'space-evenly',}}>
                        <div className={styles.dateTimeContainer}>{inputType === 'PHONENUMBER_TEXTBOX' ? phoneNumberMasking(source.lower) : data.viewType === 'NUMBER_TEXT_BOX' ? parseFloat(source.lower).toFixed(2) : source.lower}</div>
                        <div>{(source.lower || source.upper) && ' | ' + t('TEXT_AND') + ' | '}</div>
                        <div className={styles.dateTimeContainer}>{inputType === 'PHONENUMBER_TEXTBOX' ? phoneNumberMasking(source.upper) : data.viewType === 'NUMBER_TEXT_BOX' ? parseFloat(source.upper).toFixed(2) : source.upper}</div>
                    </div>
                    <div style={{justifyContent: 'flex-end', width: colWidth<130?'30%':'10%', display: 'flex', zIndex:9999}}>
                        <Icons icon={icon}/>
                    </div>
                </div> : <div style={{justifyContent: 'flex-end', width: '100%', display: 'flex'}}><Icons icon={icon}/>
                </div>}
            </div>
        }
    }

    const handleInTextChange = (e, data, viewType, index) => {
        let regex = ''
        if (viewType === 'INTEGER_TEXT_BOX') {
            regex = /[0-9|]+$/
        } else if (viewType === 'NUMBER_TEXT_BOX') {
            regex = /([-+]?[0-9]*,?[0-9]+[|]*)$/;
        } else if (viewType === 'STRING_TEXT_BOX') {
            regex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/
        } else if (viewType === 'PHONENUMBER_TEXTBOX') {
            regex = /[0-9|]+$/
        }
        if (regex.test(e.target.value) && !e.target.value.endsWith('|')) {
            if (viewType === 'NUMBER_TEXT_BOX' && (e.target.value < -9000000000000000 || e.target.value > 9000000000000000)) {
                setValidationError({
                    error: t('RANGE_BETWEEN_MSG', {
                        labelText: 'Source',
                        min: t('validation.float.min'),
                        max: t('validation.float.max')
                    }), index: index
                })
            } else if (viewType === 'INTEGER_TEXT_BOX' && (e.target.value < -2147483648 || e.target.value > 2147483647)) {
                setValidationError({
                    error: t('RANGE_BETWEEN_MSG', {
                        labelText: 'Source',
                        min: '-2147483648',
                        max: '2147483647'
                    }), index: index
                })
            } else {
                setValidationError('')
            }
            let formattedData = (i18n?.language.includes('fr') && viewType === 'NUMBER_TEXT_BOX') ?
                e.target.value.replaceAll('.', ',').replaceAll('|', '.').split('.')
                : e.target.value.replaceAll('|', ',').split(',');
            handleSourceCellChange(formattedData, data.name);

        } else {
            let formattedData = (i18n?.language.includes('fr') && viewType === 'NUMBER_TEXT_BOX') ?
                e.target.value.replaceAll('.', ',').replaceAll('|', '.').split('.')
                : e.target.value.replaceAll('|', ',').split(',');
            handleSourceCellChange(formattedData, data.name);
            if(e.target.value){
                setValidationError({
                    error: t('INVALID_VALUE_MSG', {fieldName: t('admin.envmgt.import.mapping.source.title')}),
                    index: index
                })
            }else {
                setValidationError('')
            }
        }
    }

    const handleFloatTextEnterPress=(viewType,src,data)=>{
            let formattedData = src.replaceAll(',', '.').replaceAll('|', ',').split(',');
            let test=[];
            formattedData.forEach(d=>{
                test.push(parseFloat(d).toFixed(2))
            })
            handleSourceCellChange(test, data.name);
            setToggleUserSelection(!toggleUserSelection)
    }

    const showInNotInBoxes = (source, data, inputType, index, icon, viewType) => {
        let src = source.length > 1 ? source.join('|') : source;
        if (selectedSource === index) {
            return <InputBox height={'17px'}
                             needBlur={true}
                             onBlur={()=>{
                                if(i18n?.language.includes('fr') && viewType === 'NUMBER_TEXT_BOX'){
                                    let formattedData = src.replaceAll(',', '.').replaceAll('|', ',').split(',');
                                    let test=[];
                                    formattedData.forEach(d=>{
                                       test.push(parseFloat(d).toFixed(2))
                                    })
                                    handleSourceCellChange(test, data.name);
                                }else if(viewType === 'NUMBER_TEXT_BOX'){
                                    let formattedData = src.replaceAll('|', ',').split(',');
                                    let test=[];
                                    formattedData?.forEach(d=>{
                                        test.push(parseFloat(d).toFixed(2))
                                    })
                                    handleSourceCellChange(test, data.name);
                                }
                             }}
                             errorText={validationError.index === index ? validationError.error : ''}
                             inputTooltip={t('value.builder.textBox.tooltip')}
                             placeholder={t('value.builder.placeholder.label')}
                             popoverWidth={styles.popoverCss}
                             onInputSubmit={()=>{i18n?.language.includes('fr') && viewType === 'NUMBER_TEXT_BOX' ? handleFloatTextEnterPress(viewType,src,data): onContinueClick()}}
                             value={inputType === INPUT_TYPE.PHONE ? source.length > 1 ? _.map(source, d => phoneNumberMasking(d)) : phoneNumberMasking(source) : src}
                             onChange={(e) => handleInTextChange(e, data, viewType, index)}
                             iconName={ICONS.FORM_CHECKBOX}
                             iconTooltip={t('value.builder.icon.tooltip')}
                             onIconClick={() => {
                                 setShowValueBuilderDialog(!showValueBuilderDialog);
                                 setSelectedField(data);
                             }}
            />
        } else {
            return <div className={styles.sourcePlaceHolder}>
                {(i18n?.language.includes('fr') && viewType === 'NUMBER_TEXT_BOX') ? <div className={styles.sourceText}>
                    {source.length > 1 ? _.map(source, (d, i) =>
                            source.length - 1 === i ? <div>{d.replace('.', ',')}</div> :
                                <div>{d.replace('.', ',') + '|'}</div>
                        ) :
                        <div>{source[0] ? parseFloat(source[0]).toFixed(2).replace('.', ','):null}</div>
                    }
                </div> : <div className={styles.sourceText}>
                    {viewType === 'NUMBER_TEXT_BOX' ?
                        source.length > 1 ? _.map(source, (d, i) =>
                                source.length - 1 === i ? <div>{parseFloat(d).toFixed(2)}</div> :
                                    <div>{parseFloat(d).toFixed(2) + '|'}</div>
                            ) : <div>{source[0] ? parseFloat(source[0]).toFixed(2):null}</div>
                        : source.length > 1 ? _.map(source, (d, i) =>
                            source.length - 1 === i ? <div>{d}</div> : <div>{d + '|'}</div>
                        ) : <div>{source}</div>
                    }
                </div>}
                {data.operator === 'IN' || data.operator === 'IS NOT IN' ? <Icons icon={ICONS.FORM_CHECKBOX}/> :
                    <Icons icon={icon}/>}
            </div>
        }
    }

    const showBetweenDateBoxes = (colWidth, source, data, index, isDateTimePicker, icon) => {
        if (selectedSource === index) {
            return <div className={styles.betweenBoxContainer}>
                <div><DateTime
                    autoFocus={false}
                    isDateTimePicker={isDateTimePicker}
                    popoverWidth={colWidth}
                    selectedValue={source.lower}
                    onInputSubmit={()=>onContinueClick()}
                    onItemSelected={(d1) => {
                        let d=new Date(d1);
                        const date1 = new Date();
                        date1.setFullYear(date1.getFullYear());
                        date1.setMonth((d.getMonth() > 8) ? (d.getMonth()) : ('0' + (d.getMonth())));
                        date1.setDate(((d.getDate() > 9) ? d.getDate() : ('0' + d.getDate())));
                        setSelectedMinDate(date1);
                        handleSourceCellChange({lower: d1, upper: source.upper}, data.name);
                    }}/></div>
                <div style={{padding: '0px 10px'}}>{t('TEXT_AND')}</div>
                <div><DateTime
                    onInputSubmit={()=>onContinueClick()}
                    autoFocus={false}
                    isDateTimePicker={isDateTimePicker}
                    popoverWidth={colWidth}
                    selectedValue={source.upper}
                    minDate={selectedMinDate}
                    errorText={validationError.index === index ? validationError.error : ''}
                    onItemSelected={(d) => handleDateChange(source, data, d, index, isDateTimePicker)}/></div>
            </div>
        } else {
            return <div className={styles.sourcePlaceHolder}>
                {source.lower?.length && source.upper?.length && validationError.index !== index ?
                    <div className={styles.sourceText} style={{'--width':colWidth+'px'}}>
                        <div style={{display:'flex', width: colWidth<130?'70%':'90%',flexDirection:'row', justifyContent: 'space-evenly'}}>
                            <div className={styles.dateTimeContainer}>
                            {source.lower ? isDateTimePicker ? moment.utc(source.lower).format(DATE_TIME_FORMAT) : moment(source.lower).format(DATE_FORMAT) : source.lower}
                            </div>
                            <div>{(source.lower || source.upper) && ' | ' + t('TEXT_AND') + ' | '}</div>
                            <div className={styles.dateTimeContainer}>
                                {source.upper ? isDateTimePicker ? moment.utc(source.upper).format(DATE_TIME_FORMAT) : moment(source.upper).format(DATE_FORMAT) : source.upper}
                            </div>
                        </div>
                        <div style={{justifyContent: 'flex-end', width: colWidth<130?'30%':'10%', display: 'flex', zIndex:9999}}>
                            <Icons icon={icon}/>
                        </div>
                    </div> :
                    <div style={{justifyContent: 'flex-end', width: '100%', display: 'flex'}}><Icons icon={icon}/>
                    </div>}
            </div>
        }
    }

    const onArrowKeyDown = (e, data, fieldName) => {
        if (e.keyCode == '38') {
            let idx = Number(documentStartElement.id)-1;
            if(idx < data.length && idx >= 0) {
                setCurrentSelectedCheckOption(data[idx].name)
                let current = document.getElementById(idx);
                setDocumentStartElement(current)
            }

        } else if (e.keyCode == '40') {
            let idx = Number(documentStartElement.id)+1;
            if(idx < data.length && idx >= 0 ) {
                setCurrentSelectedCheckOption(data[idx].name)
                let current = document.getElementById(idx);
                setDocumentStartElement(current)
            }
        }else if(e.keyCode == '13'){
            let idx = Number(documentStartElement.id)
            if(idx < data.length) {
                onOptionChange(data[idx], fieldName)
            }
        }
    };

    const showListDataForInOperator = (listData, index, source, fieldName, operator, icon, colWidth) => {
        let data =_.sortBy(listData,'description')
        if (selectedSource === index) {
            return <div className={styles.moduleDiv} onBlur={()=>{setCurrentSelectedCheckOption(null)}}>
                {
                    _.map(data, (option,tdIndex) => {
                        return <Checkbox id={tdIndex} label={option.description}
                                         onKeyDown={(e)=>{onArrowKeyDown(e, data, fieldName);}}
                                         style={option.name === currentSelectedCheckOption ? {
                                             margin: '5px 15px 5px 5px',
                                             border: '2px dashed #d77c23'
                                         } : {margin: '5px'}}
                                         value={selectedOptions}
                                         checked={_.includes(source, option.name)}
                                         onChange={(e) => {
                                             let start = document.getElementById(tdIndex);
                                             setDocumentStartElement(start);
                                             onOptionChange(option, fieldName)
                                         }}/>
                    })
                }
            </div>
        } else {
            let mappedData = _.map(source, t1 => data.find(t2 => t2.name === t1)?.description);
            return <div className={styles.sourcePlaceHolder}>
                <div className={styles.sourceText} style={{'--width': colWidth+'px'}}>
                    {_.map(mappedData, (d1, i) => d1 ? mappedData.length - 1 === i ? d1 : d1 + '|' : null)}
                </div>
                {operator === 'IN' || operator === 'IS NOT IN' ? <Icons icon={ICONS.FORM_CHECKBOX}/> :
                    <Icons icon={icon}/>}
            </div>
        }
    }

    const onOptionChange = (selected, fieldName) => {
        setCurrentSelectedCheckOption(selected.name)
        const tempArray = selectedOptions.length && selectedOptions === '[]' ? [] : [...selectedOptions];
        if (tempArray.includes(selected.name)) {
            let index = tempArray.findIndex(d1 => d1 === selected.name);
            tempArray.splice(index, 1);
        } else {
            tempArray.push(selected.name);
        }
        setSelectedOptions(tempArray);
        handleSourceCellChange(tempArray, fieldName);
    };

    const handleValueBuilderOkClick = (data) => {
        handleSourceCellChange(data, selectedField.name);
        setSelectedSource(null);
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowDown'
                && (tableData[selectedSource]?.operator === "IN" || tableData[selectedSource]?.operator === "IS NOT IN")
                && (tableData[selectedSource]?.viewType !== 'COMBO_BOX')) {
                setSelectedField(tableData[selectedSource]);
                setShowValueBuilderDialog(true);
            } else if (event.key === 'Escape') {
                handleSourceCellChange('', tableData[selectedSource]?.name);
                setSelectedSource(null);
            }
        };

        if (tableData?.length) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedSource]);

    const handlePhoneNumChange = (source, data, index) => {
        if (source.length === 0) {
            setValidationError({
                error: t('REQ_VALUE_MSG', {fieldName: t('admin.envmgt.import.mapping.source.title')}),
                index: index
            })
        } else if(source.length > 0 && source.length < 14){
            setValidationError({
                error: t('INVALID_VALUE_MSG', {fieldName: t('admin.envmgt.import.mapping.source.title')}),
                index: index
            })
        }else {
            setValidationError('')
        }
        handleSourceCellChange(phoneNumberUnMasking(source), data)
    }

    const handleUserSelect = (d, data) => {
        if (d.name) {
            setValidationError('')
        }
        handleSourceCellChange(d.name, data.name);
    }

    useEffect(()=>{
        onContinueClick();
    },[toggleUserSelection]);

    const createInteractiveCell = (data, index) => {
        let colWidth = criteriaData[2].colWidth;
        let sourceCell = null
        let source = data.source;
        let selectionListData = choiceList.find(t1 => t1.name === data.choiceListName)?.selections;

        switch (data.viewType) {
            case 'UNSUPPORTED':
                sourceCell = <div/>;
                break;
            case 'BOOLEAN_TEXT_BOX':
                sourceCell = <div>{'BOOLEAN_TEXT_BOX'}</div>;
                break;
            case 'STRING_TEXT_BOX':
                if (data.operator === 'BETWEEN') {
                    sourceCell = showBetweenTextBoxes(colWidth, source, data, INPUT_TYPE.TEXT, index, ICONS.FORM_TEXT,'STRING_TEXT_BOX');
                } else if (data.operator === 'IN' || data.operator === 'IS NOT IN') {
                    sourceCell = showInNotInBoxes(source, data, INPUT_TYPE.TEXT, index, ICONS.FORM_TEXT,'STRING_TEXT_BOX')
                } else {
                    sourceCell = selectedSource === index ?
                        <InputBox autoFocus={true}
                                  height={'17px'}
                                  value={source}
                                  inputType={INPUT_TYPE.TEXT}
                                  onInputSubmit={()=>{onContinueClick()}}
                                  onChange={(e) => handleSourceCellChange(e.target.value, data.name)}/>
                        : <div className={styles.sourcePlaceHolder}>
                            <div className={styles.sourceText} style={{'--width': colWidth+'px'}}>{source}</div>
                            {data.operator === 'IN' || data.operator === 'IS NOT IN' ?
                                <Icons icon={ICONS.FORM_CHECKBOX}/> :
                                <Icons icon={ICONS.FORM_TEXT}/>}
                        </div>
                }
                break;
            case 'INTEGER_TEXT_BOX':
                if (data.operator === 'BETWEEN') {
                    sourceCell = showBetweenTextBoxes(colWidth, source, data, INPUT_TYPE.TEXT, index, ICONS.FORM_TEXT_HASH,'INTEGER_TEXT_BOX');
                } else if (data.operator === 'IN' || data.operator === 'IS NOT IN') {
                    sourceCell = showInNotInBoxes(source, data, INPUT_TYPE.TEXT, index, ICONS.FORM_TEXT_HASH,'INTEGER_TEXT_BOX')
                } else {
                    sourceCell = selectedSource === index ?
                        <InputBox autoFocus={true}
                                  errorText={validationError.index===index && data.visibility!==4 ?validationError.error:''}
                                  height={'17px'}
                                  value={source}
                                  onBlur={()=>{onInputBlur(data,index)}}
                                  onInputSubmit={()=>{onContinueClick()}}
                                  inputType={INPUT_TYPE.TEXT}
                                  onChange={(e) => { onNumberBoxChange(data,index,e)}}/>
                        : <div className={styles.sourcePlaceHolder}>
                            <div className={styles.sourceText}>{source}</div>
                            {data.operator === 'IN' || data.operator === 'IS NOT IN' ?
                                <Icons icon={ICONS.FORM_CHECKBOX}/> :
                                <Icons icon={ICONS.FORM_TEXT_HASH}/>}
                        </div>
                }
                break;
            case 'NUMBER_TEXT_BOX':
                if (data.operator === 'BETWEEN') {
                    sourceCell = showBetweenTextBoxes(colWidth, source, data, INPUT_TYPE.TEXT, index, ICONS.FORM_TEXT_HASH,'NUMBER_TEXT_BOX');
                } else if (data.operator === 'IN' || data.operator === 'IS NOT IN') {
                    sourceCell = showInNotInBoxes(source, data, INPUT_TYPE.TEXT, index, ICONS.FORM_TEXT_HASH,'NUMBER_TEXT_BOX')
                } else {
                    sourceCell = selectedSource === index ?
                        <InputBox //autoFocus={true}
                                  errorText={validationError.index===index && data.visibility!==4 ?validationError.error:''}
                                  height={'17px'}
                                  popoverWidth={styles.popoverCss}
                                  value={i18n?.language.includes('fr') ? source.replace('.',',') :source}
                                  inputType={INPUT_TYPE.TEXT}
                                  onBlur={()=>{onInputBlur(data,index)}}
                                  onInputSubmit={()=>{onContinueClick()}}
                                  onChange={(e) => onFloatInputBoxChange(data,index,e)}/>
                        : <div className={styles.sourcePlaceHolder}>
                            <div className={styles.sourceText}>{source ? i18n?.language.includes('fr') ?parseFloat(source).toFixed(2).replace('.',','):parseFloat(source).toFixed(2):source}</div>
                            {data.operator === 'IN' || data.operator === 'IS NOT IN' ?
                                <Icons icon={ICONS.FORM_CHECKBOX}/> :
                                <Icons icon={ICONS.FORM_TEXT_HASH}/>}
                        </div>
                }
                break;
            case 'DATETIME_TEXT_BOX':
                if (data.operator === 'BETWEEN') {
                    sourceCell = showBetweenDateBoxes(colWidth, source, data, index, true, ICONS.FORM_CLOCK);
                } else if (data.operator === 'ON') {
                    sourceCell = selectedSource === index ? <DateTime
                            isDateTimePicker={false}
                            autoFocus={false}
                            popoverWidth={colWidth}
                            selectedOperator={data.operator}
                            selectedValue={source}
                            onItemSelected={(d) => handleSourceCellChange(d, data.name)}/>
                        : <div className={styles.sourcePlaceHolder}>
                            <div
                                className={styles.sourceText}>{ source && moment(source).format( DATE_FORMAT )}</div>
                            <Icons icon={ICONS.FORM_CLOCK}/>
                        </div>;
                } else {
                    sourceCell = selectedSource === index ? <DateTime
                            isDateTimePicker={true}
                            popoverWidth={colWidth}
                            selectedValue={source}
                            onItemSelected={(d) => handleSourceCellChange(d, data.name)}/>
                        : <div className={styles.sourcePlaceHolder}>
                            <div className={styles.sourceText}>{source && moment.utc(source).format(DATE_TIME_FORMAT)}</div>
                            <Icons icon={ICONS.FORM_CLOCK}/>
                        </div>;
                }
                break;
            case 'DATE_TEXT_BOX':
                if (data.operator === 'BETWEEN') {
                    sourceCell = showBetweenDateBoxes(colWidth, source, data, index, false, ICONS.FORM_CALENDER);
                } else {
                    sourceCell = selectedSource === index ? <DateTime
                        onInputSubmit={()=>{onContinueClick()}}
                        autoFocus={false}
                        popoverWidth={colWidth}
                        selectedValue={source}
                        onItemSelected={(d) => handleSourceCellChange(d, data.name)}
                    /> : <div className={styles.sourcePlaceHolder}>
                        <div className={styles.sourceText}>{source ? source.includes('{') ? source : moment(source).format(DATE_FORMAT) : ''}</div>
                        <Icons icon={ICONS.FORM_CALENDER}/>
                    </div>;
                }
                break;
            case 'MEMO':
                sourceCell = selectedSource === index ? <div style={{padding: '2px'}} tabIndex={-1}><TextArea
                        style={{resize: 'none'}}
                        growVertically={true}
                        large={true}
                        autoFocus={true}
                        fill={true}
                        intent={Intent.PRIMARY}
                        onChange={(d) => {
                            if(d.nativeEvent.inputType === "insertLineBreak") {
                               setSelectedSource(null);
                               onContinueClick();
                            }else {
                                handleSourceCellChange(d.target.value, data.name)
                            }
                        }}
                        value={source}/></div>
                    : <div className={styles.sourcePlaceHolder}>
                        <div className={styles.sourceText} style={{'--width': colWidth+'px'}}>{source}</div>
                        <Icons icon={ICONS.FORM_SCROLL}/>
                    </div>;
                break;
            case 'COMBO_BOX':
                if (data.operator === 'IN' || data.operator === 'IS NOT IN') {
                    sourceCell = showListDataForInOperator(selectionListData, index, source, data.name, data.operator, ICONS.FORM_LIST_ARROW, colWidth);
                } else {
                    sourceCell = selectedSource === index ? <AutoSelect
                        needBlur={true}
                        onBlurEventHandle={()=>{data.visibility === 3 && setValidationError({error: t('REQ_VALUE_MSG', {fieldName: t('admin.envmgt.import.mapping.source.title')}),index:index})}}
                        autoFocus={true}
                        loadData={null}
                        loading={false}
                        popoverWidth={colWidth+'px'}
                        unValidText={t('INVALID_SELECT_VALUE_MSG',{fieldName:t('admin.envmgt.import.mapping.source.title')})}
                        errorText={validationError.index === index && data.visibility !== 4 && !selectionListData.find(t1 => t1.name === source)?.description? validationError.error : ''}
                        setIsEnterKeyPressed={setIsEnterKeyPressed}
                        editable={false}
                        rightReadOnlyIcon={ICONS.HOME}
                        dataList={selectionListData}
                        onItemSelected={(d) => handleSourceCellChange(d.name, data.name)}
                        selectedValue={{value: selectionListData.find(t1 => t1.name === source)?.description}}
                        onInputSubmit={()=>onContinueClick()}
                    /> : <div className={styles.sourcePlaceHolder}>
                        <div className={styles.sourceText}>
                            {selectionListData.find(t1 => t1.name === source)?.description}
                        </div>
                        {data.operator === 'IN' || data.operator === 'IS NOT IN' ? <Icons icon={ICONS.FORM_CHECKBOX}/> :
                            <Icons icon={ICONS.FORM_LIST_ARROW}/>}
                    </div>
                }
                break;
            case 'BOOLEAN_CHECKBOX':  // Pending
                sourceCell = <div>{'BOOLEAN_CHECKBOX'}</div>;
                break;
            case 'MULTISELECT':
                sourceCell = selectedSource === index ? <AutoSelect
                    loadData={null}
                    loading={false}
                    popoverWidth={colWidth}
                    errorText={''}
                    editable={false}
                    rightReadOnlyIcon={ICONS.HOME}
                    dataList={[]}
                    onItemSelected={() => console.log('**clicked onItemSelected')}
                    selectedValue={''}
                /> : <div className={styles.sourcePlaceHolder}>
                    <div className={styles.sourceText}>{source}</div>
                    <Icons icon={ICONS.FORM_LIST_ARROW}/>
                </div>
                break;
            case 'USERSELECT':
                sourceCell = <UserList
                        popoverWidth={colWidth+'px'}
                        resetClick={resetClick}
                        index={index}
                        selectedSource={selectedSource}
                        error={validationError.index===index?validationError.error:''}
                        selectedValue={source}
                        onItemSelected={(d) => handleUserSelect(d, data)}
                        setToggleUserSelection = {setToggleUserSelection}
                        toggleUserSelection = {toggleUserSelection}

                    />
                break;
            case 'PHONENUMBER_TEXTBOX':
                if (data.operator === 'BETWEEN') {
                    sourceCell = showBetweenTextBoxes(colWidth, source, data, INPUT_TYPE.PHONE, index, ICONS.FORM_PHONE);
                } else if (data.operator === 'IN' || data.operator === 'IS NOT IN') {
                    sourceCell = showInNotInBoxes(source, data, INPUT_TYPE.PHONE, index, ICONS.FORM_TEXT_HASH, 'PHONENUMBER_TEXTBOX')
                } else {
                    sourceCell = selectedSource === index ?
                        <InputBox autoFocus={true}
                                  height={'17px'}
                                  inputType={INPUT_TYPE.PHONE}
                                  value={source}
                                  onBlur={()=>{onInputBlur(data,index)}}
                                  onInputSubmit={()=>{onContinueClick()}}
                                  errorText={validationError.index===index?validationError.error:''}
                                  onChange={(e) => handlePhoneNumChange(phoneNumberMasking(e.target.value), data.name, index)}
                        /> : <div className={styles.sourcePlaceHolder}>
                            <div className={styles.sourceText}>{phoneNumberMasking(source)}</div>
                            {data.operator === 'IN' || data.operator === 'IS NOT IN' ?
                                <Icons icon={ICONS.FORM_CHECKBOX}/> :
                                <Icons icon={ICONS.FORM_PHONE}/>}
                        </div>
                }
                break;
            case 'BOOLEAN_COMBO_BOX':
                sourceCell = selectedSource === index ? <AutoSelect
                    loadData={null}
                    loading={false}
                    popoverWidth={colWidth+'px'}
                    errorText={''}
                    editable={false}
                    autoFocus={true}
                    unValidText={t('INVALID_SELECT_VALUE_MSG',{fieldName:t('admin.envmgt.import.mapping.source.title')})}
                    rightReadOnlyIcon={ICONS.HOME}
                    dataList={booleanSelectionList}
                    onItemSelected={(d) => handleSourceCellChange(d.id, data.name)}
                    onInputSubmit={()=>onContinueClick()}
                    selectedValue={{value: source === '0' ? t('com.ipd.common.boolean.false') : source === '1' ? t('com.ipd.common.boolean.true') : ''}}
                /> : <div className={styles.sourcePlaceHolder}>
                    <div className={styles.sourceText}>{source === '0' ? t('com.ipd.common.boolean.false') : source === '1' ? t('com.ipd.common.boolean.true') : ''}</div>
                    <Icons icon={ICONS.FORM_TRUE_FALSE}/>
                </div>
                break;
            case 'ROLE_MULTI_SELECT':  // Pending
                sourceCell = selectedSource === index ? <AutoSelect
                    loadData={null}
                    loading={false}
                    popoverWidth={colWidth}
                    errorText={''}
                    editable={false}
                    rightReadOnlyIcon={ICONS.HOME}
                    dataList={[]}
                    onItemSelected={() => console.log('**clicked onItemSelected')}
                    selectedValue={''}
                /> : <div className={styles.sourcePlaceHolder}>
                    <div className={styles.sourceText}>{source}</div>
                    <Icons icon={ICONS.FORM_LIST_ARROW}/>
                </div>
                break;
            default:
                return <div/>
        }
        return data.visibility === 2 || data.operator === 'IS EMPTY' || data.operator === 'IS NOT EMPTY' ?
            <div className={styles.rowTextStyle}
                 style={{display: 'hidden'}}>
                <div className={styles.sourcePlaceHolder}>
                    <div className={styles.sourceText}>{source}</div>
                    <Icons icon={ICONS.FORM_BLOCK}/></div>
            </div>
            : <div onClick={() => {
                setSelectedSource(index);
                setSelectedOperatorCell(null);
                setSelectedTargetCell(null);
                setSelectedOptions(source);
            }}
                   className={styles.rowTextStyle}
                   style={{border: selectedSource === index ? '1px dashed darkblue' : '1px dashed transparent'}}>{sourceCell}
            </div>
    }

    const onTableRowSelectClick = (data) => {
        setSelectedRow(data)
    };
    const onTargetTableRowSelectClick = (data,colName) => {
        if(colName.name === 'target') {
            setSelectedTargetCell(data);
            setSelectedSource(null);
            setSelectedOperatorCell(null);
        }
    };
    const onTableCellSelect = (colName, index) => {
        setSelectedHeaderCell({});
    };
    const onTableHeaderCellSelect = (colName, index) => {
        const tableCell = {
            id: index,
            name: colName.name
        };
        setSelectedHeaderCell(tableCell);
    };

    const showSelectedValidation=(data)=>{
        let d = tableData?.findIndex(d1 => d1.name === data.name);
        setSelectedSource(d);
        !tableData[d]?.source && setValidationError({
            error: t('REQ_VALUE_MSG', {fieldName: t('admin.envmgt.import.mapping.source.title')}),
            index: d
        });

    }

    return (
        <div className={styles.contentPanel} elevation={Elevation.ZERO}>
            <ReflexContainer orientation="vertical">
                <ReflexElement minSize={150} flex={openValidationAssistant ? leftPanelFlexValue : true} size={openValidationAssistant ? leftPanelSize : ''} onStopResize={(e)=>{localStorage.setItem(currentTemplate.id,e.domElement.clientWidth)}}>
                    <div className={styles.body} style={{overflowY: 'clip', overflowX: 'initial'}}>
                        <div className={styles.tableStyle}>
                            <table style={{width: '700px'}} id={tableId} className={tableId}>
                                <thead>
                                {_.map(criteriaData, (key, index) => {
                                    return <th className={styles.criteriaTableColumnHeaderText} >
                                        <div tabIndex={0} className={key.name === 'operator' ? styles.operatorColHeader : styles.colHeader}
                                             onClick={() => onTableHeaderCellSelect(key, index)}
                                             style={{border: selectedHeaderCell.id === index && selectedHeaderCell.name === key.name ? "1px dashed darkblue" : "1px dashed transparent"}}>
                                            <h4 className={styles.colTextStyle}>{key.caption}</h4>
                                        </div>
                                    </th>
                                })}
                                </thead>
                                <tbody>
                                {
                                    applyFilter &&
                                    <div className={styles.filterStyle}>
                                        {applyFilter}
                                    </div>
                                }
                                {
                                    searchCriteriaData?.length ? _.map(searchCriteriaData, (data, index) => {
                                        return (
                                            <tr onClick={() => {
                                                onTableRowSelectClick(index)
                                            }}
                                                style={{background: selectedRow === index && "none #fce6bf"}}>
                                                {_.map(criteriaData, (colName) => {
                                                    return <td
                                                        onFocusCapture={() => {
                                                            if (colName.name === 'source') {
                                                                setSelectedSource(index);
                                                                setSelectedOperatorCell(null);
                                                            }else if (colName.name === 'operator') {
                                                                setSelectedOperatorCell(index);
                                                                setSelectedSource(null);
                                                            }
                                                        }}
                                                        onClick={() => onTableCellSelect(colName, index)}
                                                        tabIndex={!disabledColName?.includes(colName.name) && 0}
                                                        className={disabledColName?.includes(colName.name) ? styles.disabledRow : null}
                                                        style={{width: colName.colWidth, '--outline': 'transparent'}}>
                                                        <div
                                                            onClick={() => onTargetTableRowSelectClick(colName.name === 'target' ? index : null, colName)}
                                                            className={disabledColName?.includes(colName.name) ? styles.disabledRowTextStyle : ''}
                                                            style={colName.name === 'target' ? {border: selectedTargetCell === index ? '1px dashed darkblue' : '1px dashed transparent'} : {}}>
                                                            {colName.name ? data[colName.name] : data.name}
                                                        </div>
                                                    </td>
                                                })}
                                            </tr>
                                        )
                                    }) : isError ? <tr className={styles.loadingRowContainer}>
                                        <td className={styles.loadingDataContainer} colSpan={criteriaData?.length}>
                                            <div className={styles.loadingGifContainer}>
                                                <button className={styles.errorIcon}/>
                                                <h4 className={styles.loadingText}>{t('message_table_error')}</h4>
                                            </div>
                                        </td>
                                    </tr> : null
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {
                        showValueBuilderDialog ? <ValueBuilder
                            showValueBuilderDialog={showValueBuilderDialog}
                            handleClose={() => setShowValueBuilderDialog(!showValueBuilderDialog)}
                            selectedField={selectedField}
                            onOkClick={(data) => handleValueBuilderOkClick(data)}/> : null
                    }
                </ReflexElement>
                <ReflexSplitter className="vertical-splitter" onStartResize={()=>setOpenValidationAssistant(true)}>
                    <div className="vertical-splitter-thumb" onClick={()=>setOpenValidationAssistant(true)}/>
                </ReflexSplitter>
                {openValidationAssistant && <ReflexElement>
                    <ValidationAssistant
                        searchCriteriaValidationData={searchCriteriaValidationData}
                        setOpenValidationAssistant={setOpenValidationAssistant}
                        actionsOnTableRowClick={showSelectedValidation}
                        onContinueClick={onContinueClick}
                        tableData={tableData}
                        onColumnSort={onColumnSort}
                    />
                </ReflexElement>}
            </ReflexContainer>
        </div>
    )
}