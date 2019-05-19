import React, {ChangeEvent, FormEvent} from 'react'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import {ClientSocketEventsHelper} from "../ClientSocketEventsHelper"

interface Props {
    socket: SocketIOClient.Emitter
    onLoggedIn: (id: string) => void
}

interface State {
    inputName: string
}

export default class LogInView extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {inputName: ''}
    }

    componentDidMount(): void {
        const socket = this.props.socket
        ClientSocketEventsHelper.subscribeYouJoinedEvent(socket, you => {
            this.props.onLoggedIn(you.id)
        })
    }

    componentWillUnmount(): void {
        const socket = this.props.socket
        ClientSocketEventsHelper.unsubscribeYouJoinedEvent(socket)
    }

    render() {
        return (
            <Grid container justify="center">
                <Grid item xs={8} sm={6} lg={3}>
                    <Paper style={{paddingLeft: 16, paddingRight: 16}}>
                        <form onSubmit={this.onLogInButtonClicked} autoComplete="off">
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="name">이름</InputLabel>
                                <Input id="name" name="name" autoFocus value={this.state.inputName} onChange={this.onInputChanged}/>
                            </FormControl>
                            <Button type="submit" fullWidth variant="contained" color="primary">로그인</Button>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        )
    }

    private onInputChanged = (event: ChangeEvent) => {
        this.setState({inputName: (event.target as HTMLInputElement).value})
    }

    private onLogInButtonClicked = (event: FormEvent) => {
        event.preventDefault()
        ClientSocketEventsHelper.onLogInClicked(this.props.socket, this.state.inputName)
    }
}