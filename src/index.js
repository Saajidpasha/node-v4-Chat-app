//Server file contains the implementation of two methods only
//Send Message and Send Location these are trigerred from Client side
//This file establishes a connection and then waits for messages/location/disconnections

const express = require('express')
const app = express()

const http = require('http')

const server = http.createServer(app)

const socketio = require('socket.io')

const io = socketio(server)

const port = process.env.PORT || 3000

const path = require('path')

const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')

const { addUser, removeUser, getUser, getUsersInRoom } = require('../src/utils/users')

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))



io.on('connection', (socket) => {


    console.log('New connection established!')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }
        socket.join(room)

        socket.emit('message', generateMessage('Admin','Welcome!'))

        //socket.emit,io.emit,socket.broadcast.emit
        //io.to.emit, socket.broadcast.to.emit --> Only for those special rooms/people

        //when a new user joins let all other clients know
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))
       io.to(user.room).emit('roomData',{
           room : user.room,
           users : getUsersInRoom(user.room)
       })

    })

    //this will receive calls from chat.js (client)
    //when a user sends any message
    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id)
        if (user) {
            const filter = new Filter()
            if (filter.isProfane(message)) {
                return callback('Profane messages are not allowed')
            }

            io.to(user.room).emit('message', generateMessage(user.username,message))
            callback()
        }

    })




    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
            callback()
        }
    
    })



    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }
    })
})



server.listen(port, () => {
    console.log('Server is up and Listening on Port ' + port)
})