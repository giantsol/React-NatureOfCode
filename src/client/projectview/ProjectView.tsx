import React from 'react'
import {RouteComponentProps} from "react-router"
import Project01 from "./Project01"
import Project02 from "./Project02"
import Project04 from "./Project04"
import GameView from "../gameview/GameView"

interface MatchParams {
    projectNum: string
}

interface Props extends RouteComponentProps<MatchParams> {
    socket: SocketIOClient.Emitter
}

export default class ProjectView extends React.Component<Props, any> {
    render() {
        let main
        switch (this.props.match.params.projectNum) {
            case "1":
                main = <Project01 socket={this.props.socket} />
                break
            case "2":
                main = <Project02 />
                break
            case "4":
                main = <Project04 />
                break
            case "5":
                main = <GameView socket={this.props.socket} />
                break
        }
        return (
            <React.Fragment>
                { main }
            </React.Fragment>
        )
    }
}