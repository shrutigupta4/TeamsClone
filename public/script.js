const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const peer = new Peer(undefined, {
  //path: '/peerjs',  
  host: '/',
  port: '443'
})


// Creating the <video> tag and muting the audio of your own feed
let userMediaStream;
const userMedia = document.createElement('video')
userMedia.muted = true

const peers = {} //


navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  userMediaStream = stream;
  addNewStream(userMedia, stream)

  // answering the call and sending your stream
  peer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', peerVideoStream => {
      addNewStream(video, peerVideoStream)
    })
  });

  socket.on('user-connected', USEREMAIL => {
        setTimeout(newConnection,1000, USEREMAIL ,stream)
        //peerlist = temp[1]
      });
      socket.on('addToParticipants', Name => {
        //console.log(peersList)
        $('.list').append(`<li class="entry">${Name}</br></li>`);
        console.log("k")
        //peerlist = temp[1]
      })
})



socket.on('user-disconnected', USEREMAIL => {
    console.log("disconnected...." + USEREMAIL)
    console.log( peers )
  if (peers[USEREMAIL]) peers[USEREMAIL].close()//--------------
})

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id, USERNAME)
  //console.log(user.name)
})

// connect to new users and adding their video
function newConnection(USEREMAIL, stream) {
  const call = peer.call(USEREMAIL, stream)//---------
  const video = document.createElement('video')
  call.on('stream', peerVideoStream => {
    addNewStream(video, peerVideoStream)
  })

  //removes video from grid once they disconnect
  call.on('close', () => {
    //console.log("1")
    video.remove()
  })
  peers[USEREMAIL] = call//---------------
}

// connect your video and append to grid
function addNewStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

// button to end call
let endCall = () => userMediaStream.srcObject.getTracks().forEach(track => track.stop())

//Chatbox-----

  // input value
  let text = $("input");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });
  socket.on("createMessage", result => {
    var currentTime = timeNow();
    //console.log(result)
    for(var msg in result){
      $('.messages').append(
        `<li class="message"><text style="color: black">
          <b>${result[msg].user}</b></text>
          <text style="color:rgb(121, 114, 114); font-size:12px; margin: 5px">${result[msg].time}</text></br>
          ${result[msg].message_body}</li>`); 
    }
   
    scrollToBottom()
    //console.log(message);
  })
  
  
  function timeNow() {
    return (new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" }));
  }

const scrollToBottom = () => {
  var chatBox = $('.main__chat_window');
  chatBox.scrollTop(chatBox.prop("scrollHeight"));
}


//Buttons----

const startTime = timeNow();

window.onload = function timer() {
  const today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();

  //var x = document.querySelector('main__timer');
  $('main__timer').innerHTML =  "hello"
  //console.log(  $('main__timer'))
  //document.querySelector('main__timer').innerHTML =  h + ":" + m + ":" + s;
  //document.querySelector('main__timer').innerHTML = (h-startTime.hour) + ":" + m + ":" + s;
  setTimeout(timer, 1000);
}

const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }
  
  const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }
  
  //console.log(userMediaStream.getVideoTracks())
  const videoButton = () => {
    //console.log('object')
    
    let enabled = userMediaStream.getVideoTracks()[0].enabled;
    if (enabled) {
      userMediaStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      userMediaStream.getVideoTracks()[0].enabled = true;
    }
  }
  
  
  
  const audioButton = () => {
      
    const enabled = userMediaStream.getAudioTracks()[0].enabled;
    if (enabled) {
      userMediaStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      userMediaStream.getAudioTracks()[0].enabled = true;
    }
  }
  const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  
  const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  





  socket.on('peerss', peersList => {
    console.log("peers: ")
    
    document.querySelector('.list').innerHTML = "";

    for (var key in peersList) {
      if (peersList.hasOwnProperty(key)) {
        $('.list').append(`<li class="entry">${peersList[key]}</br></li>`);
          //console.log(peersList[key]);
          //listofpeers.append(peersList[key])
      }
    }
    //console.log(listofpeers)
    //$('.list').inner(`<li class="entry">${peersList[key]}</br></li>`);
    scrollToBottom()
       
  })

  
  const Participants = () => {
    socket.emit('count', ROOM_ID); 
    //hide chatbox
    $('.chat_box').hide();

    //show participants
    $('.participant_box').show();  
  }

  function showChat(){
    $('.chat_box').show();
    $('.participant_box').hide();
  }
  const leave = () => {
    //endCall()
    window.location.href = "http://google.com"; 
  }