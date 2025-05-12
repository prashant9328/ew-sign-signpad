import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AllRoutes } from "./Routes";
// import App from "./App";
// import * as serviceWorker from "./serviceWorker";
import { prepareAssets } from "./utils/prepareAssets";
import DisableDevtool from 'disable-devtool';

import { Provider } from "react-redux";
import { store } from "./redux/store";

//
import "./styles";
import "bootstrap/dist/css/bootstrap.min.css";

//
prepareAssets();

const root = ReactDOM.createRoot(document.getElementById("root")!);
// DisableDevtool();

root.render(
  // <React.StrictMode>
  <Provider store={store}>
    
    <AllRoutes />
  </Provider>
  // </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
