import React from 'react'
import io from 'socket.io-client'
import {Route, Switch} from "react-router"
import {BrowserRouter} from "react-router-dom"
import ProjectSelectionView from "./projectselectionview/ProjectSelectionView"
import ProjectView from "./projectview/ProjectView"

export default class App extends React.Component {
    private readonly socket: SocketIOClient.Emitter

    constructor(props: any) {
        super(props)
        this.socket = io.connect()
    }

    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" render={(props) => <ProjectSelectionView {...props} socket={this.socket}/>} />
                    <Route path="/project/:projectNum" render={(props) => <ProjectView {...props} socket={this.socket}/>} />
                </Switch>
            </BrowserRouter>
        )
    }
}

