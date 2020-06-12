const jwt = require('jsonwebtoken')
const User = require('../models/user')


// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token  = await req.header('Authorization').replace('Bearer ', '').trim()
        console.debug('We have got token:', token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.debug('We have decoded:', decoded)
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
        
        if (!user) {
            console.log('User not found')
            throw new Error()
        }
        console.log('We have got user:', user)
        req.token = token
        req.user = user
        next()
    } catch (e) {
        console.log('Not authorized request')
        res.status(401).send({code: 401, msg: 'Unauthorized request'})
    }
}

module.exports = auth