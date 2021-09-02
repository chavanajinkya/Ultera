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
import {useEffect, useState} from "react";
import {onSortingColumn} from "../../../slices/envManagementSlice";
import {getUserBatchJobs} from "../../../api";

const UserBatchActiveJobs = ({isError}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [tableColumnNames, setTableColumnNames] = useState([{
        name: 'environment', caption: t('label.envNn.envName'), colWidth: 200},
        {name: 'user', caption: t('label.columnchooserUser.user'), colWidth: 200},
        {name: 'jobType', caption: t('sysmgr.fields.jobType.caption'), colWidth: 150},
        {name: 'jobStatus', caption: t('sysmgr.fields.jobStatus.caption'), colWidth: 150}]);
    const userBatchJobsData = useSelector((state) => userBatchJobsSelector(state));
    const loading = useSelector((state) => state.workSearch.loading);
    const headerAJIcon = <Icons icon={ICONS.MODULE_PREFERENCES}/>;


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
                    tableId={'userBatch'}
                    headerIcon={headerAJIcon}
                    headerTitle={" "}
                    actions={<HeaderActions minimal={true} actions={[]}/>}
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

export default UserBatchActiveJobs;