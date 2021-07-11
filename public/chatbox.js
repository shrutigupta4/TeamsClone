const socket = io('/')

var ROOM_ID = prompt("Enter room")//

const peers = {} //-------------
let peerlist = {}


socket.on('user-disconnected', userId => {
    console.log("disconnected...." + userId)
    console.log( peers )
  if (peers[userId]) peers[userId].close()//
})

socket.emit('join-room', ROOM_ID, USEREMAIL, USERNAME)
  
  
$('html').keydown(function (e) {
  let text = document.getElementById("chat_message").value;
  console.log(text)
  if (e.which == 13 && text.length !== 0) {
    socket.emit('message', text);
    document.getElementById("chat_message").value = ''
  }
});
socket.on("createMessage", result => {
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

  

const scrollToBottom = () => {
  var chatBox = $('.main__chat_window');
  chatBox.scrollTop(chatBox.prop("scrollHeight"));
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




