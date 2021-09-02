import React, {useEffect, useState} from "react";
import styles from "./table.module.scss";
import {Button, Elevation, H5} from "@blueprintjs/core";
import {
    Popover2,
} from "@blueprintjs/popover2";
import {ConfirmationDialog, Icons, InputBox} from "../index";
import {ICONS} from "../../utils/iconNames";
import {INPUT_TYPE, SORT_DIRECTION} from "../../utils/common";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import ColumnComponent from './columnFilter'
import _ from 'lodash'

export const TableFilter = (props) => {
    const {
        onFilterClicked, onOpenFilter, adaptorsList, filteredAdaptorList, setActiveRuleIndex, onRemoveSelectedRule,
        headerIcon, headerTitle, actions, tableData = [], showPageFooter, searchResultCol, isSortable, onColumnSort, defaultSortingFlag,
        disabledColName, tableId, loading, getSearchResults, filterApply, isError, actionsOnTableRowClick, setTableColumnsWidth,
        isHideNoSearchResultMsg = false, rowNav, currentSelectedRow = () => {}, tableName, ruleList, onClearBtnClick,
        setEnableFilterDialog, setEnabledButtonArray, noDataText = '', appType = 'Ultera', enableFilterDialog, handleRemove,
        matchSelectedValue, sortBy, orderBy, showFilterBtnOnColumn, resetEnvConfigState,
    } = props;
    const {totalSearches, pageSize, activeSubTabIndex} = useSelector((state) => state.dashboard);
    //const {sortBy, orderBy} = useSelector((state) => state.envManagement);
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const pageBound = 7;
    const pageLimit = 3;
    const totalPages = Math.ceil(totalSearches / pageSize);
    const [enteredPageNum, setEnteredPageNum] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [upperPageBound, setUpperPageBound] = useState(pageBound);
    const [lowerPageBound, setLowerPageBound] = useState(0);
    const [isSelectPageDialogOpen, setIsSelectPageDialogOpen] = useState(false);
    const [sortDir, setSortDir] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState(null);
    const [pageRange, setPageRange] = useState({startPage: 0, endPage: 0});
    const [selectedRow, setSelectedRow] = useState([]);
    const [selectedCell, setSelectedCell] = useState({});
    const [selectedHeaderCell, setSelectedHeaderCell] = useState({});
    const filterIcon = <Icons icon={ICONS.SPRITE_FILTER_ICON}/>;
    const [documentStartElement, setDocumentStartElement] = useState();
    const [disableFocus, setDisableFocus] = useState(false);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);

    useEffect(() => {
        if (defaultSortingFlag) {
            setSelectedColumn(sortBy);
            onColumnSort && onColumnSort(sortBy, orderBy)
        }
    }, []);

    useEffect(()=>{
        setSelectedRow([]);
    },[resetEnvConfigState]);

    useEffect(() => {
        if (getSearchResults) {
            setSortDir(null);
            setSelectedColumn(null);
            setSelectedHeaderCell({});
        }
    }, [activeSubTabIndex]);

    useEffect(() => {
        let tables = document.getElementsByClassName(tableId);
        for (let i = 0; i < tables.length; i++) {
            resizableGrid(tables[i]);
        }
    }, [tableData]);

    useEffect(() => {
        getSearchResults && getSearchResults({startPage: 0, endPage: 24});
    }, [searchResultCol.length]);

    useEffect(() => {
        if (showPageFooter && totalSearches) {
            let start = (currentPage * pageSize) - (pageSize - 1);
            let end = Math.min(start + pageSize - 1, totalSearches);
            setPageRange({startPage: start, endPage: end});
            if (sortDir && selectedColumn) {
                getSearchResults && getSearchResults({
                    startPage: start === 1 ? 0 : start,
                    endPage: end <= 25 ? 24 : end
                }, selectedColumn, sortDir, true);
            } else {
                getSearchResults && getSearchResults({
                    startPage: start === 1 ? 0 : start,
                    endPage: end <= 25 ? 24 : end
                });
            }
        }
    }, [currentPage, totalSearches]);

    useEffect(() => {
        if (pageRange?.endPage != totalSearches) {
            setCurrentPage(1);
        }
    }, [tableData?.length]);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const handleClick = (event) => {
        setCurrentPage(Number(event.target.id));
    };

    const btnFirstClick = () => {
        setUpperPageBound(pageBound);
        setLowerPageBound(0);
        setCurrentPage(1);
    };

    const btnLastClick = () => {
        setUpperPageBound(totalPages);
        setLowerPageBound(totalPages - pageBound);
        setCurrentPage(totalPages);
    };

    const btnNextClick = () => {
        if (currentPage < totalPages) {
            if ((currentPage + 1) > upperPageBound) {
                setUpperPageBound(upperPageBound + pageLimit);
                setLowerPageBound(lowerPageBound + pageLimit);
            }
            setCurrentPage(currentPage + 1);
        }
    };

    const btnPrevClick = () => {
        if (currentPage > 1) {
            if (currentPage - 1 > pageBound) {
                if ((currentPage - 1) % pageLimit === 0 && currentPage - 1 < pageBound) {
                    setUpperPageBound(upperPageBound - pageLimit);
                    setLowerPageBound(lowerPageBound - pageLimit);
                }
            } else {
                setUpperPageBound(pageBound);
                setLowerPageBound(0);
            }
            setCurrentPage(currentPage - 1);
        }
    };

    const handleOpenPage = () => {
        setEnteredPageNum(null)
        setIsSelectPageDialogOpen(!isSelectPageDialogOpen);
    };

    const gotoPage = (pageNum) => {
        if (pageNum) {
            if (pageNum <= totalPages) {
                setUpperPageBound(pageNum + pageLimit);
                setLowerPageBound(pageNum - (pageLimit + 1));
                setCurrentPage(pageNum);
            }
        }
        setIsSelectPageDialogOpen(!isSelectPageDialogOpen);
    };

    const applySorting = (columnName, sortDirection) => {
        setSelectedColumn(columnName);
        getSearchResults && getSearchResults(pageRange, columnName, sortDirection, true);
        onColumnSort && onColumnSort(columnName, sortDirection);
        setSelectedRow([])
    };

    const onTableRowSelectClick = (data, e, i) => {
        if (e.shiftKey) {
            let d = [...selectedRow];
            setSelectedRowIndex(i);
            if(selectedRowIndex != null && selectedRowIndex < i){
                let dNew = [];
                _.map(tableData,(tableRow, index)=>{
                    if(index >= selectedRowIndex && index <= i){
                        dNew.push(tableRow);
                    }
                });
                d = [...dNew];
            }else if(selectedRowIndex != null && selectedRowIndex > i){
                let dNew = [];
                _.map(tableData,(tableRow, index)=>{
                    if(index >= i && index <= selectedRowIndex){
                        dNew.push(tableRow);
                    }
                });
                d = [...dNew]
            }else{
                d.push(data);
            }
            setSelectedRow(d);
            if (selectedRow.length > 0) {
                actionsOnTableRowClick && actionsOnTableRowClick(d);
            }
        } else if(e.ctrlKey || e.metaKey){
            if(selectedRow.length > 0) {
                let d = [...selectedRow];
                let found = d.find(dObj=>dObj === data);
                if(found === undefined) {
                    d.push(data);
                }else{
                    d = _.reject(d, (dObj)=>{return dObj === data});
                }
                setSelectedRow(d);
                if (d.length > 0) {
                    actionsOnTableRowClick && actionsOnTableRowClick(d, i);
                }
            }else{
                setSelectedRow([data]);
                setSelectedRowIndex(i);
                actionsOnTableRowClick && actionsOnTableRowClick(data, i);
            }
        } else {
            setSelectedRow([data]);
            setSelectedRowIndex(i);
            actionsOnTableRowClick && actionsOnTableRowClick(data, i);
        }
        setSelectedHeaderCell({});
    };

    useEffect(() => {
        if (rowNav) {
            let index = tableData?.findIndex(d1 => d1?.name === selectedRow[0]?.name);
            if (index > -1) {
                let selectedIndex = rowNav.key === 'Next' ? index + 1 : index > 0 ? index - 1 : 0;
                tableData[selectedIndex] && setSelectedRow([tableData[selectedIndex]]);
                currentSelectedRow({index: selectedIndex, data: tableData[selectedIndex]});
            }
        }
    }, [rowNav]);

    const onTableCellSelect = (colName, index, tdIndex) => {
        setSelectedHeaderCell({});
        let start = document.getElementById(`${tdIndex}-${index}`);
        setDocumentStartElement(start);
        start.focus();
    };

    const onTableHeaderCellSelect = (colName, index) => {
        const tableCell = {
            id: index,
            name: colName.name
        };
        setSelectedHeaderCell(tableCell);
        setSelectedCell({});
        setEnabledButtonArray && setEnabledButtonArray([])
    };

    function resizableGrid(table) {
        let row = table.getElementsByTagName('thead')[0],
            cols = row ? row.children : undefined;
        if (!cols) return;
        let tableHeight = table.offsetHeight;
        for (let i = 0; i < cols.length; i++) {
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
            });
            div.addEventListener('mouseout', function (e) {
                e.target.style.borderRight = '';
            });
            document.addEventListener('mousemove', function (e) {
                if (curCol) {
                    let diffX = e.pageX - pageX;
                    curCol.style.width = (curColWidth + diffX) + 'px';
                    document.getElementById(tableId).style.width = tableWidth + diffX + "px";
                    let clonedData = [...searchResultCol];
                    let index = clonedData?.findIndex(d1 => d1.caption.trim() === curCol.innerText.trim());
                    clonedData[index] = {
                        name: searchResultCol[index]?.name,
                        caption: curCol.innerText,
                        colWidth: curColWidth + diffX
                    };
                    setTableColumnsWidth(clonedData)
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

    const onPopoverClick = () => {
    };

    const checkRemoveRuleDisplay = () =>{
        return (ruleList.length === 2 && ruleList[0].value !== "" && ruleList[1].value !== "") ||
            (ruleList.length === 3 && ruleList[0].value !== "" && ruleList[1].value !== "" && ruleList[2].value !== "") ||
            (ruleList.length === 3 && ruleList[0].value === "" && ruleList[1].value !== "" && ruleList[2].value !== "") ||
            (ruleList.length === 3 && ruleList[0].value !== "" && ruleList[1].value === "" && ruleList[2].value !== "") ||
            (ruleList.length === 3 && ruleList[0].value !== "" && ruleList[1].value !== "" && ruleList[2].value === "");
    };

    const removeRule = (event, rule, index) =>{
        event.stopPropagation();
        onRemoveSelectedRule(rule, index)
    };

    const getAppliedFilter = () => {
        return <div key="text" className={styles.popoverFilter}>
            <div className={styles.parentTextStyle} onClick={onPopoverClick}><H5
                className={styles.filTextStyle}>Filter</H5>
                <label style={{marginRight: 3}}>{t('admin_filter_adaptor_match_text')}</label>
                {matchSelectedValue.name === t('admin_envConfig_filter_allRules') ? <i>{t('all')}</i> : <i>{t('any')}</i>}
                <label style={{marginLeft: 3}}>{t('sysmgr.tab.rules.label').toLowerCase()}.</label>
            </div>
            <table className={styles.tableParentStyle}>
                <thead onClick={onPopoverClick}>
                <tr>
                    <td className={styles.tableHead}>{t('sysmgr.clientintegration.column.title')}</td>
                    <td className={styles.tableHead}>{t('sysmgr.fields.rule.caption')}</td>
                </tr>
                </thead>
                <tbody>
                {
                    _.map(ruleList, (rule, index) => {
                        return <>
                            { (rule.value || rule.condition === t('admin_envConfig_filter_isEmpty')) &&
                                <tr key={rule.id}>
                                    <td className={styles.tdStyle}>{rule.column}</td>
                                    <td className={styles.tdStyle}>{ruleList.length > 1 && checkRemoveRuleDisplay() ?
                                        <div className={styles.ruleCancelStyle}>
                                            <label><i>{rule.condition}</i>{` ${rule.value}`}
                                            </label>
                                            <div
                                                title={t('admin_remove_rule_stats_tooltip')}
                                                className={styles.cancelFilterBtnStyle} onClick={(event) => {
                                                removeRule(event, rule, index)
                                            }}><Icons
                                                icon={ICONS.SPRITE_RED_CLOSE_ICON}/></div>
                                        </div> : <label><i>{rule.condition}</i>{` ${rule.value}`}</label>}</td>
                                </tr>
                            }
                            </>
                    })
                }
                </tbody>
            </table>
        </div>
    };

    const dotheneedful = (sibling) => {
        if (sibling != null) {
            documentStartElement.focus();
            documentStartElement.style.borderWidth = '1px';
            documentStartElement.style.borderColor = "transparent #435b8c #435b8c #f1f1f1";
            sibling.focus();
            setDocumentStartElement(sibling)
        }
    };

    const checkKey = (e) => {
        if (e.keyCode == '38') {
            // up arrow
            let idx = documentStartElement.cellIndex;
            let nextrow = documentStartElement.parentElement.previousElementSibling;
            if (nextrow != null) {
                let sibling = nextrow.cells[idx];
                dotheneedful(sibling);
            }
        } else if (e.keyCode == '40') {
            // down arrow
            let idx = documentStartElement.cellIndex;
            let nextrow = documentStartElement.parentElement.nextElementSibling;
            if (nextrow != null) {
                let sibling = nextrow.cells[idx];
                dotheneedful(sibling);
            }
        } else if (e.keyCode == '37') {
            // left arrow
            let sibling = documentStartElement.previousElementSibling;
            dotheneedful(sibling);
        } else if (e.keyCode == '39') {
            // right arrow
            let sibling = documentStartElement.nextElementSibling;
            dotheneedful(sibling);
        }
    };

    return (
        <div className={styles.contentPanel} elevation={Elevation.ZERO}>
            {headerTitle ? <div className={styles.header}>
                <div className={styles.headerContainerStyle}>
                    <h4 className={styles.headerIcon}>{headerIcon}</h4>
                    <h4 className={styles.headerContent}>{headerTitle}</h4>
                </div>
                {actions}
            </div> : null}
            <div className={styles.body}>
                <div>
                    <table id={tableId} className={tableId}>
                        <thead>
                        {searchResultCol.map((key, index) => {
                            return <th className={key.caption === 'id' ? styles.hiddenColumn : showFilterBtnOnColumn === 'environment' ? styles.columnStatsHeaderText : styles.columnHeaderText}>
                                <div onClick={() => {
                                    if (totalSearches >= 0) {
                                        onTableHeaderCellSelect(key, index);
                                        let d = sortDir === null ? SORT_DIRECTION.ASC : sortDir === SORT_DIRECTION.ASC ? SORT_DIRECTION.DES : SORT_DIRECTION.ASC;
                                        if (totalSearches < 100) {
                                            setSortDir(d);
                                        }
                                        applySorting(key.name, d);
                                    }
                                }} className={styles.colHeader}
                                     style={{
                                         border: selectedHeaderCell.id === index && selectedHeaderCell.name === key.name ? "1px dashed darkblue" : "1px dashed transparent",
                                         height: 42, width: filterApply && index === 0 && 380
                                     }}>
                                    <h4 className={styles.colTextStyle} style={{width: key.colWidth}}>{key.caption?.trim()}</h4>
                                    {isSortable && totalSearches < 100 ? selectedColumn === key.name ? sortDir === SORT_DIRECTION.ASC ?
                                        <div className={styles.sortingIconStyle}><Icons icon={ICONS.FORM_UP}/></div> :
                                        <div className={styles.sortingIconStyle}><Icons icon={ICONS.FORM_DOWN}/>
                                        </div> : null
                                        : null
                                    }
                                    {
                                        !filterApply ?
                                            <ColumnComponent showFilterButton={key.name == showFilterBtnOnColumn}
                                                             onOpenFilter={onOpenFilter} columnName={key.caption}
                                                             onFilterClick={(e) => onFilterClicked(e, key)} showFilterBtnOnColumn={showFilterBtnOnColumn}/>
                                            :
                                            <div className={styles.popoverParent}
                                                 onClick={key.name == showFilterBtnOnColumn ? () => {
                                                 } : onOpenFilter}>
                                                {
                                                    key.name == showFilterBtnOnColumn && <>
                                                        <div style={{display: 'flex', alignItems: 'center', width: 50}}
                                                             title={t('admin_define_filter')}>
                                                            <Button icon={filterIcon} className={styles.filterDiv}
                                                                    onClick={onOpenFilter}>
                                                                <h2 style={{margin:0}}>...</h2>
                                                            </Button>
                                                        </div>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            marginLeft: 5
                                                        }}>
                                                            <Popover2 interactionKind={'hover'}
                                                                      content={getAppliedFilter()}
                                                                      placement={'bottom-end'}
                                                                      style={{width: '100%'}}>
                                                                <span style={{whiteSpace: 'nowrap'}}
                                                                      onClick={onOpenFilter}
                                                                >
                                                                    {tableId !== "componentAdaptorsStatistics" ?
                                                                        `${filteredAdaptorList.length} of ${adaptorsList.length} ${t('admin.envconfig.component.adaptors.title')} shown `
                                                                    :
                                                                        `${filteredAdaptorList.length} of ${adaptorsList.length} ${t('admin.envconfig.component.adaptors.stats.label')} ${t('stats_admin_shown_text')} `}
                                                                </span>
                                                            </Popover2>
                                                            <span className={styles.clearFilter} tabindex={0} id={index}
                                                                  onClick={onClearBtnClick}>{`${t('admin_clear_filter_header_text')}`}</span>
                                                        </div>
                                                    </>
                                                }
                                                {
                                                    !enableFilterDialog &&
                                                    <Popover2 interactionKind={'hover'} content={getAppliedFilter()}
                                                              placement={'bottom-end'}
                                                              style={{width: '100%'}}>
                                                        <div style={{width: '100%'}}>&nbsp;</div>
                                                    </Popover2>
                                                }
                                            </div>
                                    }

                                </div>
                            </th>
                        })}

                        </thead>

                        <tbody>
                        {
                            !loading && !isError && tableData?.map((data, i) => {
                                const result = selectedRow.find(row => row.id === data.id);
                                return (
                                    <tr tabIndex={-1}
                                        title={appType === 'UlteraAdmin' ? "" : tableName ? tableName : t('RESULTS_TITLE')}
                                        onClick={(e) => {
                                            onTableRowSelectClick(data, e, i)
                                        }}
                                        style={{background: tableId !== "componentAdaptorsStatistics" && result !== undefined && "none #fce6bf"}}>
                                        {searchResultCol.map((colName, tdIndex) => {
                                            return <td tabIndex={0} id={`${tdIndex}-${i}`}
                                                       style={{'--outline': !disableFocus && '-webkit-focus-ring-color auto 1px'}}
                                                       onKeyDown={(e) => {
                                                           setDisableFocus(false);
                                                           if (e.key === 'Tab') {
                                                               onTableCellSelect(colName, i, tdIndex);
                                                               setSelectedCell({})
                                                           } else if ((e.shiftKey || e.ctrlKey) && (e.key === 'a' || e.key === 'A')) {
                                                               setSelectedRow(tableData);
                                                               actionsOnTableRowClick && actionsOnTableRowClick(tableData);
                                                               e.preventDefault();
                                                           } else if (e.ctrlKey && (e.key === 'r' || e.key === 'R')) {
                                                               handleRemove && handleRemove();
                                                               e.preventDefault();
                                                           } else {
                                                               checkKey(e);
                                                               setSelectedCell({})
                                                           }
                                                       }}
                                                       onClick={() => {
                                                           onTableCellSelect(colName, i, tdIndex);
                                                           setSelectedCell({
                                                               id: i,
                                                               name: colName.name
                                                           });
                                                           setDisableFocus(true)
                                                       }}
                                                       className={colName === 'id' ? styles.hiddenColumn : disabledColName?.includes(colName.name) ? styles.disabledRow : null}>
                                                <h4 className={disabledColName?.includes(colName.name) ? styles.disabledRowTextStyle : styles.rowTextStyle}
                                                    style={{border: selectedCell.id === i && selectedCell.name === colName.name ? "1px dashed darkblue" : "1px dashed transparent"}}>
                                                    <div style={{width: colName.colWidth}}
                                                         className={styles.contentTextStyle}>{data[colName.name]}</div>
                                                </h4>
                                            </td>
                                        })}
                                    </tr>)
                            })}
                        </tbody>
                    </table>
                    {loading ?
                        <div className={styles.tableLoadingContainer}
                             style={{'--width': showPageFooter ? window.screen.width + 'px' : 'auto'}}>
                            <div className={styles.loadingGifStyle}/>
                            <h4 className={styles.loadingText}>{t('message_loading')}</h4></div> :
                        isError ? <>
                                <button className={styles.errorIcon}/>
                                <h4 className={styles.loadingText}>{t('message_table_error')}</h4></> :
                            !loading && tableData?.length <= 0 && !isHideNoSearchResultMsg ?
                                <div className={styles.tableLoadingContainer}
                                     style={{'--width': showPageFooter ? window.screen.width + 'px' : 'auto'}}>
                                    <div className={styles.loadingGifContainer}>
                                        <h4 className={styles.loadingText}>{noDataText.length > 0 ? noDataText : t('sysmgr.roles.config.nodata')}</h4>
                                    </div>
                                </div> : null}
                    <div>
                    </div>
                </div>
            </div>
            {showPageFooter ? totalSearches >= 0 && tableData?.length ? <div className={styles.footer}>
                    <h4 className={styles.footerContent}>{t('label_pagination', {
                        start: pageRange.startPage,
                        end: pageRange.endPage,
                        totalSearches: totalSearches
                    })}</h4>
                    {tableData?.length ?
                        <div className={styles.paginationContainerStyle}>
                            {currentPage <= 1 ?
                                <>
                                    <div className={styles.paginationDisabledIconStyle} title={t('firstTip')}><Icons
                                        icon={ICONS.PAGING_DISABLED_FIRST}/>
                                    </div>
                                    <div className={styles.paginationDisabledIconStyle} title={t('prevTip')}><Icons
                                        icon={ICONS.PAGING_DISABLED_PREVIOUS}/>
                                    </div>
                                </> :
                                <>
                                    <div className={styles.paginationIconStyle} onClick={() => btnFirstClick()}
                                         title={t('firstTip')}><Icons
                                        icon={ICONS.PAGING_FIRST}/></div>
                                    <div className={styles.paginationIconStyle} onClick={() => btnPrevClick()}
                                         title={t('prevTip')}><Icons
                                        icon={ICONS.PAGING_PREVIOUS}/></div>
                                </>}
                            <div className={styles.pageNumberStyle}>{
                                pageNumbers.map(number => {
                                    if ((number < upperPageBound + 1) && number > lowerPageBound) {
                                        return (
                                            <div id={number}
                                                 className={number === currentPage ? styles.selectedPage : styles.page}
                                                 onClick={(e) => handleClick(e)}>{number}</div>
                                        )
                                    }
                                })

                            }</div>
                            {currentPage >= totalPages ?
                                <div className={styles.paginationDisabledIconStyle} title={t('nextTip')}><Icons
                                    icon={ICONS.PAGING_DISABLED_NEXT}/></div> :
                                <div className={styles.paginationIconStyle} onClick={() => btnNextClick()}
                                     title={t('nextTip')}><Icons
                                    icon={ICONS.PAGING_NEXT}/></div>}
                            {currentPage >= totalPages ?
                                <div className={styles.paginationDisabledIconStyle} title={t('lastTip')}><Icons
                                    icon={ICONS.PAGING_DISABLED_LAST}/></div> :
                                <div className={styles.paginationIconStyle} onClick={() => btnLastClick()}
                                     title={t('lastTip')}><Icons
                                    icon={ICONS.PAGING_LAST}/></div>}
                            {totalPages === 1 ?
                                <div className={styles.paginationDisabledIconStyle} title={t('gotoButtonTitle')}><Icons
                                    icon={ICONS.PAGING_DISABLED_UP}/></div> :
                                <div className={styles.paginationIconStyle} onClick={() => handleOpenPage()}
                                     title={t('gotoButtonTitle')}><Icons
                                    icon={ICONS.PAGING_UP}/></div>}
                        </div>
                        : null}
                </div> : null
                : null}
            {
                isSelectPageDialogOpen &&
                <ConfirmationDialog
                    isPaginationPopup={true}
                    showDialog={true}
                    headerText={t('dialogTitle')}
                    divideByX={3}
                    body={
                        <div>
                            <h4 className={styles.paginationPopupLabel}>{t('label_specify_page_number')}</h4>
                            <div className={styles.paginationPopup}>
                                <InputBox width={'80px'} inputType={INPUT_TYPE.NUMBER}
                                          value={enteredPageNum}
                                          onChange={(e) => setEnteredPageNum(e.target.value ? Number(e.target.value) : null)}
                                          errorText={enteredPageNum > totalPages && t('rangeMessage')}/>
                                <h4 className={styles.paginationPopupLabel}>{t('pageCountIndication', {totalPages: totalPages})}</h4>
                            </div>
                        </div>
                    }
                    width={236}
                    environmentError={enteredPageNum > totalPages || enteredPageNum === null}
                    onClose={() => handleOpenPage()}
                    yesButtonText={t('button_go')}
                    noButtonText={t('btn.common.cancel')}
                    onNoBtnClick={() => handleOpenPage()}
                    onYesBtnClick={() => gotoPage(enteredPageNum)}
                    isCloseButtonShown={true}
                    yesButtonTooltip={t('button_go')}
                    noButtonTooltip={t('btn.common.cancel')}
                />
            }
        </div>
    )
};