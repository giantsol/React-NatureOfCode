import React from 'react'
import {ClientSocketEventsHelper} from "../ClientSocketEventsHelper"
import {ProjectPreviewDTO, ProjectSelectionDataDTO} from "../../shared/DTOs"
import ProjectPreview from "./ProjectPreview"
import {Grid} from "@material-ui/core"

interface Props {
    socket: SocketIOClient.Emitter
}

interface State {
    projectPreviews: ProjectPreviewDTO[]
}

export default class ProjectSelectionView extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = { projectPreviews: [] }
    }

    componentDidMount(): void {
        const socket = this.props.socket

        ClientSocketEventsHelper.startReceivingProjectSelectionDataEvent(socket)
        ClientSocketEventsHelper.subscribeProjectSelectionDataEvent(socket, this.onProjectSelectionDataEvent)
    }

    private onProjectSelectionDataEvent = (projectSelectionData: ProjectSelectionDataDTO) => {
        this.setState({ projectPreviews: projectSelectionData.previews })
    }

    componentWillUnmount(): void {
        const socket = this.props.socket

        ClientSocketEventsHelper.stopReceivingProjectSelectionDataEvent(socket)
        ClientSocketEventsHelper.unsubscribeProjectSelectionDataEvent(socket, this.onProjectSelectionDataEvent)
    }

    render() {
        return (
            <React.Fragment>
                <Grid container spacing={24}>
                    {
                        this.state.projectPreviews.map(preview =>
                            <ProjectPreview key={preview.name} {...preview} />
                        )
                    }
                </Grid>
            </React.Fragment>
        )
    }

}