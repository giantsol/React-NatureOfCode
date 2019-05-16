import {Request, Response} from "express"

const express = require('express')
const app = express()
const serverPort = 9009

app.use(express.static('build_dev'))

app.get('/', (req: Request, res: Response) => {
    res.sendFile('index.html')
})

app.listen(serverPort, () => {
    console.log('Server started at port: ' + serverPort)
})
