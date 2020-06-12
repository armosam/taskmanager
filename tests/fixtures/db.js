
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')


const userOneID = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneID,
    name: 'User One',
    email: 'user1@test.com',
    password: 'User123!',
    age: 40,
    status: true,
    tokens: [{
        token: jwt.sign({_id: userOneID}, process.env.JWT_SECRET)
    }]
}

const userTwoID = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoID,
    name: 'User Two',
    email: 'user2@test.com',
    password: 'User123!',
    age: 50,
    status: true,
    tokens: [{
        token: jwt.sign({_id: userTwoID}, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    title: 'Task One',
    description: 'Task One Description',
    completed: false,
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    title: 'Task Two',
    description: 'Task Two Description',
    completed: false,
    owner: userOne._id
}

const taskTree = {
    _id: new mongoose.Types.ObjectId(),
    title: 'Task Tree',
    description: 'Task Tree Description',
    completed: false,
    owner: userTwo._id
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskTree).save()
}

module.exports = {
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskTree,
    setupDatabase
}