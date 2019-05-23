import React from 'react'
import io from 'socket.io-client'
import {Route, Switch} from "react-router"
import {BrowserRouter} from "react-router-dom"
import ProjectSelectionView from "./projectselectionview/ProjectSelectionView"
import ProjectView from "./projectview/ProjectView"

interface State {
    myId: string | null
}

export default class App extends React.Component<any, State> {
    private readonly socket: SocketIOClient.Emitter

    constructor(props: any) {
        super(props)
        this.state = {
            myId: null
        }

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

        // const myId = this.state.myId
        //
        // let mainContent
        // if (myId) {
        //     mainContent = <GameView socket={this.socket} myId={myId}/>
        // } else {
        //     mainContent = <LogInView socket={this.socket} onLoggedIn={this.onLoggedIn}/>
        // }
        //
        // return (
        //     <React.Fragment>
        //         {mainContent}
        //     </React.Fragment>
        // )
    }

    private onLoggedIn = (id: string) => {
        this.setState({myId: id})
    }
}

