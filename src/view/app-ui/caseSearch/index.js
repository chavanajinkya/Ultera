import React, {useEffect, useState} from 'react'
import {ReflexContainer, ReflexElement, ReflexSplitter} from "react-reflex";
import styles from "./caseSearch.module.scss";
import {ICONS} from "../../../utils/iconNames";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {ConfirmationDialog, HeaderActions, Icons} from "../../../components";
import {SearchCriteriaTable} from "../../../components/tables/SearchCriteriaTable";
import {
    setCriteriaDefinitions,
    setCurrentTemplate,
    setResultSetData, setShowCaseSuccessPopup,
} from "../../../slices/dashboardSlice";
import {getSearchData} from "../../../api";
import {Button, Label} from "@blueprintjs/core";
import {Table} from "../../../components/tables/Table";
import {SORT_DIRECTION} from "../../../utils/common";
import ReassignUser from "./ReassignUser";

const CaseSearchComponent=()=>{
    const {hasValid, noContext,criteriaDefinitionsData,resultSetDefinitionsData,loading,resultSetData,currentTemplate,defaultTemplate, totalSearches,showCaseSuccessPopup, caseReassignPopupLoading}=useSelector((state) => state.dashboard);

    const {t} = useTranslation();
    const dispatch = useDispatch();

    const [isError,setIsError]=useState(false);
    const [showResetConfirmation,setShowResetConfirmation]=useState(false);
    const [showSortValidationPopup,setShowSortValidationPopup]=useState(false);
    const [selectedRows,setSelectedRows]=useState(null);
    const [resetValidationsData, setResetValidationsData]=useState(false);
    const [searchClick, setSearchClick]=useState({isSearchBtnClick:false, index:0});
    const [resetClick, setResetClick]=useState(false);
    const [tableHeader, setTableHeader]=useState([]);
    const [showReassignPopup, setShowReassignPopup]=useState(false);

    const headerWSIcon = <Icons icon={ICONS.CASE_DIRECTORY_SEARCH} />;
    const headerSRIcon = <Icons icon={ICONS.GRID_SHOW} />;
    const printIcon = <Icons icon={ICONS.PRINT} />;
    const searchIcon = <Icons icon={ICONS.DOC_SEARCH_ALL} />;
    const viewIcon = <Icons icon={ICONS.DOC_VIEW} />;
    const resetIcon = <Icons icon={ICONS.DOC_REFRESH} />;
    const reassignIcon = <Icons icon={ICONS.WORK_FORWARD} />;

    const resultButtonActions = [];
    (currentTemplate.findEnabled === undefined || currentTemplate.findEnabled) && resultButtonActions.push(<Button icon={searchIcon} text={t('btn.searchbutton.find')} title={t('btn.searchbutton.find')} className={styles.buttonIcon} onClick={()=>handleSearchClick1()}/>);
    (currentTemplate.viewEnabled === undefined|| currentTemplate.viewEnabled) && resultButtonActions.push(<Button icon={viewIcon} disabled={selectedRows?.length > 1 || !selectedRows?.length } text={t('btn.searchbutton.view')} title={t('btn.searchbutton.view')}  className={styles.buttonIcon}/>);
    (currentTemplate.reassignEnabled) && resultButtonActions.push(<Button icon={reassignIcon} disabled={!selectedRows?.length} text={t('btn.searchbutton.reassign')} title={t('btn.searchbutton.reassign')} className={styles.buttonIcon} onClick={()=>setShowReassignPopup(!showReassignPopup)} />);
    (currentTemplate.printEnabled === undefined|| currentTemplate.printEnabled)  && resultButtonActions.push(<Button icon={printIcon} disabled={!selectedRows?.length} text={t('content.search.printButton.label')} title={t('content.search.printButton.label')} className={styles.buttonIcon}/>);
    resultButtonActions.push(<Button icon={resetIcon} text={t('btn.searchbutton.reset')} title={t('btn.searchbutton.reset')} className={styles.buttonIcon}  onClick={()=>setShowResetConfirmation(!showResetConfirmation)}/>);

    let validations = criteriaDefinitionsData?.filter((d) => d.visibility === 3 || d.visibility === 4);
    useEffect(()=>{
        let  d = resultSetDefinitionsData.map(row => {
            return {name:row.fieldDefinition.name, caption:row.fieldDefinition.caption, colWidth:row.columnWidth}
        })
        setTableHeader(d);
    },[resultSetDefinitionsData]);

    const handleSourceCellDataChange=(value, fieldName)=>{
        let reqObj = JSON.parse(JSON.stringify(currentTemplate));
        let index= reqObj.retrievalExpressions.detailSet.findIndex(data => data.target === fieldName);
        reqObj.retrievalExpressions.detailSet[index].source=value;
        dispatch(setCurrentTemplate(reqObj));
        dispatch(setCriteriaDefinitions(reqObj));
    }

    const handleOperatorCellDataChange=(value, fieldName)=>{
        let reqObj = JSON.parse(JSON.stringify(currentTemplate));
        let index= reqObj.retrievalExpressions.detailSet.findIndex(data => data.target === fieldName);
        reqObj.retrievalExpressions.detailSet[index].operator=value.id;
        reqObj.retrievalExpressions.detailSet[index].source='';
        dispatch(setCurrentTemplate(reqObj));
        dispatch(setCriteriaDefinitions(reqObj));
    }

    const handleSearchClick=(flag)=>{
        if(hasValid || flag){
            getSearchData('cases','0-24', currentTemplate )
        }else{
            dispatch(setResultSetData(null));
        }
    }

    const handleResetClick=()=>{
        dispatch(setCriteriaDefinitions(defaultTemplate));
        dispatch(setCurrentTemplate(defaultTemplate));
        dispatch(setResultSetData(null));
        setShowResetConfirmation(!showResetConfirmation);
        setResetValidationsData(true);
        setResetClick(!resetClick);
        setSelectedRows([]);
    }

    const handleSearchClick1=()=>{
        setSearchClick({isSearchBtnClick: true ,index:Math.floor(Math.random() * 10)});
        dispatch(setResultSetData(null));
        setSelectedRows([]);
    }

    const actionsOnTableRowClick=(d)=>{
        if(!Array.isArray(d)){
            setSelectedRows([d])
        }else{
            setSelectedRows(d)
        }
    }

    const getSearchResults= async (range,selectedColumn,sortDir,isSortApplied)=>{
        let validationData = criteriaDefinitionsData?.filter((d) => d.visibility === 3||  d.visibility === 4)
        if(validationData?.length<=0) {
            if (isSortApplied) {
                if (totalSearches > 100) {
                    setShowSortValidationPopup(!showSortValidationPopup);
                } else {
                    try {
                        let selectedSort = sortDir === SORT_DIRECTION.ASC ? '+' : '-';
                        await getSearchData('cases',`${range.startPage === 1 ? 0 : range.startPage}-${range.endPage}`, currentTemplate, selectedColumn, selectedSort);
                    } catch (error) {
                        setIsError(true);
                        console.log('Error', error)
                    }
                }
            } else {
                await getSearchData('cases',`${range.startPage ===  1 ? 0 : range.startPage}-${range.endPage}`, currentTemplate);
            }
        }
    }

    const handleInfoDialog=()=>{
        dispatch(setShowCaseSuccessPopup(false))
    }

    return criteriaDefinitionsData.length ?<ReflexContainer orientation="horizontal" >
        <ReflexElement flex={0.2} style={{maxHeight:'30px'}} >
            <div className={styles.header}>
                <div className={styles.headerContainerStyle}>
                    <h4 className={styles.headerIcon}>{headerWSIcon}</h4>
                    <h4 className={styles.headerContent}>{currentTemplate.name?t('toolseo.toolname.ipd.cases.tool.search')+' : '+currentTemplate.name:''}</h4>
                </div>
                <h4 className={styles.requiredText}>{t('REQ_INSTRUCTION')}</h4>
            </div>
        </ReflexElement>
        <ReflexElement flex={0.6} style={{overflow:'auto'}}>
            <SearchCriteriaTable
                tableId={'searchFilters'}
                headerIcon={headerWSIcon}
                headerTitle={currentTemplate.name?t('toolseo.toolname.tool7')+' : '+currentTemplate.name:''}
                tableData={criteriaDefinitionsData}
                handleSourceCellDataChange={handleSourceCellDataChange}
                handleOperatorCellDataChange={handleOperatorCellDataChange}
                resetValidationsData={resetValidationsData}
                setResetValidationsData={setResetValidationsData}
                getSearchResultData={handleSearchClick}
                searchClick={searchClick}
                resetClick={resetClick}
            />
            {showResetConfirmation && <ConfirmationDialog
                isCloseButtonShown={true}
                headerText={'Confirmation'}
                icon={<Icons icon={ICONS.QUESTION_MARK_ICON}/>}
                width={420}
                divideByX={3}
                divideByY={5.5}
                showDialog={showResetConfirmation}
                onClose={()=>setShowResetConfirmation(!showResetConfirmation)}
                noButtonText={t('ipd.cag.no')}
                onNoBtnClick={()=>setShowResetConfirmation(!showResetConfirmation)}
                yesButtonText={t('ipd.cag.yes')}
                onYesBtnClick={()=>handleResetClick()}
                body={<div style={{height:'130px'}}>
                    <div>{t('reset.confirmation.message')}</div>
                    <div style={{display:'flex'}}>
                        {t('reset.confirmation.click')} <div className={styles.resetTextStyle}>{t('ipd.cag.yes')}</div>{t('reset.confirmation.continue')}
                        <div className={styles.resetTextStyle}>{t('ipd.cag.no')}</div> {t('reset.confirmation.cancel')}
                    </div>
                </div>}
                isDismissOnEnterKey={true}
            />}
            { showSortValidationPopup && <ConfirmationDialog
                headerText={'Information'}
                width={600}
                divideByX={3.5}
                divideByY={5}
                icon={<Icons icon={ICONS.INFO}/>}
                showDialog={showSortValidationPopup}
                onClose={()=>setShowSortValidationPopup(false)}
                yesButtonText={t('btn.translationOk.ok')}
                onYesBtnClick={()=>setShowSortValidationPopup(false)}
                body={<div>{t('MAX_SORT_EXCEEDED',{recordLength:50})}</div>}
                isDismissOnEnterKey={true}
                isCloseButtonShown={true}
            />}
        </ReflexElement>
        <ReflexSplitter className="horizontal-splitter" >
            <div className="horizontal-splitter-thumb"/>
        </ReflexSplitter>
        <ReflexElement maxSize={window.screen.height-350} flex={0.4}>
            <Table
                loading={loading}
                tableId={'searchRes'}
                headerIcon={headerSRIcon}
                headerTitle={t('search.result')}
                actions={<HeaderActions minimal={true} actions={resultButtonActions} />}
                searchResultCol={tableHeader}
                tableData={resultSetData}
                tableName={t('search.result')}
                showPageFooter={true}
                isSortable={true}
                getSearchResults={getSearchResults}
                isError={isError}
                actionsOnTableRowClick={actionsOnTableRowClick}
                setTableColumnsWidth={setTableHeader}
                maxSortRowLength={50}
                isValidationPanelOpen={validations.length > 0}
                resetClick={resetClick}
                searchClick={searchClick}
            />
        </ReflexElement>
        <>
            {(caseReassignPopupLoading) &&
            <ConfirmationDialog
                showDialog={true}
                divideByX={3}
                divideByY={3.5}
                icon={<div className={styles.loadingGifStyle}/>}
                headerText={t('progress_popup_header')}
                body={<Label>{`${t('CASE_REASSIGN_BUSY_MSG')}`}</Label>}
                transitionDuration={300}
                isCloseButtonShown={false}/>
            }
            {(showCaseSuccessPopup)&&
            <ConfirmationDialog
                showDialog={true}
                width={606}
                height={125}
                divideByX={4}
                divideByY={3.5}
                icon={<Icons icon={ICONS.INFO}/>}
                headerText={'Information'}
                onClose={()=>handleInfoDialog()}
                body={<Label>{`${t('CASE_REASSIGN_SENT_MSG')}`}</Label>}
                noButtonText={t('btn.common.ok')}
                onNoBtnClick={()=>handleInfoDialog()}
                transitionDuration={300}
                isCloseButtonShown={true}/>
            }
            {(showReassignPopup) &&
            <ReassignUser
                showReassignPopup={showReassignPopup}
                setShowReassignPopup={setShowReassignPopup}
                selectedRows={selectedRows}
            />
            }
        </>
    </ReflexContainer> : noContext  ? <h4 style={{paddingLeft:'10px'}}>{t('ipd.nocontext.msg')}</h4>: null
}
export default CaseSearchComponent;