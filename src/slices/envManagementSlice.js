import { createSlice } from "@reduxjs/toolkit";

export const envManagementSlice = createSlice({
    name: "envManagement",
    initialState: {
        jobsHistoryData: [],
        activeJobsData: [],
        sortBy: 'startDate',
        orderBy: 'desc',
        logSortBy: '',
        logOrderBy: '',
        importDocId: '',
        enableSingleJobAction: {name: '', jobId: 0, jobInstanceId: 0},
        selectedTableRow: {},
        activeLogsList: [],
        loading: false,
        proceedJobContent:{},
        importEntityData: [],
        promoteStatsDetailsData:{},
        selectedEntity: [],
        proceedNCMappings:[],
        objectStores: [],
        selectedTargetOptions: [],
        selectedTargetRealmArr: [],
        proceedLoading:false,
        userBatchActiveJobList: [],
        batchSortBy:'',
        batchOrderBy: 'desc',
        licenseStatus: {}

},
    reducers: {
        updateActiveJobs:(state,data)=>{
        state.activeJobsData= data.payload
        },
        updateJobHistory:(state,data)=>{
            state.jobsHistoryData= data.payload
        },
        onSortingColumn:(state,data)=>{
            state.sortBy= data.payload.sortBy;
            state.orderBy= data.payload.orderBy
        },
        onSortingLogColumn:(state,data)=>{
            state.logSortBy= data.payload.logSortBy;
            state.logOrderBy= data.payload.logOrderBy
        },
        setImportDocId:(state,data)=>{
            state.importDocId= data.payload;
        },
        setEnableSingleJobAction:(state,data)=>{
            state.enableSingleJobAction= {name:data.payload.name, jobId:data.payload.jobId, jobInstanceId: data.payload.jobInstanceId }
        },
        setSelectedTableRow:(state,data)=>{
            state.selectedTableRow= data.payload
        },
        updateLogsList:(state,data)=>{
            state.activeLogsList= data.payload
        },
        setPopupLoading:(state,data)=>{
            state.loading= data.payload
        },
        updateProceedJobContent:(state,data)=>{
            state.proceedJobContent= data.payload
        },
        updateImportEntity:(state,data)=>{
            state.importEntityData= data.payload
        },
        updatePromoteStatsDetails:(state,data)=>{
            state.promoteStatsDetailsData= data.payload
        },
        setSelectedEntity:(state,data)=>{
            state.selectedEntity= data.payload
        },
        updateProceedNCMappings:(state,data)=>{
            state.proceedNCMappings= data.payload
        },
        updateObjectStores:(state,data)=>{
            state.objectStores= data.payload
        },
        updateTargetRealmsArr:(state,data)=>{
            state.selectedTargetRealmArr= data.payload
        },
        updateTargetsArr:(state,data)=>{
            state.selectedTargetOptions= data.payload
        },
        setProceedDoSaveLoading:(state,data)=>{
            state.proceedLoading= data.payload
        },
        updateUserBatchActiveJobs:(state,data)=>{
            state.userBatchActiveJobList= data.payload
        },
        onSortingBatchColumn:(state,data)=>{
            state.batchSortBy= data.payload.batchSortBy;
            state.batchOrderBy= data.payload.batchOrderBy
        },
        updateLicenseDetails:(state,data)=>{
            state.licenseStatus= data.payload
        },
    },
});

// Action creators are generated for each case reducer function
export const {updateActiveJobs, updateJobHistory, onSortingColumn,onSortingLogColumn, setImportDocId, setEnableSingleJobAction,updateProceedNCMappings,
    setSelectedTableRow, updateLogsList, setPopupLoading, updateProceedJobContent, updateImportEntity, updatePromoteStatsDetails, setSelectedEntity,
    updateObjectStores, updateTargetRealmsArr, updateTargetsArr, setProceedDoSaveLoading, updateUserBatchActiveJobs, onSortingBatchColumn, updateLicenseDetails} = envManagementSlice.actions;

export default envManagementSlice.reducer;
