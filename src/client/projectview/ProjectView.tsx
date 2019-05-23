import React from 'react'

interface Props {
    socket: SocketIOClient.Emitter
}

export default class ProjectView extends React.Component<Props, any> {
    render() {
        return (
            <div>Hello!</div>
        )
    }
}