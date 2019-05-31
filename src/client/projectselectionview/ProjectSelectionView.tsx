import React, {ChangeEvent, FormEvent} from 'react'
import {ClientSocketEventsHelper} from "../ClientSocketEventsHelper"
import {
    ProjectPreviewDTO,
    ProjectSelectionDataDTO,
    ProjectSelectionMessageDTO
} from "../../shared/DTOs"
import ProjectPreview from "./ProjectPreview"
import {Grid} from "@material-ui/core"
import Button from "@material-ui/core/Button"
import {withSnackbar, WithSnackbarProps} from "notistack/build"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogContent from "@material-ui/core/DialogContent"
import DialogActions from "@material-ui/core/DialogActions"
import TextField from "@material-ui/core/TextField"
import first from './first.png'
import second from './second.png'
import third from './third.png'
import fourth from './fourth.png'
import final from './final.png'

interface Props extends WithSnackbarProps {
    socket: SocketIOClient.Emitter
}

interface State {
    isRoot: boolean
    projectPreviews: ProjectPreviewDTO[]
    isRootDialogOpen: boolean
    passwordInput: string
}

class ProjectSelectionView extends React.Component<Props, State> {
    readonly thumbnails = [
        first,
        second,
        third,
        fourth,
        fourth,
        final
    ]

    constructor(props: Props) {
        super(props)
        this.state = { isRoot: false, projectPreviews: [], isRootDialogOpen: false, passwordInput: '' }
    }

    componentDidMount(): void {
        const socket = this.props.socket
        ClientSocketEventsHelper.startReceivingProjectSelectionDataEvent(socket)
        ClientSocketEventsHelper.subscribeProjectSelectionDataEvent(socket, this.onProjectSelectionDataEvent)
        ClientSocketEventsHelper.subscribeProjectSelectionMessageEvent(socket, this.onProjectSelectionMessageEvent)
    }

    componentWillUnmount(): void {
        const socket = this.props.socket
        ClientSocketEventsHelper.stopReceivingProjectSelectionDataEvent(socket)
        ClientSocketEventsHelper.unsubscribeProjectSelectionDataEvent(socket, this.onProjectSelectionDataEvent)
        ClientSocketEventsHelper.unsubscribeProjectSelectionMessageEvent(socket, this.onProjectSelectionMessageEvent)
    }

    private onProjectSelectionDataEvent = (projectSelectionData: ProjectSelectionDataDTO) => {
        this.setState({isRoot: projectSelectionData.isRoot, projectPreviews: projectSelectionData.previews})
    }

    private onProjectSelectionMessageEvent = (message: ProjectSelectionMessageDTO) => {
        switch (message) {
            case ProjectSelectionMessageDTO.ROOTED:
                this.props.enqueueSnackbar("Rooted", { variant: 'success', autoHideDuration: 1000 })
                break
            case ProjectSelectionMessageDTO.UNROOTED:
                this.props.enqueueSnackbar("Unrooted", { variant: 'success', autoHideDuration: 1000 })
                break
            case ProjectSelectionMessageDTO.PROJECT_LOCKED:
                this.props.enqueueSnackbar("Project locked", { variant: 'success', autoHideDuration: 1000 })
                break
            case ProjectSelectionMessageDTO.PROJECT_UNLOCKED:
                this.props.enqueueSnackbar("Project unlocked", { variant: 'success', autoHideDuration: 1000 })
                break
            case ProjectSelectionMessageDTO.PERMISSION_DENIED:
                this.props.enqueueSnackbar("Permission denied", { variant: 'error', autoHideDuration: 1000 })
                break
        }
    }

    render() {
        return (
            <React.Fragment>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        { this.state.isRoot ?
                            <Button variant="contained" color="secondary" disableRipple={true}
                                    onClick={this.onClickUnrootButton}>Unroot</Button>
                            :
                            <Button variant="contained" color="primary" disableRipple={true}
                                    onClick={this.onClickRootButton}>Root</Button>
                        }
                    </Grid>
                    {
                        this.state.projectPreviews.map((preview: ProjectPreviewDTO, index: number) =>
                            <ProjectPreview key={preview.title} {...preview} isRoot={this.state.isRoot} socket={this.props.socket} thumbnail={this.thumbnails[index]}/>
                        )
                    }
                    <Dialog
                        open={this.state.isRootDialogOpen}
                        onClose={this.onCloseRootDialog}>
                        <form onSubmit={this.onSubmitRootPassword} autoComplete="false">
                            <DialogTitle>Enter Password</DialogTitle>
                            <DialogContent>
                                <TextField
                                    autoFocus margin="dense" id="password" label="Password" fullWidth
                                    type="password" value={this.state.passwordInput} onChange={this.onPasswordInputChanged}/>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={this.onCloseRootDialog} color="secondary">Cancel</Button>
                                <Button type="submit" color="primary">OK</Button>
                            </DialogActions>

                        </form>
                    </Dialog>
                </Grid>
            </React.Fragment>
        )
    }

    private onClickRootButton =  () => {
        this.setState({ isRootDialogOpen: true, passwordInput: '' })
    }

    private onClickUnrootButton = () => {
        ClientSocketEventsHelper.sendRequestUnrootEvent(this.props.socket)
    }

    private onCloseRootDialog = () => {
        this.setState({ isRootDialogOpen: false, passwordInput: '' })
    }

    private onPasswordInputChanged = (event: ChangeEvent) => {
        this.setState({passwordInput: (event.target as HTMLInputElement).value})
    }

    private onSubmitRootPassword = (event: FormEvent) => {
        event.preventDefault()
        ClientSocketEventsHelper.sendRequestRootEvent(this.props.socket, this.state.passwordInput)
        this.onCloseRootDialog()
    }
}

export default withSnackbar(ProjectSelectionView)