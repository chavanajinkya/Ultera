import {ConfirmationDialog, HeaderActions, Icons} from "../../../components";
import {AdminDateTime} from "../../../components/dateTime/adminDateTime"
import styles from "./logActiveJob.module.scss";
import React, {useEffect, useRef, useState} from "react";
import {ICONS} from "../../../utils/iconNames";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {Table} from "../../../components/tables/Table";
import {exportLogData, getLogErrorStack, logCurrentActiveJob} from "../../../api";
import {onSortingLogColumn, setEnableSingleJobAction} from "../../../slices/envManagementSlice";
import {Button, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/select";
import {ReflexContainer, ReflexElement, ReflexSplitter} from "react-reflex";
import {ActiveLogsListSelector} from "../../../slices/selectors";
import {Popover2} from "@blueprintjs/popover2";
import {AutoSelect} from "../../../components/autoSelect";
import _ from "lodash";
import {H5} from "@blueprintjs/core/lib/cjs/components/html/html";
import moment from "moment";
import i18n from '../../../i18n';
import * as Classes from "@blueprintjs/popover2/lib/cjs/classes";
import FileDownload from "js-file-download";

export const LogActiveJobComponent = ({setEnabledButtonArray}) => {
    const {t} = useTranslation();
    const popoverRef  = useRef(null);
    const dispatch = useDispatch();
    const [showDetailsView, setShowDetailsView] = useState(false);
    const [detailsViewMessage, setDetailsViewMessage] = useState('');
    const [logStatuses, setLogStatuses] = useState([
        {id: 1, name: t('com.ipd.admin.logviewer.menubutton.menu.error')},
        {id: 2, name: t('com.ipd.admin.logviewer.menubutton.menu.warning')},
        {id: 3, name: t('com.ipd.admin.logviewer.menubutton.menu.info')},
        {id: 4, name: t('com.ipd.admin.logviewer.menubutton.menu.debug')},
    ]);
    const [layoutList, setLayoutList] = useState([
        {id: 1, name: t('com.ipd.admin.logviewer.export.layout.html')},
        {id: 2, name: t('com.ipd.admin.logviewer.export.layout.standard')},
    ]);
    const [selectedLogStatus, setSelectedLogStatus] = useState({
        id: 3, name: `${t('com.ipd.admin.logviewer.export.level.label')}:`
    });
    const {loading, logSortBy, logOrderBy} = useSelector((state) => state.envManagement);
    const activeLogsList = useSelector((state) => ActiveLogsListSelector(state));
    const {enableSingleJobAction, selectedTableRow} = useSelector((state) => state.envManagement);
    const {enableConfigLogView, selectedConfigTableRow} = useSelector((state) => state.envConfig);
    const [tableColumnNames, setTableColumnNames] = useState([{
        name: 'logDate', caption: t('label.hold.time'), colWidth: 200
    },
        {name: 'level', caption: t('com.ipd.admin.logviewer.export.level.label'), colWidth: 200},
        {name: 'message', caption: t('MSG_COL_LABEL'), colWidth: 462}]);
    const [exportLevelStatusError, setExportLevelStatusError] = useState('');
    const [exportLevelId, setExportLevelId] = useState(3);
    const [layoutError, setLayoutError] = useState('');
    const [layoutId, setLayoutId] = useState(2);
    const [selectedStartDateTime, setSelectedStartDateTime] = useState('');
    const [selectedEndDateTime, setSelectedEndDateTime] = useState(moment(new Date()).format('YYYY-MM-DDTHH:mm:ss'));
    const [enableStartDateErrorText, setEnableStartDateErrorText] = useState('');
    const [enableEndDateErrorText, setEnableEndDateErrorText] = useState('');
    const [copiedButtonDisabled, setCopiedButtonDisabled] = useState(true);
    const [detailViewToFullHeight, setDetailViewToFullHeight] = useState(false);
    const [showZeroItemsInPage, setShowZeroItemsInPage] = useState(false);
    const [initialLogStatusChangeFlag, setInitialLogStatusChangeFlag] = useState(false);
    const templateButtonActions = [];
    templateButtonActions.push(<Button
        icon={showDetailsView ? <Icons icon={ICONS.ROUNDED_UP}/> : <Icons icon={ICONS.ROUNDED_DOWN}/>}
        style={{boxShadow: "none"}} onClick={() => {setShowDetailsView(!showDetailsView); setDetailViewToFullHeight(false)}}/>);


    useEffect(async () => {
        const response = await logCurrentActiveJob('0-24', enableSingleJobAction.jobInstanceId);
        if(response.status === 200){
            if(response.data?.length === 0){
                setShowZeroItemsInPage(true)
            }else{
                setShowZeroItemsInPage(false)
            }
        }
    }, []);

    const getPaginatedLogs = async (range, sortBy = '', sortByDirection = '') =>{
        let logName = selectedLogStatus.name;
        if(i18n.language?.includes('fr')){
            if(selectedLogStatus.name === t('com.ipd.admin.logviewer.menubutton.menu.error')){
                logName = 'ERROR';
            }else if(selectedLogStatus.name === t('com.ipd.admin.logviewer.menubutton.menu.warning')){
                logName = 'WARN';
            }else if(selectedLogStatus.name === t('com.ipd.admin.logviewer.menubutton.menu.info')){
                logName = 'INFO'
            }else{
                logName = "DEBUG"
            }
        }
        if(selectedLogStatus.name === `${t('com.ipd.admin.logviewer.export.level.label')}:`){
            logName = ""
        }
        dispatch(onSortingLogColumn({logSortBy:sortBy, logOrderBy:sortByDirection}));
        const response = await logCurrentActiveJob(`${range?.startPage ===  1 ? 0 : range?.startPage}-${range?.endPage === 0 ? 24 : range?.endPage}`, enableSingleJobAction.jobInstanceId, logName, sortBy && sortBy,
            sortByDirection && sortByDirection);
        if(response.status === 200){
            if(response.data?.length === 0){
                setShowZeroItemsInPage(true)
            }else{
                setShowZeroItemsInPage(false)
            }
        }
    };

    const handleOkClick = async () => {
        onClose();
    };
    const onClose = () => {
        dispatch(setEnableSingleJobAction({
            name: '',
            jobId: enableSingleJobAction.jobId,
            jobInstanceId: enableSingleJobAction.jobInstanceId
        }))
    };

    const actionsOnActiveTableRowClick = async (data) => {
        const response = await getLogErrorStack(data.id);
        setDetailsViewMessage(response?.data?.response?.logErrorStack);
        if(!Array.isArray(data) || (Array.isArray(data) && data.length > 0)){
            setCopiedButtonDisabled(false)
        }else if(Array.isArray(data) && data.length === 0){
            setCopiedButtonDisabled(true)
        }
    };

    const handleLogStatusChange = async (item) => {
        let logName = item.name;
        if(i18n.language?.includes('fr')){
            if(item.name === t('com.ipd.admin.logviewer.menubutton.menu.error')){
                logName = 'ERROR';
            }else if(item.name === t('com.ipd.admin.logviewer.menubutton.menu.warning')){
                logName = 'WARN';
            }else if(item.name === t('com.ipd.admin.logviewer.menubutton.menu.info')){
                logName = 'INFO'
            }else{
                logName = "DEBUG"
            }
        }
        setSelectedLogStatus(item);
        const response = await logCurrentActiveJob(`0-24`, enableSingleJobAction.jobInstanceId, logName, logSortBy, logOrderBy);
        if(response.status === 200){
            if(response.data?.length === 0){
                setShowZeroItemsInPage(true)
            }else{
                setShowZeroItemsInPage(false)
            }
        }
        setInitialLogStatusChangeFlag(true);
        setCopiedButtonDisabled(true);
        setDetailsViewMessage('')
    };
    const onExportClick = () => {
    };

    const onExportLevelStatusSelected = (data) => {
        setExportLevelId(data.id);
        setExportLevelStatusError('')
    };
    const onLayoutSelected = (data) => {
        setLayoutId(data.id);
        setLayoutError('')
    };
    const handleStartDateTimeChange = (d) => {
        setSelectedStartDateTime(d);
        const startDate = moment(d,'YYYY-MM-DDTHH:mm:ss');
        const maxEndDate = moment();
        const pastTwoMonthDate = moment().subtract(2, 'months');
        const getValue = startDate.isBetween(pastTwoMonthDate, maxEndDate);
        if(getValue) {
            setEnableStartDateErrorText('');
        }else{
            setEnableStartDateErrorText(i18n?.language.includes('fr')?
                t('admin_log_export_date_error', {labelText: "Date de début", min: moment(pastTwoMonthDate).format('DD/MM/YY HH:mm'), max: moment().format('DD/MM/YY HH:mm')})
                :
                `${t('col_header_startDate')}${t('admin_log_export_error')} ${moment(pastTwoMonthDate).format('MM/DD/YYYY hh:mm A')} and ${moment().format('MM/DD/YYYY hh:mm A')}`)
        }
    };

    const handleEndDateTimeChange = (d) => {
        setSelectedEndDateTime(d);
        const endDate = moment(d,'YYYY-MM-DDTHH:mm:ss');
        const maxEndDate = moment();
        const startDate = moment().subtract(2, 'months');
        const getValue = endDate.isBetween(startDate, maxEndDate);
        if(getValue) {
            setEnableEndDateErrorText('');
        }else{
            setEnableEndDateErrorText(i18n?.language.includes('fr') ?
                t('admin_log_export_date_error', {labelText: "End Date", min: moment(startDate).format('DD/MM/YY HH:mm'), max: moment().format('DD/MM/YY HH:mm')}) :
                `End Date ${t('admin_log_export_error')} ${moment(startDate).format('MM/DD/YYYY hh:mm A')} and ${moment().format('MM/DD/YYYY hh:mm A')}`)
        }
    };

    const onStartDateTextChange = (e) =>{
        if(e === ''){
            setEnableStartDateErrorText(`${t('col_header_startDate')} ${t('admin_envConfig_filter_is')} ${t('label.common.required').toLowerCase()}`)
        }
    };
    const onEndDateTextChange = (e) =>{
        if(e === '') {
            setEnableEndDateErrorText(`End Date ${t('admin_envConfig_filter_is')} ${t('label.common.required').toLowerCase()}`)
        }
    };

    const onSubmitClick = async () => {
        if (selectedStartDateTime && selectedEndDateTime && enableStartDateErrorText== '' && enableEndDateErrorText == '') {
            const response = await exportLogData(enableSingleJobAction.jobInstanceId, new Date(selectedStartDateTime)?.toISOString(), new Date(selectedEndDateTime)?.toISOString(),
                selectedObject.name, selectedLayoutObj.name);
            let filenameText = response.headers?.[`content-disposition`];
            filenameText = filenameText.split("=");
            FileDownload(response?.data, filenameText[1]);
        } else {
            if (!selectedStartDateTime && !selectedEndDateTime) {
                setEnableStartDateErrorText(`${t('col_header_startDate')} ${t('admin_envConfig_filter_is')} ${t('label.common.required').toLowerCase()}`);
                setEnableEndDateErrorText(`End Date ${t('admin_envConfig_filter_is')} ${t('label.common.required').toLowerCase()}`);
            } else if (!selectedStartDateTime) {
                setEnableStartDateErrorText(`${t('col_header_startDate')} ${t('admin_envConfig_filter_is')} ${t('label.common.required').toLowerCase()}`);
            } else if(!selectedEndDateTime){
                setEnableEndDateErrorText(`End Date ${t('admin_envConfig_filter_is')} ${t('label.common.required').toLowerCase()}`)
            }
        }
    };

    let selectedObject = null;
    if (exportLevelId) {
        const objValue = _.filter(logStatuses, (item) => {
            return item.id === exportLevelId
        });
        if (objValue.length > 0) {
            selectedObject = objValue[0]
        }
    }
    if (exportLevelStatusError) {
        selectedObject = null
    }

    let selectedLayoutObj = null;
    if (layoutId) {
        const objValue = _.filter(layoutList, (item) => {
            return item.id === layoutId
        });
        if (objValue.length > 0) {
            selectedLayoutObj = objValue[0]
        }
    }
    if (layoutError) {
        selectedLayoutObj = null
    }

    const getExportContents = () => {
        return <div>
            <div className={styles.optionStyle}>
                <div className={styles.optionsText}>{t('com.ipd.admin.logviewer.export.options.label')}</div>
                <div className={styles.parentOptions}>
                    <div className={styles.displayInLineStyle}>
                        <div className={styles.autoSelectDiv}>
                            <H5 className={styles.boldTextOptionStyle}>{t('com.ipd.admin.logviewer.export.level.label')}</H5>
                            <div className={styles.parentAutoSelect}>
                            <AutoSelect
                                usePortal={false}
                                loadData={null}
                                loading={false}
                                popoverWidth={172}
                                editable={false}
                                dataList={logStatuses}
                                errorText={exportLevelStatusError}
                                onItemSelected={onExportLevelStatusSelected}
                                selectedValue={selectedObject}
                                tooltipPosition={'right'} setErrorText={setExportLevelStatusError}
                                unValidText={t('validation_text_invalid_required')}/>
                            </div>
                        </div>
                        <div className={styles.autoSelectDiv}>
                            <H5 className={styles.boldTextOptionStyle}>{t('com.ipd.admin.logviewer.export.layout.label')}</H5>
                            <div className={styles.parentAutoSelect}>
                            <AutoSelect
                                usePortal={false}
                                loadData={null}
                                loading={false}
                                popoverWidth={172}
                                editable={false}
                                errorText={layoutError}
                                dataList={layoutList}
                                onItemSelected={onLayoutSelected}
                                selectedValue={selectedLayoutObj}
                                tooltipPosition={'left'} setErrorText={setLayoutError}
                                unValidText={t('admin_export_env_name_error_text')}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.RangeStyle}>
                <div className={styles.rangeText}>Date Range</div>
                <div className={styles.displayInLineStyle} style={{marginTop: 20}}>
                    <div className={styles.autoSelectRelativeDiv}>
                        <div className={styles.requiredStarText}>*</div>
                        <H5 className={styles.boldTextStartStyle}>{t('col_header_startDate')}</H5>
                        <AdminDateTime
                            fieldName={t('col_header_startDate')}
                            isDateTimePicker={true}
                            popoverWidth={193}
                            needTimeInSec={false}
                            usePortal={false}
                            selectedValue={selectedStartDateTime}
                            errorText={enableStartDateErrorText}
                            onItemSelected={(d) => handleStartDateTimeChange(d)}
                            onPlaceholderTextChange = {onStartDateTextChange}
                        />
                    </div>
                    <div className={styles.autoSelectRelativeDiv}>
                        <div className={styles.requiredStarText}>*</div>
                        <H5 className={styles.boldTextStyle}>End Date</H5>
                        <AdminDateTime
                            fieldName={"End Date"}
                            isDateTimePicker={true}
                            popoverWidth={193}
                            needTimeInSec={false}
                            usePortal={false}
                            errorText={enableEndDateErrorText}
                            selectedValue={selectedEndDateTime}
                            defaultQuery={true}
                            onItemSelected={(d) => handleEndDateTimeChange(d)}
                            onPlaceholderTextChange = {onEndDateTextChange}
                        />
                    </div>
                </div>
                <div className={styles.errorStyle}>{enableStartDateErrorText && enableEndDateErrorText ?`${enableStartDateErrorText}. ${enableEndDateErrorText}` :
                    `${enableStartDateErrorText} ${enableEndDateErrorText}`}</div>
            </div>
            <div className={styles.submitStyle}>
                <Button className={!selectedStartDateTime || !selectedEndDateTime || enableEndDateErrorText || enableStartDateErrorText ? styles.buttonSubmitStyle : Classes.POPOVER2_DISMISS}
                        onClick={onSubmitClick}>
                    Submit
                </Button>
            </div>
        </div>
    };
    const openOnResizeStart = () => {
        setDetailViewToFullHeight(true)
    };
    let parentHeight = window.screen.height > 1000 ? window.screen.height - 400 : window.screen.height - 300;
    let firstReflex = parentHeight - 55;

    return (
        <>
            {enableSingleJobAction.name === 'log' &&
            <ConfirmationDialog
                width={900}
                divideByY={18}
                divideByX={2}
                showDialog={true}
                headerText={`Ultera: ${t('com.ipd.admin.logviewer.pageTitle')}`}
                onClose={onClose}
                body={
                    <div className={styles.parentDiv}>
                        <div className={styles.subHeader}>
                            <div className={styles.headerLabelBox}>
                                <Icons icon={ICONS.ENV_LOG}/>
                                <div className={styles.headerText}>{t('com.ipd.admin.logviewer.pageTitle')}</div>
                            </div>
                        </div>
                        <div className={styles.contentDiv}>
                            <div className={styles.subHeader}>
                                <div className={styles.headerLabelBox}>
                                    <Icons icon={ICONS.GRID_SHOW}/>
                                    <div className={styles.headerText}>
                                        { !enableConfigLogView  ?
                                            `${selectedTableRow.jobName}: ${selectedTableRow.envName}`
                                            :
                                            `${selectedConfigTableRow.name}: ${selectedConfigTableRow.environment}`
                                        }</div>
                                </div>
                                <div>
                                    <Select
                                        items={logStatuses}
                                        itemRenderer={(item, {modifiers, handleClick}) => (
                                            <MenuItem
                                                style={{
                                                    height: '20px',
                                                    width: "84px",
                                                    border: "1px solid transparent",
                                                    minHeight: '24px',
                                                }}
                                                className={modifiers.active ? styles.activeOption : styles.selectOption}
                                                active={modifiers.active}
                                                onClick={handleClick}
                                                text={item.name}
                                                key={item.name}
                                            />
                                        )}
                                        filterable={false}
                                        itemsEqual={'id'}
                                        onItemSelect={handleLogStatusChange}
                                        popoverProps={{minimal: true}}
                                    >
                                        <Button icon={<Icons icon={ICONS.GRID_SETTING}/>}
                                                rightIcon="caret-down"
                                                text={selectedLogStatus.name}
                                                className={styles.buttonStyle}/>
                                    </Select>
                                    <Button icon={<Icons icon={ICONS.DUPLICATE}/>}
                                            disabled={copiedButtonDisabled ? true : false}
                                            text={t('ipd.widgets.button.copy.label')}
                                            className={styles.buttonStyle}/>
                                    <Popover2
                                        popoverClassName={styles.popoverStyle}
                                        interactionKind={'click'}
                                        ref={popoverRef}
                                        modifiers = {
                                            {
                                                preventOverflow: { enabled: false},
                                                flip: { enabled: false} }
                                        }
                                        usePortal={false}
                                        position={"bottom-right"}
                                        content={getExportContents()}
                                    >

                                        <Button icon={<Icons icon={ICONS.ENV_DOWNLOAD_DARK}/>}
                                                rightIcon="caret-down"
                                                text={t('toolseo.toolname.admin.export')}
                                                className={styles.buttonStyle} onClick={onExportClick}/>
                                    </Popover2>
                                </div>
                            </div>
                            <ReflexContainer orientation="horizontal" style={{height: parentHeight}}>
                                <ReflexElement size={!showDetailsView ?  firstReflex : firstReflex - 200}>
                                    <div className={styles.subContentDiv}>
                                        <div className={styles.midContentBox}>
                                            <Table
                                                loading={loading}
                                                tableId={'log'}
                                                actions={<HeaderActions minimal={true} actions={[]}/>}
                                                searchResultCol={tableColumnNames}
                                                tableData={activeLogsList}
                                                colNames={tableColumnNames}
                                                searchResult={activeLogsList}
                                                isSortable={true}
                                                showPageFooter={true}
                                                defaultSortingFlag={true}
                                                setTableColumnsWidth={setTableColumnNames}
                                                actionsOnTableRowClick={actionsOnActiveTableRowClick}
                                                showZeroItemsInPage={showZeroItemsInPage}
                                                getPaginatedLogs={getPaginatedLogs}
                                                initialLogStatusChangeFlag={initialLogStatusChangeFlag}
                                                setInitialLogStatusChangeFlag={setInitialLogStatusChangeFlag}
                                                setDetailsViewMessage={setDetailsViewMessage}
                                                setCopiedButtonDisabled={setCopiedButtonDisabled}
                                            />
                                        </div>
                                    </div>
                                </ReflexElement>
                                <ReflexSplitter className="horizontal-splitter" onStartResize={openOnResizeStart}>
                                    <div className="horizontal-splitter-thumb"/>
                                </ReflexSplitter>
                                <ReflexElement size={!showDetailsView && 51} style={{overflow:"unset"}}>
                                    <div style={{minHeight: !showDetailsView && 51, height: (showDetailsView || detailViewToFullHeight) && "100%"}}
                                         className={styles.secondReflexDiv}>
                                        <div className={styles.subHeader} style={{ height: 40}}>
                                            <div className={styles.headerLabelBox}>
                                                <div
                                                    className={styles.headerText}>{t('admin.envmgt.promote.stats.detailsButtonLabel')}</div>
                                            </div>
                                            <HeaderActions minimal={true} actions={templateButtonActions}/>
                                        </div>
                                        <div className={styles.detailsContent} style={{height: (showDetailsView || detailViewToFullHeight) && "100%"}}>
                                            <label className={styles.detailsStyle}>{detailsViewMessage}</label>
                                        </div>
                                    </div>
                                </ReflexElement>
                            </ReflexContainer>
                        </div>
                    </div>
                }
                transitionDuration={300}
                isCloseButtonShown={true}
                yesButtonText={t('btn.common.ok')}
                onYesBtnClick={handleOkClick}
            />
            }
        </>
    );
};
