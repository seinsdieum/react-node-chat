const ws = require('ws')
const cors = require('cors')
const PORT = 3001
const {Client} = require('pg');
const db = new Client(
    {
        user: 'postgres',
        host: 'localhost',
        database: 'chatdb',
        password: 'secret',
        port:5432
    }
)
db.connect()
cors()
const wss = new ws.WebSocketServer({
    port: PORT,

}, () => {
    console.log('websocket started on ' + PORT)
})

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const ids = []
const messages = []

function loadMessages() {

    messages.length = 0
    db.query('SELECT u.username, u.unique_id, msg.message_value, r.reaction \n' +
        'FROM messages as msg, chatusers as u, reactions as r\n' +
        'WHERE (msg.fk_user_id = u.unique_id) and (msg.fk_reaction_id = r.reaction_id)', (err, result) => {
        messages.push(...result.rows.map(msg => {return {id: msg.unique_id, message: msg.message_value, name:msg.username, reaction: msg.reaction,  event: 'message'}}))
    });

}
loadMessages()

setTimeout(() => {
    console.log(messages)
}, 1000)



wss.on('connection', function connection(ws) {

    let id = manageConnect(ws)
    ws.on('message', function (message) {
        message = JSON.parse(message)
        //console.log(message)
        switch (message.event) {
            case 'reaction':
                if(message.id !== 0 && message.message !== undefined) db.query(`update messages set fk_reaction_id = ${message.reaction_id} where (messages.message_value = '${message.message}')`, (err, result) => {
                    console.log(err)
                })
                db.query(`select reactions.reaction from reactions where reactions.reaction_id = ${message.reaction_id}`, (err, res) => {
                    message = {message: message.message, id: message.id, reaction: res.rows[0].reaction, event: message.event}
                })
                setTimeout(() => {
                    console.log(message.reaction)
                    broadcastMessage(message)
                }, 300)
                break;
            case 'kick':
            case 'message':
                messages.push(message)
                if(message.id !== 0 && message.message !== undefined) db.query(`insert into messages (message_value, fk_user_id, fk_reaction_id) values ('${message.message}', -1, 8)`, (err, result) => {
                    console.log(err)
                })
                broadcastMessage(message)
                break;
            case 'disconnection':
            case 'connection':
                break;
        }
    })
    ws.on('close', function () {
        manageDisconnect(ws,id)
    })
})

function manageConnect(ws) {
    let id = randomIntFromInterval(1, 3000)
    ids.push(id)
    userSend(ws, {id: id, event: 'identifying'})
    for(let message of messages) {
        userSend(ws, message)
    }
    const msg = {id: id, event: 'connection'}
    userSend(ws, msg)
    return id;
}

function manageDisconnect(ws, id) {
    delete ids[ids.indexOf(id)]
    const msg = {id: id, event: 'disconnection'}
    messages.push(msg)
    userSend(ws, msg)
}

function broadcastMessage(message) {
    console.log('message sent: ' + message.message + ' from id ' + message.id)
    wss.clients.forEach(client => {
        client.send(JSON.stringify(message))
    })
}

function userSend(socket, message) {
    socket.send(JSON.stringify(message))
}
