const path = require('path')
const http = require('http')
const Filter = require('bad-words')
const express = require('express')
const socket = require('socket.io')

const app = express()
const server = http.createServer(app)

const io = socket(server)
const port = process.env.PORT || 3030

const publicDir = path.join(__dirname, '../public')
const { genearteMsg, generateLocationMsg } = require('../public/utils/generatemsg')
const { adduser, removeUser, getUser, getUserRoom, users} = require('../public/utils/users')
app.use(express.static(publicDir))
app.get('', (req, res)=>{
    res.render('index')
})

//connection is going to be called whenever the server recieves a new connection

//socket is an object that contains information about the new connection
io.on('connection', (socket)=>{

    //Message Text
    socket.emit('welcomemessage', genearteMsg('Welcome'))
    
    socket.on('messagetext', ({ msgTxt, username })=>{
        const filter = new Filter
        if(filter.isProfane(msgTxt)){
            return callback('Profanity is not allowed!')
        }
        
        const user = getUser(socket.id)
        // console.log(user.room)
        io.to(user.room).emit('message', genearteMsg(msgTxt, username))
    })

    //Join Room
    socket.on('join', ({ username, roomname }, callback)=>{
        // const roomName = roomname.toLowerCase()
        const { error, user } = adduser({ id : socket.id , username : username, room : roomname })
         if(error){
            return callback(error)
        }
        
        socket.join(user.room)
        socket.broadcast.to(user.room).emit('welcomemessage', genearteMsg(`${username} has joined`))
        io.to(user.room).emit('roomdata', {
            room : user.room,
            users : getUserRoom(user.room)
        })
        // console.log(user.room)
        callback()
    })

    //Location Message
    socket.on('locationmsg', ({latitude, longitude, username}, callback)=>{
        
        const url = 'https://www.google.com/maps?q='+latitude+','+longitude
        const user = getUser(socket.id)
        // console.log(user.room)
        io.to(user.room).emit('showlocation', generateLocationMsg(url, username))
        callback('Location is recieved')
    })

    //Disconnect message
    socket.on('disconnect', ()=>{
    
        const user = getUser(socket.id)
        // console.log(user)
        io.emit('disconnectMessage', `${user} has left`);  
        
    })
})  

server.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})