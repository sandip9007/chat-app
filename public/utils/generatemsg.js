const genearteMsg = (message, username)=>{
    return {
        username : username,
        text : message,
        time : new Date().getTime()
    }
}

const generateLocationMsg = (url, username)=>{
    return {
        username,
        url,
        time : new Date().getTime()
    }
}
module.exports = {
    genearteMsg,
    generateLocationMsg
}