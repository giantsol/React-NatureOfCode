import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'
import App from "./App"
import {SnackbarProvider} from 'notistack'
import {CssBaseline} from "@material-ui/core"

ReactDOM.render(
    <SnackbarProvider maxSnack={5}>
        <CssBaseline />
        <App />
    </SnackbarProvider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
