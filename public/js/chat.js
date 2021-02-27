const socket = io()
const msgText = document.querySelector('#msgText')
const sendMsg = document.querySelector('#sendMsg')
const sendLoc = document.querySelector('#sendLoc')
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('#sidebar')
const showAlert = document.querySelector('#showAlert')
const disableBackground = document.querySelector('#disableBackground')
// #disableBackground
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
    const html = Mustache.render(messageTemplate, { 
        message : data.text,
        time : moment(data.time).format('h:mm A')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

//Message 
socket.on('message', (message)=>{
    const html = Mustache.render(messageTemplate, { 
        message : message.text,
        Username: message.username,
        time : moment(message.time).format('h:mm A')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})
socket.on('roomdata',({ room, users})=>{
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
    console.log(data)
})

//Recieve Location
socket.on('showlocation', (locationData)=>{
    const html = Mustache.render(locationTemplate, {
        Username : locationData.username, 
        url : locationData.url,
        time : moment(locationData.time).format('h:mm A')
    })
    messages.insertAdjacentHTML('beforeend',html)
})
//Send message
sendMsg.addEventListener('click', (e)=>{
    e.preventDefault()
    sendMsg.setAttribute('disabled', 'disabled')
    const msgTxt = document.querySelector('#msgText').value
    // console.log(msgText)
    if(msgText.value === ""){
        // alert("Please say something")
        showAlertBox("Please type a message", 2000)
        sendMsg.removeAttribute('disabled')
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
            
        })
    })
})


socket.emit('join', { username, roomname }, (error)=>{
    if(error){
        // throw new Error (error)
        showAlertBox(error, 1000)
        disableBackground.style.display = "block"
        setTimeout(()=>{
            window.location.href = "index.html";
        },1000)
        
    }
})

function showAlertBox(text, time){
    showAlert.style.display = "flex"
    showAlert.textContent = text
    setTimeout(()=>{
        showAlert.style.display = "none" 
    },time)

}
