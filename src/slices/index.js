import {combineReducers} from "redux";
import dashboardReducer from "./dashboardSlice";
import workSearchReducer from "./workSearchSlice";
import envManagementReducer from "./envManagementSlice";
import envConfigReducer from "./envConfigSlice";

export const reducers = combineReducers({
    dashboard: dashboardReducer,
    workSearch: workSearchReducer,
    envManagement:envManagementReducer,
    envConfig: envConfigReducer

});