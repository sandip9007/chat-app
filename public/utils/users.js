const users = []

const adduser = ({id, username, room})=>{
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username && !room){
        return {
            error : 'Username and room are required'
        }
    }
    //Check for existing users 
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username 
    })

    //Validate user
    if(existingUser){
        return {
            error : 'Username already in use'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return { user }
}
//Remove users
const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !== -1 ){
        return users.splice(index, 1)
    }
}
//Get users
const getUser = (id)=>{
    const findUser = users.find((user)=>{
        return user.id === id
    })
    if(!getUser){
        return {
            error : undefined
        }
    }
    return findUser
}

//Get room name
const getUserRoom = (room)=>{
    const findRoom = users.filter((user)=>{
          return user.room.trim().toLowerCase()  === room.trim().toLowerCase()
    })

    return findRoom
}  


module.exports = {
    adduser,
    removeUser,
    getUser,
    getUserRoom,
    users
}