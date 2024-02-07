require('dotenv').config({ debug: true });

const express = require('express') 
const app = express()
const cors = require('cors'); 
const userRouter = require('./routers/user') 
const studygroupRouter = require('./routers/studygroup') 
const notificationRouter = require('./routers/notification') 

const port = process.env.PORT || 3000
require('./db/mongoose')

app.get('', (req, res) => {
    res.send("What's up, Dr. McGregor!")
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

app.use(cors()) 
app.use(function (req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    next(); 
}); 

app.use(express.json()) 
app.use(userRouter) 
app.use(notificationRouter)
app.use(studygroupRouter)