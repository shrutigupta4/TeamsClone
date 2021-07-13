const mongoose = require('mongoose');

var user = new mongoose.Schema({
    useremail: String,
    rooms: Array
});

var User = mongoose.model('User', user);
module.exports = User;
