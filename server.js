const express = require('express')
//const path = require('path'); //check for path/peerserver thing, from smwhere else
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
var cookieParser = require('cookie-parser')



//Google auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '1099106946396-at69kokb2ni7fh0ikjadbg7knsf7ko69.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);



const roomsMap = {}

const Message = require('./models/messages')
const mongoose = require('mongoose');

const dotenv = require('dotenv')
dotenv.config()

mongoose.connect(process.env.MONGODB_URI || process.env.CONNECTIONSTRING, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});



//Middleware - to set view engine to ejs 
app.set('view engine', 'ejs')


app.use(express.static('public'))
app.use(express.json()); //to send json from frontend to backend
app.use(cookieParser()); 

app.get('/', (req, res) => {
  res.render('login');
})



app.get('/login', (req, res)=>{
  res.render('login')
})


app.post('/login', (req, res)=>{
  let token = req.body.token; //google token sent on login from frontend
  console.log(token);
  async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    console.log(payload)
  }
  verify()
  .then(()=>{
    res.cookie('session-token', token);
    res.send('success');
  }).catch(console.error);
})

app.get('/dashboard', checkAuthenticated, (req, res)=>{
  let user = req.user;
  res.render('dashboard', {user})
})


app.get('/logout', (req, res)=>{
  res.clearCookie('session-token');
  res.redirect('/login');
})  

app.get('/room', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', checkAuthenticated, (req, res) => {
  let user = req.user;
  res.render('room', { roomId: req.params.room, user})
})


function checkAuthenticated(req, res, next){

  let token = req.cookies['session-token'];

  let user = {};
  async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      });
      const payload = ticket.getPayload();
      user.name = payload.name;
      user.email = payload.email;
      user.picture = payload.picture;
    }
    verify()
    .then(()=>{
        req.user = user;
        next();
    })
    .catch(err=>{
        res.redirect('/login') //if authentication failed
    })

}

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId, userName) => {
    socket.join(roomId)
    async function getMessages() {
      const results = await db.collection("messages").find({room: roomId}).toArray();
      io.to(socket.id).emit('createMessage', results)
    }
    getMessages().catch(console.error);


    if(roomsMap[roomId]) {
      roomsMap[roomId][userId] = userName;


    } else {
      const peersMap = {}
      peersMap[userId] = userName;
      roomsMap[roomId] = peersMap;
    }

    

    socket.broadcast.to(roomId).emit('user-connected', userId)
    socket.broadcast.to(roomId).emit('addToParticipants', userName)
    

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
      delete roomsMap[roomId][userId]
      console.log(roomsMap[roomId])
    })
    socket.on('message', message => {
      //send message to the same room

      const messagedb = new Message({
        room: roomId,
        user: userName,
       message_body: message,
       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" })
     });
     messagedb.save();

      io.to(roomId).emit('createMessage', {messagedb});
      
    }); 
  })
  socket.on('count', roomId =>{
    io.to(socket.id).emit('peerss', roomsMap[roomId])
  })
});


const port = process.env.PORT || 3000;
server.listen(port, () => console.info('Server is running on port', `${port}`))

//peerjs --port 443 --key peerjs --path /peerjs