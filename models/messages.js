const mongoose = require('mongoose');

var message = new mongoose.Schema({
 room: String,
 useremail: String,
 user: String,
 message_body: String,
 time: String
});


var Message = mongoose.model('Message', message);
module.exports = Message;

