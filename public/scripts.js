// When socket is connected to the server root address (/)
const socket = io('/');

// undefined new Peer defines the ID of the Peer connection
const myPeer = new Peer(undefined, {
    host: 'localhost',
    port: '3001',
    path:'/'
})
const videoGrid = document.getElementById('video-grid')
const peers={}

socket.on('user-disconnected',userId=>{
    if(peers[userId])
    peers[userId].close()
    console.log("user Disconnected",userId)
})

myPeer.on('open', id => {
    console.log(id)
    socket.emit('join-room', ROOM_ID, id)
})

const myVideo = document.createElement('video')
const userVideo = document.createElement('video')
myVideo.muted = true   //to Mute our own voice

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream) => {
    addVideoStream(myVideo, stream)
    
    socket.on('user-connected', userId => {
        console.log("UserID", userId)
        setTimeout(()=>{
            console.log("connect to new user about to be called");
            connectToNewUser(userId, stream)
        },1000)
    })

    myPeer.on('call', call => {
        const answerCall=confirm("Do you want to answer the call?")
        console.log("Answer call",answerCall)
        if(answerCall)
        call.answer(stream);
        else
        console.log("call denied")
     
        //to add the video to the called user    
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

})

// TO add & show  a video stream on the html page 
function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })

    videoGrid.append(video)
}

function connectToNewUser(userId, stream) {
    console.log("connect to new user called",userId)

    const call = myPeer.call(userId, stream);

    // const video = document.createElement('video')
    // console.log(video)

    call.on('stream', userVideoStream => {
        console.log("On stream",userVideoStream)
        // addVideoStream(video, userVideoStream);
        addVideoStream(userVideo, userVideoStream);
    })
    
    call.on('close', () => {
        userVideo.remove()
    })
    peers[userId]=call;
}
