import {Button} from "@blueprintjs/core";
import {HeaderActions, Icons} from '../../../components'
import {
    ReflexContainer,
    ReflexElement
} from 'react-reflex'
import {ICONS} from "../../../utils/iconNames";
import styles from "./environmentManagement.module.scss";
import {Table} from "../../../components/tables/Table";
import {useDispatch, useSelector} from "react-redux";
import {useLocation} from "react-router";
import {ActiveJobsSelector, JobsHistorySelector} from "../../../slices/selectors";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import _ from "lodash";
import {onSortingColumn, setEnableSingleJobAction, setSelectedTableRow} from "../../../slices/envManagementSlice";
import {proceedActiveJobContent} from "../../../api";


const EnvironmentMgtComponent = ({isError, setEnabledButtonArray, enabledButtonArray}) => {
    const location = useLocation();
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [selectedJobId, setSelectedJobId] = useState(0);
    const [selectedInstanceJobId, setSelectedInstanceJobId] = useState(0);
    const [tableColumnNames, setTableColumnNames] = useState([{
        name: 'jobName',
        caption: t('case.print.jobname.label'),
        colWidth: 200
    },
        {name: 'envName', caption: t('toolseo.toolname.tool1'), colWidth: 200},
        {name: 'startDate', caption: t('col_header_startDate'), colWidth: 150},
        {name: 'status', caption: t('col_header_status'), colWidth: 150}]);
    const activeJobsData = useSelector((state) => ActiveJobsSelector(state));
    const updatedJobsSelector = useSelector(state => JobsHistorySelector(state));
    const loading = useSelector((state) => state.workSearch.loading);
    const headerAJIcon = <Icons icon={ICONS.ENV_ACTIVE_JOB}/>;
    const downloadIcon = <Icons icon={ICONS.ENV_DOWNLOAD_DARK}/>;
    const logIcon = <Icons icon={ICONS.ENV_LOG}/>;
    const proceedIcon = <Icons icon={ICONS.ENV_PROCEED}/>;
    const AbortIcon = <Icons icon={ICONS.ENV_ABORT}/>;

    const checkKey = (e,index) =>{
        if (e.keyCode == '37') {
            document.getElementById(index >0 && (index === 11 && !(enabledButtonArray.indexOf(t('toolseo.toolname.sysadmin.abort')) > -1) ? index - 2 : index - 1))?.focus();
        } else if (e.keyCode == '39') {
            document.getElementById((index === 9 && !(enabledButtonArray.indexOf(t('toolseo.toolname.sysadmin.abort')) > -1)) ? index + 2 : index + 1)?.focus();
        }
    };

    const actionsOnActiveTableRowClick = (data, i) => {
        if (!Array.isArray(data)) {
            if (data.jobName == t('com.ipd.service.envmgt.batch.jobName.export') && data.status.toLowerCase() === t('com.ipd.common.enums.batch.ExitStatusEnum.finished').toLowerCase()) {
                const tempArray = [];
                tempArray.push(t('label_download'));
                tempArray.push(t('toolseo.toolname.sysadmin.proceed'));
                tempArray.push(t('toolseo.toolname.sysadmin.log'));
                setEnabledButtonArray(tempArray);
                setSelectedJobId(data.jobId);
                setSelectedInstanceJobId(data.jobInstanceId);
            } else if ((data.jobName == t('com.ipd.service.envmgt.batch.jobName.export') || data.jobName == t('com.ipd.service.envmgt.batch.jobName.promote') ||
                data.jobName == t('com.ipd.service.envmgt.batch.jobName.import') || data.jobName == t('com.ipd.service.envmgt.batch.jobName.create') ||
                data.jobName == t('com.ipd.service.envmgt.batch.jobName.delete'))
                && (data.status.toLowerCase() === t('com.ipd.common.enums.batch.ExitStatusEnum.failed').toLowerCase() ||
                    data.status.toLowerCase() === t('com.ipd.common.enums.batch.ExitStatusEnum.validationError').toLowerCase() ||
                    data.status.toLowerCase() === t('com.ipd.common.enums.batch.ExitStatusEnum.confirm').toLowerCase())) {
                const tempArray = [];
                tempArray.push(t('toolseo.toolname.sysadmin.proceed'));
                tempArray.push(t('toolseo.toolname.sysadmin.abort'));
                tempArray.push(t('toolseo.toolname.sysadmin.log'));
                setEnabledButtonArray(tempArray);
                setSelectedJobId(data.jobId);
                setSelectedInstanceJobId(data.jobInstanceId);
            } else {
                const tempArray = [];
                tempArray.push(t('toolseo.toolname.sysadmin.proceed'));
                tempArray.push(t('toolseo.toolname.sysadmin.log'));
                setEnabledButtonArray(tempArray);
                setSelectedJobId(data.jobId)
                setSelectedInstanceJobId(data.jobInstanceId);
            }
        } else {
            setSelectedJobId(data.jobId);
            setSelectedInstanceJobId(data.jobInstanceId);
            setEnabledButtonArray([])
        }
        dispatch(setSelectedTableRow(data))
    };

    const actionsOnHistoryTableRowClick = (data) => {
        if (!Array.isArray(data)) {
            if ((data.jobName == t('com.ipd.service.envmgt.batch.jobName.export') ||
                data.jobName == t('com.ipd.service.envmgt.batch.jobName.promote')) && data.status.toLowerCase() === t('com.ipd.common.enums.batch.ExitStatusEnum.completed').toLowerCase()) {
                const tempArray = [];
                tempArray.push(t('label_download'));
                tempArray.push(t('toolseo.toolname.sysadmin.log'));
                setEnabledButtonArray(tempArray);
            } else {
                const tempArray = [];
                tempArray.push(t('toolseo.toolname.sysadmin.log'));
                setEnabledButtonArray(tempArray);
            }
        } else {
            setEnabledButtonArray([])
        }
        setSelectedJobId(data.jobId);
        setSelectedInstanceJobId(data.jobInstanceId);
        dispatch(setSelectedTableRow(data))
    };

    const onColumnSort = (sortBy, sortDirection) => {
        let orderBy = '';
        if (sortDirection === 'Asc') {
            orderBy = 'asc'
        } else {
            orderBy = 'desc'
        }
        dispatch(onSortingColumn({sortBy, orderBy}))
    };
    const onDownloadBtnClick = () => {
        dispatch(setEnableSingleJobAction({name: 'download', jobId: selectedJobId, jobInstanceId: selectedInstanceJobId}));
        const requestURL = `/UlteraAdmin/service/v83/admin/envmgt/download/${selectedJobId}`;
        window.open(requestURL, "_blank")
    };
    const onProceedBtnClick = async () => {
        dispatch(setEnableSingleJobAction({name: 'proceed', jobId: selectedJobId, jobInstanceId: selectedInstanceJobId}))
        const response = await proceedActiveJobContent(selectedJobId);
    };
    const onAbortBtnClick = () => {
        dispatch(setEnableSingleJobAction({name: 'abort', jobId: selectedJobId, jobInstanceId: selectedInstanceJobId}))
    };
    const onLogBtnClick = () => {
        dispatch(setEnableSingleJobAction({name: 'log', jobId: selectedJobId, jobInstanceId: selectedInstanceJobId}))
    };

    const activeJobActions = [];
    activeJobActions.push(<Button tabIndex={0} id={8} icon={downloadIcon} title={t('label_download')} text={t('label_download')}
                                  onClick={onDownloadBtnClick} onKeyDown={(e)=>{
                                        checkKey(e,8)
                                  }}
                                  className={styles.buttonIcon}
                                  disabled={enabledButtonArray.length === 0 || !(enabledButtonArray.indexOf(t('label_download')) > -1)}/>);
    activeJobActions.push(<Button tabIndex={0} id={9} icon={proceedIcon} title={t('toolseo.tooltip.sysadmin.proceed')}
                                  text={t('toolseo.toolname.sysadmin.proceed')} className={styles.buttonIcon}
                                  onClick={onProceedBtnClick} onKeyDown={(e)=>{
                                                        checkKey(e, 9)
                                                    }}
                                  disabled={enabledButtonArray.length === 0 || !(enabledButtonArray.indexOf(t('toolseo.toolname.sysadmin.proceed')) > -1)}/>);
    activeJobActions.push(<Button tabIndex={0} id={10} icon={AbortIcon} title={t('toolseo.tooltip.sysadmin.abort')}
                                  text={t('toolseo.toolname.sysadmin.abort')} className={styles.buttonIcon}
                                  onClick={onAbortBtnClick} onKeyDown={(e)=>{checkKey(e, 10)}}
                                  disabled={enabledButtonArray.length === 0 || !(enabledButtonArray.indexOf(t('toolseo.toolname.sysadmin.abort')) > -1)}/>);
    activeJobActions.push(<Button tabIndex={0} id={11} icon={logIcon} title={t('toolseo.tooltip.sysadmin.log')}
                                  text={t('toolseo.toolname.sysadmin.log')} className={styles.buttonIcon}
                                  onClick={onLogBtnClick} onKeyDown={(e)=>{checkKey(e, 11)}}
                                  disabled={enabledButtonArray.length === 0 || !(enabledButtonArray.indexOf(t('toolseo.toolname.sysadmin.log')) > -1)}/>);

    const jobHistoryActions = [];
    jobHistoryActions.push(<Button id={12} icon={downloadIcon} title={t('label_download')} text={t('label_download')}
                                   className={styles.buttonIcon}  onClick={onDownloadBtnClick}
                                   onKeyDown={(e)=>{checkKey(e, 12)}}
                                   disabled={enabledButtonArray.length === 0 || !(enabledButtonArray.indexOf(t('label_download')) > -1)}/>);
    jobHistoryActions.push(<Button id={13} icon={logIcon} title={t('toolseo.tooltip.sysadmin.log')} onClick={onLogBtnClick}
                                   text={t('toolseo.toolname.sysadmin.log')} className={styles.buttonIcon}
                                   onKeyDown={(e)=>{checkKey(e, 13)}}
                                   disabled={enabledButtonArray.length === 0 || !(enabledButtonArray.indexOf(t('toolseo.toolname.sysadmin.log')) > -1)}/>);

    return <>
        <ReflexContainer orientation="horizontal">
            <ReflexElement flex={1}>
                {
                    location.pathname === '/' ?
                        <Table
                            loading={loading}
                            tableId={'activeJobs'}
                            headerIcon={headerAJIcon}
                            headerTitle={t('admin.envmgt.sidebar.activejobs')}
                            actions={<HeaderActions minimal={true} actions={activeJobActions}/>}
                            searchResultCol={tableColumnNames}
                            tableData={activeJobsData}
                            colNames={tableColumnNames}
                            searchResult={activeJobsData}
                            isSortable={true}
                            isError={isError}
                            appType={'UlteraAdmin'}
                            defaultSortingFlag={true}
                            setTableColumnsWidth={setTableColumnNames}
                            actionsOnTableRowClick={actionsOnActiveTableRowClick}
                            onColumnSort={onColumnSort}
                            setEnabledButtonArray={setEnabledButtonArray}
                        /> :
                        location.pathname === '/jobHistory' &&
                        <Table
                            loading={loading}
                            tableId={'jobHistory'}
                            headerIcon={headerAJIcon}
                            defaultSortingFlag={true}
                            headerTitle={t('admin.envmgt.sidebar.historyjobs')}
                            actions={<HeaderActions minimal={true} actions={jobHistoryActions}/>}
                            searchResultCol={tableColumnNames}
                            colNames={tableColumnNames}
                            tableData={updatedJobsSelector}
                            searchResult={updatedJobsSelector}
                            isSortable={true}
                            isError={isError}
                            appType={'UlteraAdmin'}
                            setTableColumnsWidth={setTableColumnNames}
                            actionsOnTableRowClick={actionsOnHistoryTableRowClick}
                            onColumnSort={onColumnSort}
                            setEnabledButtonArray={setEnabledButtonArray}
                        />
                }
            </ReflexElement>
        </ReflexContainer>
    </>
};

export default EnvironmentMgtComponent;