import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import reportWebVitals from "./reportWebVitals";
import store from "./store";
import './i18n';

const importBuildTarget = () => { 
    if (process.env.REACT_APP_BUILD_TARGET === "app") { 
      return import("./App.js"); 
    } else if (process.env.REACT_APP_BUILD_TARGET === "admin") { 
      return import("./AdminApp.js"); 
    } else { 
      return Promise.reject(
        new Error("No such build target: " + process.env.REACT_APP_BUILD_TARGET)
      ); 
    } 
  } 

importBuildTarget().then(({ default: Environment }) => 
  ReactDOM.render( 
    <React.StrictMode> 
      <Provider store={store}>
        <Environment /> 
      </Provider>
    </React.StrictMode>
  , document.getElementById("root") 
  ) 
);

reportWebVitals();