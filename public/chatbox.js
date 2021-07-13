const socket = io('/')

var tempInput = prompt("Enter room")//to dynamically take room input the user wants to access
if (tempInput) {
  ROOM_ID = tempInput //else ROOM_ID is the personal space of any user
}

const peers = {}
let peerlist = {}


socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close() //close connection
})

socket.emit('join-room', ROOM_ID, USEREMAIL, USERNAME)


//To input the new message on enter
$('html').keydown(function (e) {
  let text = document.getElementById("chat_message").value;
  if (e.which == 13 && text.length !== 0) {
    socket.emit('message', text);
    document.getElementById("chat_message").value = ''
  }
});


//to show all the rooms the user has been a part of:
socket.on("showRoomIds", resultRooms => {
  for (var x in resultRooms[0].rooms) {
    var temp = resultRooms[0].rooms[x]
    $('.RoomIdGrid').append(
      `<li>
        <button type="button" data-room="${temp}" onclick="copyfield(${temp})" class="btn btn-outline-info btn-lg btn-block roomButton">
          ${temp}
        </button>
      </li>`
    );
  }
})



socket.on("createMessage", result => {

  for (var msg in result) {
    $('.messages').append(
      `<li class="message"><text style="color: black">
        <b>${result[msg].user}</b></text>
        <text style="color:rgb(121, 114, 114); font-size:12px; margin: 5px">${result[msg].time}</text></br>
        ${result[msg].message_body}</li>`);
  }

  scrollToBottom()
})



const scrollToBottom = () => {
  var chatBox = $('.main__chat_window');
  chatBox.scrollTop(chatBox.prop("scrollHeight"));
}



socket.on('peerss', peersList => {

  document.querySelector('.list').innerHTML = "";

  for (var key in peersList) {
    if (peersList.hasOwnProperty(key)) {
      $('.list').append(`<li class="entry">${peersList[key]}</br></li>`);
    }
  }
  scrollToBottom()

})


const Participants = () => {
  socket.emit('count', ROOM_ID);
  //hide chatbox
  $('.chat_box').hide();

  //show participants
  $('.participant_box').show();
}



function showChat() {
  $('.chat_box').show();
  $('.participant_box').hide();
}

