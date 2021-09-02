import {createSlice} from "@reduxjs/toolkit";

export const workSearchSlice = createSlice({
    name: "workSearch",
    initialState: {
        loading:false,
        reassignSuccessPopup: false,
        reassignRouteSuccessPopup: false,
        reassignPopupLoading:false,
        routePopupLoading:false,
        routeUserList:[],
        routeReasonList:[],
        workObject: null,
        workLeftPanelData:null,
        viewChoiceListData:[],
        viewPageLoading:false,
        queueList:[]
    },
    reducers: {
        setLoading:(state,data)=>{
            state.loading= data.payload
        },
        setReassignLoading:(state,data)=>{
            state.reassignPopupLoading= data.payload
        },
        setRouteLoading:(state,data)=>{
            state.routePopupLoading= data.payload
        },
        setShowSuccessPopup:(state,data)=>{
            state.reassignSuccessPopup=data.payload
        },
        setShowRouteSuccessPopup:(state,data)=>{
            state.reassignRouteSuccessPopup=data.payload
        },
        setRouteUserList:(state,data)=>{
            state.routeUserList=data.payload
        },
        setRouteReasonList:(state,data)=>{
            state.routeReasonList=data.payload
        },
        setWorkObjectData:(state,data)=>{
            state.workObject=data.payload
        },
        setWorkLeftPanelData:(state,data)=>{
            state.workLeftPanelData=data.payload
        },
        setViewData:(state,data)=>{
            state.viewChoiceListData=JSON.parse(data.payload?.choiceLists);
        },
        setViewPageLoading:(state,data)=>{
            state.viewPageLoading=data.payload
        },
        setReassignQueueList:(state,data)=>{
            state.queueList=data.payload
        }
    }
})

export const {setLoading,setShowSuccessPopup,setReassignLoading,setRouteUserList,setRouteReasonList,setShowRouteSuccessPopup,setRouteLoading,setWorkObjectData,setWorkLeftPanelData,setViewData,setViewPageLoading,setReassignQueueList} = workSearchSlice.actions;

export default workSearchSlice.reducer;
