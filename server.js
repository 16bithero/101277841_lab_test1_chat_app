const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const mongoose = require('mongoose');
const UserModel = require('./models/UserListModel');
const MessageModel = require('./models/UserListModel');

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const rooms = { }
const usernames = { }


mongoose.connect('mongodb+srv://101277841_Renzzi:qw12345@cluster0.prgemqj.mongodb.net/ChatApp?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(success => {
  console.log('Success Mongodb connection')
}).catch(err => {
  console.log('Error Mongodb connection')
});

app.get('/', (req, res) => {
  res.render('homepage')
})

app.get('/loginLink', (req, res) => {
  res.render('login')
})

app.get('/signupLink', (req, res) => {
  res.render('signup')
})

app.get('/roomPages', (req, res) => {
  res.render('index', { rooms: rooms })
})

app.post('/signup', async (req,res) => {
  var username = req.body.username
  var firstname = req.body.firstname
  var lastname = req.body.lastname
  var password = req.body.password

  var data = {
      "username": username,
      "firstname": firstname,
      "lastname": lastname,
      "password": password
  }


  const user = new UserModel(data);
  try {
      await user.save((err) => {
        if(err){
          res.render('errorSign')
        }else{
          res.render('login')
        }
      });
    } catch (err) {
      res.status(500).send(err);
    }
})

app.post("/login", async(req,res) =>{
  var username = req.body.username
  var password = req.body.password

  //Responses
  const noUser = {
      "status": false,
      "message": "No user with the username found in the database."
  }
  
  const wrongPass = {
      "status": false,
      "message": "Invalid password. Check and try again."
  }

  const validLogin = {
      "status": true,
      "message": "Login Success."
  }
  const validUser = await UserModel.findOne({ username })
  try {
      if(!validUser) {
        return res.render('errorLogin')
      }
      !validUser.comparePassword(password, (error, match) => {
          if(!match) {
            return res.render('errorLogin')
          }
      });
      res.render('index', { rooms: rooms, name: usernames })
  } catch (error) {
      res.status(400).send(error);
  }
})

app.post('/messages', async (req,res) => {
  var from_user = req.body.username
  var room = req.body.room
  var message = req.body.message

  var msg = {
    "from_user": from_user,
    "room": room,
    "message": message
}

  const sendMsg = new MessageModel(msg)
  try {
    await sendMsg.save((err) => {
      if(err){
        console.log(err)
      }else{
        io.emit('chat-message', msg)
      }
    });
  } catch (err) {
    res.status(500).send(err);
  }
})


app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {} }
  res.redirect(req.body.room)
  // Send message that new room was created
  io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render('room', { roomName: req.params.room })
})

server.listen(3000)


io.on('connection', socket => {
  socket.on('new-user', (room, name) => {
    socket.join(room)
    rooms[room].users[socket.id] = name
    socket.to(room).broadcast.emit('user-connected', name)
  })
  socket.on('send-chat-message', (room, message) => {
    socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}