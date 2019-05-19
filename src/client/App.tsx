import React from 'react'
import {ClientSocketEventsHelper} from "./ClientSocketEventsHelper"
import io from 'socket.io-client'
import CssBaseline from '@material-ui/core/CssBaseline'
import LogInView from "./loginview/LogInView"
import GameView from "./gameview/GameView"

interface State {
    isLoggedIn: boolean;
}

export default class App extends React.Component<any, State> {
    private readonly socket: SocketIOClient.Emitter

    constructor(props: any) {
        super(props)
        this.state = {
            isLoggedIn: false
        }

        this.socket = io.connect()
        this.subscribeSocketEvents(this.socket)
    }

    private subscribeSocketEvents(socket: SocketIOClient.Emitter): void {
        this.subscribeNewPlayerJoinedEvent(socket)
    }

    private subscribeNewPlayerJoinedEvent(socket: SocketIOClient.Emitter): void {
        ClientSocketEventsHelper.subscribeNewPlayerJoinedEvent(socket, player => {

        })
    }

    render() {
        const isLoggedIn = this.state.isLoggedIn

        let mainContent
        if (isLoggedIn) {
            mainContent = <GameView socket={this.socket}/>
        } else {
            mainContent = <LogInView socket={this.socket} onLoggedIn={this.onLoggedIn}/>
        }

        return (
            <React.Fragment>
                <CssBaseline />
                {mainContent}
            </React.Fragment>
        )
    }

    private onLoggedIn = () => {
        this.setState({isLoggedIn: true})
    }
}

