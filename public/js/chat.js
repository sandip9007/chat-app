const socket = io()
const msgText = document.querySelector('#msgText')
const sendMsg = document.querySelector('#sendMsg')
const sendLoc = document.querySelector('#sendLoc')
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#room-template').innerHTML
//Query Strings
const { username, roomname } = Qs.parse(location.search, { ignoreQueryPrefix: true })

//Auto scroll
const autoScroll = ()=>{

    //New message element
    const newMessage = messages.lastElementChild

    //Height of the new message
    const newMessageStyle = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = messages.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = messages.offsetHeight

    //Height of message container
    const containerHeight = messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = messages.scrollTop + visibleHeight


    if(containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }
    // console.log(newMessageStyle)
}

//Welcome Message
socket.on('welcomemessage', (data)=>{
    console.log(data)
    const html = Mustache.render(messageTemplate, { 
        message : data.text,
        time : moment(data.time).format('h:mm A')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

//Message 
socket.on('message', (message)=>{
    // console.log(message)
    const html = Mustache.render(messageTemplate, { 
        message : message.text,
        Username: message.username,
        time : moment(message.time).format('h:mm A')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})
socket.on('roomdata',({ room, users})=>{
    // console.log(users)
    const html = Mustache.render(sidebarTemplate, { 
        room,
        users
    })
    // sidebar.insertAdjacentHTML('beforeend',html)
    sidebar.innerHTML = html
})
//Disconnect Message
socket.on('disconnectMessage',(data)=>{
    const html = Mustache.render(messageTemplate, { 
        message : data.text,
        time : moment(data.time).format('h:mm A')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

//Recieve Location
socket.on('showlocation', (locationData)=>{
    console.log(locationData)
    const html = Mustache.render(locationTemplate, {
        Username : locationData.username, 
        url : locationData.url,
        time : moment(locationData.time).format('h:mm A')
    })
    messages.insertAdjacentHTML('beforeend',html)

    // console.log(locationData)
})
//Send message
sendMsg.addEventListener('click', (e)=>{
    e.preventDefault()
    // sendMsg.setAttribute('disabled', 'disabled')
    const msgTxt = document.querySelector('#msgText').value
    // console.log(msgText)
    if(msgText.value === ""){
        alert("Please say something")
    }
  
    else{
        socket.emit('messagetext', { msgTxt, username }, (error)=>{
            if(error){
                return console.log(error)
            }
            console.log("Message was delivered!")
        })
        sendMsg.removeAttribute('disabled') 
        document.querySelector('#msgText').value = ''
    }
    
})


//Send Location
sendLoc.addEventListener('click', ()=>{
    sendLoc.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation){
        return console.log('Feature not enabled')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('locationmsg', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude,
            username
        }, ()=>{
            sendLoc.removeAttribute('disabled')
            console.log('Location was sent')
            
        })
    })
})


socket.emit('join', { username, roomname }, (error)=>{

})