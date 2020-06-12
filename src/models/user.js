const mongoose = require('mongoose');
const validator = require('validator'); 
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')


const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true, 
        trim: true
    },
    email: {
        type: String, 
        required: true, 
        unique: true,
        trim:true, 
        lowercase: true, 
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email address is invalid.')
            }
        }        
    },
    password: {
        type: String, 
        required: true,
        trim: true, 
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain the word password...')
            }
        }        
    },
    age: {
        type: Number,
        default: null,
        min: 10, 
        max: 150
    },
    status: {
        type: Boolean,
        default: true,
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }],
    resume: {
        type: String
    },
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
})

/**
 * Virtual property in the user model that references to the task model
 * There are specifications for local and foreign fields
 */
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

/**
 * Defining toJSON method allows us to manipulate data
 * express returns in res.send() method using JSON.stringify(user)
 * So this will affect on all routers where used res.send(user)
 * In this example we remove some data from user model before sending to requester
 */
userSchema.methods.toJSON = function() {
    const user = this 
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    delete userObject.resume
    
    return userObject
}

/**
 * Generates token adds it to user's tokens, saves user and returns token as a result
 */
userSchema.methods.generateAuthToken = async function(signature) {
    const user = this
    const token = await jwt.sign( { _id: user._id },  process.env.JWT_SECRET, { expiresIn: '1 h' })
    user.tokens = user.tokens.concat({ token })
    await user.save()
    console.debug('Token generated: ' + token.trim())
    return token
}

/**
 * User class method
 * Find user by email and password credentials
 */
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: email})

    if (!user) {
        throw new Error('User cannot login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('User cannot login')
    }

    return user
}

// Middleware of User model

/**
 * Hash password for user before saving the model
 */
userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    console.debug('User beforeSave triggered')
    next()
})

/**
 * Runs before remove of user and deletes all assigned tasks
 */
userSchema.pre('remove', async function(next) {
    const user = this
    console.debug(user)
    await Task.deleteMany({ owner: user._id })
    next()
})

/**
 * Runs after save of user model
 */
userSchema.post('save', async function(doc, next){
    console.debug('User afterSave triggered', doc)
    next()
})

/** Creates User model and assigns userSchema to the User model */
const User = mongoose.model('User', userSchema);

module.exports = User