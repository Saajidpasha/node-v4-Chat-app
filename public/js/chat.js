const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')

const $messageFormInputButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')

const $messages = document.querySelector('#messages')

const $location = document.querySelector('#location')
//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
//we will get the username and room from the query string by using location object
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix : true}) //removing ? mark

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//this will receive calls from index.js (server)

socket.on('message',(message)=>{
    //console.log(message)
    const html = Mustache.render(messageTemplate,
        {   username : message.username,
            message : message.text,
           createdAt : moment(message.createdAt).format('h:mm:a')
        })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
   // console.log(message)
    
    const html = Mustache.render(locationTemplate,
        {   username : message.username,
            url : message.url,
            createdAt : moment(message.createdAt).format('h:mm:a')
        })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})



$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormInputButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        //after sending the message enable the send button again.
        //empty the textfield and bring the focus back to the text-field
        $messageFormInputButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message Delivered!')
    })

})

$sendLocationButton.addEventListener('click',()=>{

    if(!navigator.geolocation){
        return alert('Geo location is not supported by your browser!')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
   navigator.geolocation.getCurrentPosition(
       (position)=>{
      // console.log(position)
       socket.emit('sendLocation',
       {
        latitude : position.coords.latitude,
        longitude :  position.coords.longitude
       },
       (error)=>{
           $sendLocationButton.removeAttribute('disabled')
           if(error){
               return console.log(error)
           }
           console.log('Location Shared!')
       
 })

})

})

socket.emit('join',{username,room},(error)=>{
    if(error){
        //if same username or any error
        alert(error)
        //return to home page 
        location.href = './'
    }
})