import {HeaderActions, Icons} from '../../../components'
import {
    ReflexContainer,
    ReflexElement
} from 'react-reflex'
import {ICONS} from "../../../utils/iconNames";
import {Table} from "../../../components/tables/Table";
import {useDispatch, useSelector} from "react-redux";
import {userBatchJobsSelector} from "../../../slices/selectors";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {onSortingColumn, setEnableSingleJobAction} from "../../../slices/envManagementSlice";
import {Button} from "@blueprintjs/core";
import styles from "../environmentManagement/environmentManagement.module.scss";

const ExportJobsComponent = ({isError, enabledButtonArray}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [tableColumnNames, setTableColumnNames] = useState([{
        name: 'jobName', caption: t('case.print.jobname.label'), colWidth: 200},
        {name: 'startDate', caption: t('col_header_startDate'), colWidth: 200},
        {name: 'status', caption: t('col_header_status'), colWidth: 150}]);
    const userBatchJobsData = useSelector((state) => userBatchJobsSelector(state));
    const loading = useSelector((state) => state.workSearch.loading);
    const headerAJIcon = <Icons icon={ICONS.ENV_ACTIVE_JOB}/>;
    const downloadIcon = <Icons icon={ICONS.ENV_DOWNLOAD_DARK}/>;

    const checkKey = (e,index) =>{
        if (e.keyCode == '37') {
            document.getElementById(index >0 && (index === 11 && !(enabledButtonArray.indexOf(t('toolseo.toolname.sysadmin.abort')) > -1) ? index - 2 : index - 1))?.focus();
        } else if (e.keyCode == '39') {
            document.getElementById((index === 9 && !(enabledButtonArray.indexOf(t('toolseo.toolname.sysadmin.abort')) > -1)) ? index + 2 : index + 1)?.focus();
        }
    };


    const onDownloadBtnClick = () => {
        // dispatch(setEnableSingleJobAction({name: 'download', jobId: selectedJobId, jobInstanceId: selectedInstanceJobId}));
        // const requestURL = `/UlteraAdmin/service/v83/admin/envmgt/download/${selectedJobId}`;
        // window.open(requestURL, "_blank")
    };

    const activeJobActions = [];
    activeJobActions.push(<Button tabIndex={0} id={8} icon={downloadIcon} title={t('label_download')} text={t('label_download')}
                                  onClick={onDownloadBtnClick} onKeyDown={(e)=>{
        checkKey(e,8)
    }}
                                  className={styles.buttonIcon}
                                  disabled={enabledButtonArray.length === 0 || !(enabledButtonArray.indexOf(t('label_download')) > -1)}/>);

    const actionsOnActiveTableRowClick = (data, i) => {

    };


    const onColumnSort = (sortBy, sortDirection) => {
        let orderBy = '';
        if (sortDirection === 'Asc') {
            orderBy = 'asc'
        } else {
            orderBy = 'desc'
        }
        dispatch(onSortingColumn({batchSortBy: sortBy, batchOrderBy: orderBy}))
    };

    return <>
        <ReflexContainer orientation="horizontal">
            <ReflexElement flex={1}>
                <Table
                    loading={loading}
                    tableId={'exportJobs'}
                    headerIcon={headerAJIcon}
                    headerTitle={t('admin.license.sidebar.exportjobs')}
                    actions={<HeaderActions minimal={true} actions={activeJobActions}/>}
                    searchResultCol={tableColumnNames}
                    tableData={userBatchJobsData}
                    colNames={tableColumnNames}
                    searchResult={userBatchJobsData}
                    isSortable={true}
                    isError={isError}
                    appType={'UlteraAdmin'}
                    defaultSortingFlag={true}
                    setTableColumnsWidth={setTableColumnNames}
                    actionsOnTableRowClick={actionsOnActiveTableRowClick}
                    onColumnSort={onColumnSort}
                />
            </ReflexElement>
        </ReflexContainer>
    </>
};

export default ExportJobsComponent;