import React from 'react'
import io from 'socket.io-client'
import CssBaseline from '@material-ui/core/CssBaseline'
import LogInView from "./loginview/LogInView"
import GameView from "./gameview/GameView"

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
        const myId = this.state.myId

        let mainContent
        if (myId) {
            mainContent = <GameView socket={this.socket} myId={myId}/>
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

    private onLoggedIn = (id: string) => {
        this.setState({myId: id})
    }
}

