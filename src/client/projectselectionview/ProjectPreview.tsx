import React from 'react'
import {Link} from "react-router-dom"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import CardActionArea from "@material-ui/core/CardActionArea"
import CardMedia from "@material-ui/core/CardMedia"
import CardContent from "@material-ui/core/CardContent"
import Typography from "@material-ui/core/Typography"

interface Props {
    num: number
    name: string
    isOpen: boolean
}

export default class ProjectPreview extends React.Component<Props, any> {

    render() {
        if (this.props.isOpen) {
            return (
                <Grid item xs={12} sm={6} lg={3}>
                    <Card>
                        <Link to={`/project/${this.props.num}`}>
                            <CardActionArea>
                                <CardMedia
                                    component="img"
                                    image="/static/images/tempcard.jpg"
                                    title={this.props.name}
                                    style={{height: "140px"}}
                                />
                                <CardContent>
                                    <Typography variant="h5" component="h2">
                                        {this.props.name}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Link>
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
                                image="/static/images/tempcard.jpg"
                                title={this.props.name}
                                style={{height: "140px"}}
                            />
                            <CardContent>
                                <Typography variant="h5" component="h2">
                                    {this.props.name}
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
                    </Card>
                </Grid>
            )
        }
    }
}