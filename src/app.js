const express = require('express')
require('./db/mongoose')
const siteRouter = require('./routers/site')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

// Middleware of express
app.use((req, res, next) => {
    //res.status(503).send('Site is under maintenance.')
    next()
    // console.log(req.method, req.path)
    // if(req.method === 'GET'){
    //     res.send('Get request is not allowed!')
    // } else {
    //     next()
    // }
})

app.use(express.json())
app.use(siteRouter)
app.use(userRouter)
app.use(taskRouter)

module.exports = app
