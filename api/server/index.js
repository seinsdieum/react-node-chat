const express = require('express')
const cors = require('cors')
const PORT = process.env.PORT || 3001
const events = require('events')
const messageHandler = require('./messengerHandler')
const app = express()

const websocket = require('ws')
const uuid = require('uuid')

app.use(cors())
app.use(express.json());

const emitter = new events.EventEmitter();

app.get('/messages', (req, res) => {
    emitter.once('newMessage', (msg) => {
        res.status(200).json( msg);
    })
})

app.post('/send-messages', (req, res) => {
    const message = req.body;
    console.log(message)
    emitter.emit('newMessage', message)
    res.status(200)
    res.end()
})

app.listen(PORT, () => {
    console.log('server listening on ' + PORT)
})