const users = []

//add user, remove user, get user, get users

const addUser = ({ id, username, room }) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'

        }
    }

    //check for existing user

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate the username
    if (existingUser) {
        return {
            error: 'Username is already in use!'
        }
    }

    //store the user
    const user = { id, username, room }
    users.push(user)
    return { user }

}


//Removing a user
const removeUser = (id) => {
    //check if there is a user with the index
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        //users will return an array users - > [[user1,user2..],[user3,user4..],...]
        return users.splice(index, 1)[0]
    }
}

//Get the user based on id
const getUser = (id) => users.find((user) => user.id === id)

const getUsersInRoom = (room) => users.filter((user) => user.room === room)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}