import React from 'react'
import {Link} from "react-router-dom"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import CardActionArea from "@material-ui/core/CardActionArea"
import CardMedia from "@material-ui/core/CardMedia"
import CardContent from "@material-ui/core/CardContent"
import Typography from "@material-ui/core/Typography"
import {Button} from "@material-ui/core"
import {ClientSocketEventsHelper} from "../ClientSocketEventsHelper"

interface Props {
    socket: SocketIOClient.Emitter
    projectNum: number
    title: string
    isOpen: boolean
    isRoot: boolean
    thumbnail: string
}

export default class ProjectPreview extends React.Component<Props, any> {

    render() {
        if (this.props.isOpen) {
            return (
                <Grid item xs={12} sm={6} lg={3}>
                    <Card>
                        <Link to={`/project/${this.props.projectNum}`}>
                            <CardActionArea>
                                <CardMedia
                                    component="img"
                                    image={this.props.thumbnail}
                                    title={this.props.title}
                                    style={{height: "140px"}}
                                />
                                <CardContent>
                                    <Typography variant="h5" component="h2">
                                        {this.props.title}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Link>
                        { this.props.isRoot ?
                            <Button variant="contained" color="secondary" onClick={this.onClickLockButton}>Lock</Button>
                            : null
                        }
                    </Card>
                </Grid>
            )
        } else {
            return (
                <Grid item xs={12} sm={6} lg={3}>
                    <Card>
                        <CardActionArea disabled>
                            <CardMedia
                                component="img"
                                title="??"
                                style={{height: "140px"}}
                            />
                            <CardContent>
                                <Typography variant="h5" component="h2">
                                    ???
                                </Typography>
                            </CardContent>
                            <Typography align="center" variant="h3" color="error"
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)"
                                        }}>
                                LOCKED
                            </Typography>
                        </CardActionArea>
                        { this.props.isRoot ?
                            <Button variant="contained" color="primary" onClick={this.onClickUnlockButton}>Unlock</Button>
                            : null
                        }
                    </Card>
                </Grid>
            )
        }
    }

    private onClickLockButton = () => {
        ClientSocketEventsHelper.sendRequestLockProjectEvent(this.props.socket, this.props.projectNum)
    }

    private onClickUnlockButton = () => {
        ClientSocketEventsHelper.sendRequestUnlockProjectEvent(this.props.socket, this.props.projectNum)
    }
}