import React, {useEffect, useState} from "react";
import styles from "./table.module.scss";
import {Elevation} from "@blueprintjs/core";
import {ConfirmationDialog, Icons, InputBox} from "../index";
import {ICONS} from "../../utils/iconNames";
import {INPUT_TYPE, SORT_DIRECTION} from "../../utils/common";
import {useTranslation} from "react-i18next";
import {useSelector} from "react-redux";
import _ from "lodash";

export const Table = (props) => {
    const {
        headerIcon, headerTitle, actions, tableData = [], showPageFooter, searchResultCol, isSortable, onColumnSort,  defaultSortingFlag,
         disabledColName, tableId, loading, getSearchResults, applyFilter, isError, actionsOnTableRowClick, setTableColumnsWidth=()=>{},handleRemove,
        isHideNoSearchResultMsg=false, rowNav, currentSelectedRow=()=>{}, tableName, appType = 'Ultera',maxSortRowLength=100,isValidationPanelOpen=false,
        setEnabledButtonArray, showZeroItemsInPage, getPaginatedLogs, initialLogStatusChangeFlag, setInitialLogStatusChangeFlag, setDetailsViewMessage,resetClick=false,
        noSortColumns=[], noDataText='',allowMultiRowSelection=true, showZeroItemsFooter=false, rowTooltip='',searchClick,isFullWidth=false} = props;
    const {totalSearches, pageSize, activeSubTabIndex,currentTemplate,defaultTemplate} = useSelector((state) => state.dashboard);
    const {sortBy, orderBy} = useSelector((state) => state.envManagement);
    const {t} = useTranslation();

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
    const [gotoPageTextError, setGotoPageError] = useState('');
    const [documentStartElement, setDocumentStartElement] = useState();
    const [disableFocus, setDisableFocus] = useState(false);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);

    const searchResultColRef = React.useRef(searchResultCol);

    useEffect(()=>{
        if(defaultSortingFlag){
            setSelectedColumn(sortBy);
            onColumnSort && onColumnSort(sortBy, orderBy)
        }
    }, []);

    useEffect(()=>{
        if(searchClick?.isSearchBtnClick) {
            if (currentTemplate === defaultTemplate) {
                setCurrentPage(1);
            }
        }
    },[searchClick])

    useEffect(()=>{
        searchResultColRef.current = searchResultCol;
    },[searchResultCol]);

    useEffect(()=>{
        if(getSearchResults) {
            setSortDir(null);
            setSelectedColumn(null);
            setSelectedHeaderCell({});
            setCurrentPage(1);
        }
    },[activeSubTabIndex]);

    useEffect(()=>{
        if(resetClick) {
            setCurrentPage(1);
        }
    },[resetClick]);

    useEffect(()=>{
        let tables = document.getElementsByClassName(tableId);
        for (let i = 0; i < tables.length; i++) {
            resizableGrid(tables[i]);
        }
    }, [tableData]);

    useEffect(() => {
        if (showPageFooter && totalSearches) {
            setSelectedRow([]);
            setSelectedCell({});
            actionsOnTableRowClick && actionsOnTableRowClick([]);
            let start = (currentPage * pageSize) - (pageSize - 1);
            let end = Math.min(start + pageSize - 1, totalSearches);
            setPageRange({startPage: start, endPage: end});
            if(sortDir && selectedColumn) {
                if(getSearchResults) {
                    getSearchResults({
                        startPage: start === 1 ? 0 : start,
                        endPage: end <= 25 ? 24 : end
                    }, selectedColumn, sortDir, true);
                }
            }else{
                if(getSearchResults) {
                    getSearchResults({
                        startPage: start === 1 ? 0 : start,
                        endPage: end <= 25 ? 24 : end
                    });
                }
            }
        }
    }, [currentPage, totalSearches]);

    useEffect(() => {
        if (showPageFooter && totalSearches && getPaginatedLogs) {
            if(!initialLogStatusChangeFlag) {
                let start = (currentPage * pageSize) - (pageSize - 1);
                let end = Math.min(start + pageSize - 1, totalSearches);
                setPageRange({startPage: start, endPage: end});
                getPaginatedLogs({
                    startPage: start,
                    endPage: end
                }, selectedColumn != null ? selectedColumn : '' , sortDir != null ? sortDir : '')
            }else{
                setCurrentPage(1);
                let start = (currentPage * pageSize) - (pageSize - 1);
                let end = Math.min(start + pageSize - 1, totalSearches);
                setPageRange({startPage: 1, endPage: end});
            }
        }

    }, [currentPage]);

    useEffect(()=>{
        if(initialLogStatusChangeFlag && totalSearches){
            setCurrentPage(1);
            let start = (currentPage * pageSize) - (pageSize - 1);
            let end = Math.min(start + pageSize - 1, totalSearches);
            setPageRange({startPage: 1, endPage: end});
        }
    },[initialLogStatusChangeFlag]);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const handleClick = (event) => {
        let num= Number(event.target.id);
        if(num<pageBound){
            setUpperPageBound(pageBound);
            setLowerPageBound(0);
        }else if(num >= totalPages){
            setUpperPageBound(totalPages);
            setLowerPageBound(totalPages-pageBound);
        }else{
            setUpperPageBound(num+3);
            setLowerPageBound(num-4);
        }
        setCurrentPage(Number(event.target.id));
        setInitialLogStatusChangeFlag && setInitialLogStatusChangeFlag(false);
        setDetailsViewMessage && setDetailsViewMessage('')
    };

    const btnFirstClick = () => {
        setUpperPageBound(pageBound);
        setLowerPageBound(0);
        setCurrentPage(1);
        setInitialLogStatusChangeFlag && setInitialLogStatusChangeFlag(false);
        setDetailsViewMessage && setDetailsViewMessage('')
    }

    const btnLastClick = () => {
        setUpperPageBound(totalPages);
        setLowerPageBound(totalPages - pageBound);
        setCurrentPage(totalPages);
        setInitialLogStatusChangeFlag && setInitialLogStatusChangeFlag(false)
        setDetailsViewMessage && setDetailsViewMessage('')
    }

    const btnNextClick = () => {
        if (currentPage < totalPages) {
            if ((currentPage + 1) > upperPageBound) {
                setUpperPageBound(upperPageBound + pageLimit);
                setLowerPageBound(lowerPageBound + pageLimit);
            }
            setCurrentPage(currentPage + 1);
        }
        setInitialLogStatusChangeFlag && setInitialLogStatusChangeFlag(false)
        setDetailsViewMessage && setDetailsViewMessage('')
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
        setInitialLogStatusChangeFlag && setInitialLogStatusChangeFlag(false);
        setDetailsViewMessage && setDetailsViewMessage('')
    };

    const handleOpenPage = () => {
        setEnteredPageNum(null);
        setGotoPageError('');
        setIsSelectPageDialogOpen(!isSelectPageDialogOpen);
    };

    const handleGotoTextChange=(e)=>{
        const pattern = /^[0-9]+$/;
        if (!pattern.test(e.target.value)) {
            setGotoPageError(t('validation_text_invalid_required'))
        }else if(e.target.value > totalPages || e.target.value<=0){
            setGotoPageError(t('rangeMessage'))
        }else{
            setGotoPageError('')
        }
        setEnteredPageNum( e.target.value?e.target.value:null)
    };

    const gotoPage = (pageNumStr) => {
        if (pageNumStr) {
            const pageNum = parseInt(pageNumStr);
            if (pageNum <= totalPages) {
                setUpperPageBound(pageNum + pageLimit);
                setLowerPageBound(pageNum - (pageLimit + 1));
                setCurrentPage(pageNum);
            }
        }
        setIsSelectPageDialogOpen(!isSelectPageDialogOpen);
        setInitialLogStatusChangeFlag && setInitialLogStatusChangeFlag(false);
        setDetailsViewMessage && setDetailsViewMessage('');
    };

    const applySorting = (columnName, sortDirection) => {
        setSelectedColumn(columnName);
        getSearchResults && getSearchResults(pageRange,columnName, sortDirection, true);
        getPaginatedLogs && getPaginatedLogs(pageRange,columnName, sortDirection);
        onColumnSort && onColumnSort(columnName, sortDirection);
        setSelectedRow([]);
        setDetailsViewMessage && setDetailsViewMessage('');
    };

    const onTableRowSelectClick = (data,e, i) =>{
        if (e.shiftKey) {
            if (allowMultiRowSelection) {
                let d = [...selectedRow];
                setSelectedRowIndex(i);
                if (selectedRowIndex != null && selectedRowIndex < i) {
                    let dNew = [];
                    _.map(tableData, (tableRow, index) => {
                        if (index >= selectedRowIndex && index <= i) {
                            dNew.push(tableRow);
                        }
                    });
                    d = [...dNew]
                } else if (selectedRowIndex != null && selectedRowIndex > i) {
                    let dNew = [];
                    _.map(tableData, (tableRow, index) => {
                        if (index >= i && index <= selectedRowIndex) {
                            dNew.push(tableRow);
                        }
                    });
                    d = [...dNew]
                } else {
                    d.push(data);
                }
                setSelectedRow(d);
                if (selectedRow.length > 0) {
                    actionsOnTableRowClick && actionsOnTableRowClick(d);
                }
            }
        } else if(e.ctrlKey || e.metaKey){
            if (allowMultiRowSelection) {
                if (selectedRow.length > 0) {
                    let d = [...selectedRow];
                    let found = d.find(dObj => dObj === data);
                    if (found === undefined) {
                        d.push(data);
                    } else {
                        d = _.reject(d, (dObj) => {
                            return dObj === data
                        });
                    }
                    setSelectedRow(d);
                    if (d.length > 0) {
                        actionsOnTableRowClick && actionsOnTableRowClick(d, i);
                    }
                } else {
                    setSelectedRow([data]);
                    setSelectedRowIndex(i);
                    actionsOnTableRowClick && actionsOnTableRowClick(data, i);
                }
            }
        } else {
            setSelectedRow([data]);
            setSelectedRowIndex(i);
            actionsOnTableRowClick && actionsOnTableRowClick(data, i);
        }
        setSelectedHeaderCell({});
    };

    useEffect(()=>{
        if(rowNav) {
            let index = tableData?.findIndex(d1 => d1?.name === selectedRow[0]?.name);
            if (index > -1) {
                let selectedIndex = rowNav.key === 'Next' ? index + 1 : index > 0 ? index - 1 : 0;
                tableData[selectedIndex] && setSelectedRow([tableData[selectedIndex]]);
                currentSelectedRow({index: selectedIndex, data: tableData[selectedIndex]});
            }
        }
    },[rowNav]);

    const onTableCellSelect = (colName, index, tdIndex) =>{
        const tableCell = {
            id: index,
            name: colName.name
        };
        //setSelectedCell(tableCell);
        setSelectedHeaderCell({});
        let start = document.getElementById(`${tdIndex}-${index}-${tableId}`);
        setDocumentStartElement(start);
        start.focus();
    };

    const onTableHeaderCellSelect = (colName, index) =>{
        const tableCell = {
            id: index,
            name: colName.name
        };
        setSelectedHeaderCell(tableCell);
        setSelectedCell({});
        setEnabledButtonArray && setEnabledButtonArray([])
    };

    const updateColumnConfig = (index,newColConfig) => {
        const clonedData = [...searchResultColRef.current];
        clonedData[index] = newColConfig;
        setTableColumnsWidth(clonedData)
    };
    const getStyleVal = (elm, css) => {
        return (window.getComputedStyle(elm, null).getPropertyValue(css))
    };
    const paddingDiff = (col) => {
        if (getStyleVal(col, 'box-sizing') === 'border-box') {
            return 0;
        }
        let padLeft = getStyleVal(col, 'padding-left');
        let padRight = getStyleVal(col, 'padding-right');
        return (parseInt(padLeft) + parseInt(padRight));
    };
    const setListeners = (div) => {
        let pageX, curCol, nxtCol, curColWidth, nxtColWidth, tableWidth;
        div.addEventListener('mousedown',  (e) =>{
            tableWidth = document.getElementById(tableId).offsetWidth;
            curCol = e.target.parentElement;
            nxtCol = curCol.nextElementSibling;
            pageX = e.pageX;
            let padding = paddingDiff(curCol);
            curColWidth = curCol.offsetWidth - padding;
        });
        div.addEventListener('mouseover',  (e) => {
            e.target.style.borderRight = '2px solid transparent';
        });
        div.addEventListener('mouseout',  (e) => {
            e.target.style.borderRight = '';
        });
        document.addEventListener('mousemove',  (e) => {
            if (curCol) {
                let diffX = e.pageX - pageX;
                curCol.style.width = (curColWidth + diffX) + 'px';
                document.getElementById(tableId).style.width = tableWidth + diffX + "px";
                let clonedData = [...searchResultCol];
                let index = clonedData?.findIndex(d1 => d1.caption === curCol.innerText);
                updateColumnConfig(index,{
                    name: searchResultCol[index]?.name,
                    caption: curCol.innerText,
                    colWidth: curColWidth + diffX
                })
            }
        });
        document.addEventListener('mouseup',  (e) =>{
            curCol = undefined;
            nxtCol = undefined;
            pageX = undefined;
            nxtColWidth = undefined;
            curColWidth = undefined
        });
    };
    const createDiv = (height) => {
        let div = document.createElement('div');
        div.style.top = 0;
        div.style.right = 0;
        div.style.width = '5px';
        div.style.position = 'absolute';
        div.style.cursor = 'col-resize';
        div.style.userSelect = 'none';
        div.style.height = height + 'px';
        return div;
    };
    const resizableGrid = (table) => {
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
        <div className={styles.contentPanel} elevation={Elevation.ZERO} >
            {headerTitle?<div className={styles.header}>
                <div className={styles.headerContainerStyle}>
                    {headerIcon&&
                        <h4 className={styles.headerIcon}>{headerIcon}</h4>
                    }
                    <h4 className={styles.headerContent}>{headerTitle}</h4>
                </div>
                {actions}
            </div>:null}
            <div className={tableName===t('ASSISTANT_TITLE') ? styles.validationPanelBody :styles.body} title={appType === 'UlteraAdmin' ? "" : tableName? tableName : tableId === 'log' ? t('com.ipd.admin.logviewer.title') : t('RESULTS_TITLE')}>
                <div className={isFullWidth && styles.tableStyle}>
                    <table id={tableId} className={tableId} style={(showPageFooter && tableData?.length < 24) ? {overflow:'hidden'}:{}}>
                        <thead>
                        {searchResultCol.map((key,index) => {
                            return <th className={key.caption === 'id' ? styles.hiddenColumn : styles.columnHeaderText}>
                                <div title={tableId === 'log' && t('com.ipd.admin.logviewer.title')} onClick={() => {
                                    if(totalSearches>=0) {
                                        onTableHeaderCellSelect(key, index);
                                        let d = sortDir === null ? SORT_DIRECTION.ASC : sortDir === SORT_DIRECTION.ASC ? SORT_DIRECTION.DES : SORT_DIRECTION.ASC;
                                        if (isSortable && (tableName!==t('search.result') || (totalSearches < maxSortRowLength))) {
                                            setSortDir(d);
                                        }
                                        applySorting(key.name, d);
                                    }
                                }} className={styles.colHeader}
                                     style={{border: selectedHeaderCell.id === index && selectedHeaderCell.name === key.name ? "1px dashed darkblue" : "1px dashed transparent",
                                     }}>
                                    <h4 className={styles.colTextStyle} style={{width: key.colWidth}}>{key.caption}</h4>
                                    {!noSortColumns.includes(selectedColumn)? (isSortable  && (tableName!==t('search.result') || (totalSearches < maxSortRowLength))) ? selectedColumn === key.name ? sortDir === SORT_DIRECTION.ASC ?
                                        <div className={styles.sortingIconStyle}><Icons icon={ICONS.FORM_UP}/></div> :
                                        <div className={styles.sortingIconStyle}><Icons icon={ICONS.FORM_DOWN}/>
                                        </div> : null
                                        : null
                                        :null
                                    }
                                </div>
                            </th>
                        })}
                        </thead>
                        <tbody style={(showPageFooter && tableData?.length < 24) ? {overflow:'hidden'}:{}}>
                        {
                            applyFilter &&
                            <div className={styles.filterStyle}>
                                {applyFilter}
                            </div>
                        }
                        {
                            !loading && !isError && tableData?.map((data, i) => {
                                return (
                                    <tr tabIndex={-1} title={rowTooltip ? rowTooltip : appType === 'UlteraAdmin' ? "" : tableName? tableName : tableId === 'log' ? t('com.ipd.admin.logviewer.title') : t('RESULTS_TITLE')}
                                       onDoubleClick={()=>{
                                           setSelectedRow([data]);
                                           setSelectedRowIndex(i);
                                           actionsOnTableRowClick && actionsOnTableRowClick(data, i, true);  // third parameter is--> isDoubleClicked
                                       }} onClick={(e)=>{onTableRowSelectClick(data, e, i)}}
                                        style={{background: selectedRow.includes(data) && "none #fce6bf"}}>
                                    {searchResultCol.map((colName, tdIndex) => {
                                        return <td tabIndex={0} id={`${tdIndex}-${i}-${tableId}`} style={{'--outline': !disableFocus && '#3278cf auto 1px'}}
                                                   onKeyDown={(e) => {
                                                           setDisableFocus(false);
                                                           if (e.key === 'Tab') {
                                                               onTableCellSelect(colName, i, tdIndex);
                                                               setSelectedCell({});
                                                           } else if ((e.ctrlKey) && (e.key === 'a' || e.key === 'A') && allowMultiRowSelection) {
                                                               setSelectedRow(tableData);
                                                               actionsOnTableRowClick && actionsOnTableRowClick(tableData);
                                                               e.preventDefault();
                                                           } else if (e.ctrlKey && (e.key === 'r' || e.key === 'R') && allowMultiRowSelection) {
                                                               e.preventDefault();
                                                               handleRemove && handleRemove();
                                                           }else if (e.key === 'Enter') {
                                                               onTableRowSelectClick(data, e, i);
                                                               setSelectedCell({});
                                                            }  else {
                                                               checkKey(e);
                                                               setSelectedCell({});
                                                           }
                                                   }}
                                                   onClick={()=>{onTableCellSelect(colName, i, tdIndex); setSelectedCell({
                                                       id: i,
                                                       name: colName.name
                                                   });
                                                   setDisableFocus(true)}}
                                                   className={colName === 'id' ? styles.hiddenColumn : disabledColName?.includes(colName.name) ? styles.disabledRow : null}>
                                            <h4 className={disabledColName?.includes(colName.name) ? styles.disabledRowTextStyle : styles.rowTextStyle}
                                                style={{border: selectedCell.id === i && selectedCell.name === colName.name ? "1px dashed darkblue" : "1px dashed transparent"}}>
                                                <div style={{width: colName.colWidth}} className={styles.contentTextStyle}>{data[colName.name]}</div>
                                            </h4>
                                        </td>
                                    })}
                                    </tr>)
                            })}
                        </tbody>
                    </table>
                    <div style={headerTitle===t('search.result') ? {width:'100%', position:'absolute'}:{}}>
                        {loading ?
                            <div className={styles.tableLoadingContainer} style={headerTitle===t('search.result') ? {}:{'--width':  showPageFooter && tableId !== "log" ? window.screen.width+'px':'auto'}}>
                                <div className={styles.loadingGifStyle}/>
                                <h4 className={styles.loadingText}>{t('message_loading')}</h4></div> :
                            isError ? <>
                                    <button className={styles.errorIcon}/>
                                    <h4 className={styles.loadingText}>{t('message_table_error')}</h4></> :
                                !loading && tableData?.length <= 0 && !isHideNoSearchResultMsg?
                                    <div className={styles.tableLoadingContainer}  style={headerTitle===t('search.result') ? {}:{'--width':showPageFooter && tableId !== "log" ? window.screen.width+'px':'auto'}}>
                                        <div className={styles.loadingGifContainer}>
                                            {noDataText.length ? <h4 className={styles.loadingText}>{noDataText}</h4> :<h4 className={styles.loadingText}> {t('sysmgr.roles.config.nodata')}</h4>}
                                        </div>
                                    </div> : null}
                    </div>
                    <div>
                    </div>
                </div>
            </div>
            {showPageFooter ? showZeroItemsFooter?<div className={styles.footer} title={appType === 'UlteraAdmin' ? "" : tableName? tableName: t('RESULTS_TITLE')}>
                    <h4 className={styles.footerContent}>{'0 items'}</h4>
                </div> :totalSearches >= 0 && (tableData?.length || showZeroItemsInPage) ?<div className={styles.footer} title={appType === 'UlteraAdmin' ? "" : tableName? tableName: tableId === 'log' ? t('com.ipd.admin.logviewer.title') : t('RESULTS_TITLE')}>
                    <h4 className={styles.footerContent}>{ showZeroItemsInPage ?
                        t('zero_items_in_page',{totalSearches: totalSearches})
                        :
                        t('label_pagination', {
                        start: pageRange.startPage,
                        end: pageRange.endPage,
                        totalSearches: totalSearches
                    })}</h4>
                {tableData?.length?
                    <div className={styles.paginationContainerStyle}>
                        {currentPage <= 1 ?
                            <>
                                <div className={styles.paginationDisabledIconStyle}  title={t('firstTip')}><Icons icon={ICONS.PAGING_DISABLED_FIRST}/>
                                </div>
                                <div className={styles.paginationDisabledIconStyle} title={t('prevTip')}><Icons icon={ICONS.PAGING_DISABLED_PREVIOUS}/>
                                </div>
                            </> :
                            <>
                                <div className={styles.paginationIconStyle} onClick={() => btnFirstClick()} title={t('firstTip')}><Icons
                                    icon={ICONS.PAGING_FIRST}/></div>
                                <div className={styles.paginationIconStyle} onClick={() => btnPrevClick()} title={t('prevTip')}><Icons
                                    icon={ICONS.PAGING_PREVIOUS}/></div>
                            </>}
                        <div className={styles.pageNumberStyle}>{
                              pageNumbers.map(number => {
                                if ((number < upperPageBound + 1) && number > lowerPageBound) {
                                    return (
                                        <div id={number} title={number}
                                             className={Number(number) === Number(currentPage) ? styles.selectedPage : styles.page}
                                             onClick={(e) => handleClick(e)}>{number}</div>
                                    )
                                }
                            })

                        }</div>
                        {currentPage >= totalPages ?<div className={styles.paginationDisabledIconStyle} title={t('nextTip')}><Icons icon={ICONS.PAGING_DISABLED_NEXT}/></div>: <div className={styles.paginationIconStyle} onClick={() => btnNextClick()} title={t('nextTip')}><Icons
                            icon={ICONS.PAGING_NEXT}/></div>}
                        {currentPage >= totalPages ?  <div className={styles.paginationDisabledIconStyle} title={t('lastTip')}><Icons icon={ICONS.PAGING_DISABLED_LAST}/></div>: <div className={styles.paginationIconStyle} onClick={() => btnLastClick()} title={t('lastTip')}><Icons
                            icon={ICONS.PAGING_LAST}/></div>}
                        {totalPages === 1 ?<div className={styles.paginationDisabledIconStyle} title={t('gotoButtonTitle')}><Icons icon={ICONS.PAGING_DISABLED_UP}/></div>: <div className={styles.paginationIconStyle} onClick={() => handleOpenPage()} title={t('gotoButtonTitle')}><Icons
                            icon={ICONS.PAGING_UP}/></div>}
                    </div>
                    : null}
                </div>: isValidationPanelOpen?<div className={styles.footer} title={appType === 'UlteraAdmin' ? "" : tableName? tableName: t('RESULTS_TITLE')}>
                    <h4 className={styles.footerContent}>{'0 items'}</h4>
                </div>:null
                : null}
            {
                isSelectPageDialogOpen &&
                <ConfirmationDialog
                    isPaginationPopup={!getPaginatedLogs ? true: false}
                    showDialog={true}
                    headerText={t('dialogTitle')}
                    divideByX={!getPaginatedLogs ? 3 : 5}
                    divideByY={getPaginatedLogs && 6}
                    body={
                        <div title={t('dialogTitle')}>
                            <h4 className={styles.paginationPopupLabel}>{t('label_specify_page_number')}</h4>
                            <div className={styles.paginationPopup}>
                                <InputBox width={'80px'} inputType={INPUT_TYPE.TEXT}
                                          value={enteredPageNum}
                                          onChange={(e) => handleGotoTextChange(e)}
                                          errorText={gotoPageTextError}/>
                                <h4 className={styles.paginationPopupLabel}>{t('pageCountIndication', {totalPages: totalPages})}</h4>
                            </div>
                        </div>
                    }
                    width={300}
                    environmentError={enteredPageNum > totalPages || enteredPageNum=== null  || enteredPageNum <= 0 }
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
}