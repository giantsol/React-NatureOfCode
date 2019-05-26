import React from 'react'
import {RouteComponentProps} from "react-router"
import Project01 from "./Project01"
import Project02 from "./Project02"

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
        }
        return (
            <React.Fragment>
                { main }
            </React.Fragment>
        )
    }
}