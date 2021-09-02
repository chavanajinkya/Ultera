import { createSlice } from "@reduxjs/toolkit";
import {ICONS} from "../utils/iconNames";
import _ from "lodash";

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    loading:false,
    activeTabIndex: 0,
    activeSubTabIndex: 0,
    isLoggedIn: true,
    onRetry:[],
    openEnvDialog: false,
    environmentId : null,
    errorText: {title:'',message:''},
    enableSignOutPopup: {flag : false, title: ''},
    leftPanelSubData:[],
    criteriaDefinitionsData:[],
    resultSetDefinitionsData:[],
    resultSetData: null,
    pageSize:0,
    totalSearches: 0,
    currentTemplate:{},
    defaultTemplate:{},
    choiceList:[],
    userList:[],
    environmentList: [],
    noContext:false,
    hasValid:true,
    massRouteList:[],
    workItemStatusList:[],
    workItemLoading:false,
    ownershipFieldData:[],
    showCaseSuccessPopup:false,
    caseReassignPopupLoading:false,
  },
  reducers: {
    setLoading:(state,data)=>{
      state.loading= data.payload
    },
    setLoginState:(state,data)=>{
      state.isLoggedIn= data.payload
    },
    setActiveTab: (state, data) => {
      state.activeTabIndex= data.payload ;
      state.activeSubTabIndex = 0;
    },
    setActiveSubTab: (state, data) => {
      state.activeSubTabIndex= data.payload ;
    },
    setOnRetry:(state, data)=>{
      state.onRetry.push(data.payload);
    },
    setError:(state,data)=>{
      state.errorText={title:data.payload.title, message:data.payload.message}
    },
    clearOnRetry:(state)=>{
      state.onRetry = [];
    },
    setEnableSignOutPopup:(state,data)=>{
      state.enableSignOutPopup= {flag:data.payload.flag, title:data.payload.title}
    },
    setLeftPanelSubData:(state,data)=>{
      state.leftPanelSubData = data.payload;
      data.payload.forEach((d)=>{
        localStorage.setItem(d.id, window.innerWidth/3*2)
      })
    },
    setSubDataItemCount:(state,data)=>{
      state.leftPanelSubData =state.leftPanelSubData.map(t1 => ({...t1, ...data.payload.find(t2 => t2.templateId === t1.id)}))
    },
    setResultSetData:(state,data)=>{
      state.resultSetData = data.payload;
    },
    setTotalSearches:(state,data)=>{
      state.totalSearches = data.payload;
    },
    setPageSize:(state,data)=>{
      state.pageSize = data.payload;
    },
    setUserList:(state,data)=>{
      state.userList=data.payload
    },
    setOpenEnvDialog: (state, data)=>{
      state.openEnvDialog = data.payload
    },
    setEnvironmentId: (state, data)=>{
      state.environmentId = data.payload
    },
    setCurrentTemplate:(state,data)=>{
      state.currentTemplate=data.payload;
    },
    setCriteriaDefinitions:(state,data)=>{
      state.criteriaDefinitionsData = state.criteriaDefinitionsData?.map(t1=>({...t1, ...data.payload?.retrievalExpressions?.detailSet.find(t2=> t2.target===t1.name)}));
    },
    setResultSetDefData:(state, data)=> {
      state.resultSetDefinitionsData = JSON.parse(data.payload?.metaData?.resultsDefinitions)
    },
    setContextMetaData:(state, data)=> {
      state.pageSize = Number(data.payload?.pagesize);
      state.currentTemplate=JSON.parse(data.payload?.currentTemplate);
      state.defaultTemplate=JSON.parse(data.payload?.currentTemplate);
      state.choiceList=JSON.parse(data.payload?.metaData?.choiceLists);
      let searchResultDefinitionsData= JSON.parse(data.payload?.metaData?.resultsDefinitions);
      state.resultSetDefinitionsData = searchResultDefinitionsData?.filter((d,i) => searchResultDefinitionsData[i]?.fieldDefinition?.isVisible);
      let parsedOperatorData=JSON.parse(data.payload.metaData?.operatorMetaData);
      let mappedViewTypesData =JSON.parse(data.payload.metaData?.criteriaDefinitions).map(t1 => ({...t1, ...parsedOperatorData?.viewTypes.find(t2 => (t2.typeValue === t1.type && t2.viewTypeValue === t1.viewType))}))
      let mappedOperatorData = mappedViewTypesData.map(t1=>{
        if(Object.keys(parsedOperatorData?.operatorMap).includes(t1.operatorSet)){
          return ({...t1,...{operatorData:parsedOperatorData?.operatorMap[t1.operatorSet]}})
        }
      });
      let mappedCriteriaData = JSON.parse(data.payload?.currentTemplate)?.retrievalExpressions?.detailSet?.map(t1=>({...t1, ...mappedOperatorData.find(t2=> t2.name===t1.target)}));
      state.criteriaDefinitionsData= mappedCriteriaData.sort((a, b) => a.orderBy - b.orderBy);
    },
      setEnvironmentList: (state, data) => {
          state.environmentList = data.payload;
      },
    clearContextData:(state, data)=> {
      state.currentTemplate= {};
      state.defaultTemplate= {};
      state.choiceList=[];
      state.resultSetDefinitionsData = [];
      state.criteriaDefinitionsData= [];
      state.leftPanelSubData=[]
    },
    setNoContextFound:(state, data)=> {
      state.noContext=data.payload
    },
    setHasValid:(state, data)=> {
      state.hasValid=data.payload
    },
    setMassRouteList:(state, data)=> {
      state.massRouteList = data.payload
    },
    setWorkItemStatusList:(state, data)=> {
      state.workItemStatusList = data.payload
    },
    setWorkItemLoading:(state,data)=>{
      state.workItemLoading= data.payload
    },
    setShowReassignSuccessPopup:(state,data)=>{
      state.caseReassignSuccessPopup=data.payload
    },
    setOwnershipFieldData:(state,data)=>{
      state.ownershipFieldData=data.payload
    },
    setShowCaseSuccessPopup:(state,data)=>{
      state.showCaseSuccessPopup=data.payload
    },
    setCaseReassignPopupLoading:(state,data)=>{
      state.caseReassignPopupLoading=data.payload
    },
  }
});

export const {setResultSetDefData, setHasValid, setNoContextFound,clearContextData,setLoginState, setActiveTab,
  setActiveSubTab, setOnRetry, setError, clearOnRetry, setEnableSignOutPopup,setLeftPanelSubData ,setSubDataItemCount,setContextMetaData,
  setCurrentTemplate,setCriteriaDefinitions,setLoading,setResultSetData,setTotalSearches,setUserList,setOpenEnvDialog, setEnvironmentId,
  setEnvironmentList, setPageSize, setMassRouteList,setWorkItemStatusList, setWorkItemLoading, setOwnershipFieldData,setShowCaseSuccessPopup,
  setCaseReassignPopupLoading} = dashboardSlice.actions;

export default dashboardSlice.reducer;
