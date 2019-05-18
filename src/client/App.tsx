import React from 'react'
import './App.css'
import {ClientSocketEventsHelper} from "./ClientSocketEventsHelper"
import io from 'socket.io-client'
import {ClientModels} from "./ClientModels"

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
        this.subscribeYouJoinedEvent(socket)
        this.subscribeNewPlayerJoinedEvent(socket)
    }

    private subscribeYouJoinedEvent(socket: SocketIOClient.Emitter): void {
        ClientSocketEventsHelper.subscribeYouJoinedEvent(socket, (player: ClientModels.Player) => {
            this.setState({isLoggedIn: true})
        })
    }

    private subscribeNewPlayerJoinedEvent(socket: SocketIOClient.Emitter): void {
        ClientSocketEventsHelper.subscribeNewPlayerJoinedEvent(socket, player => {

        })
    }

    render() {
        const isLoggedIn = this.state.isLoggedIn

        if (isLoggedIn) {
            return (
                <div className="App">
                    Hello! I am logged in!
                </div>
            )
        } else {
            return (
                <div className="App">
                    <button onClick={this.onLogInButtonClicked}>Log In</button>
                </div>
            )
        }
    }

    private onLogInButtonClicked = () => {
        ClientSocketEventsHelper.onLogInClicked(this.socket)
    }
}

