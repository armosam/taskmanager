const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskTree,
    setupDatabase
} = require('../tests/fixtures/db')


beforeEach( setupDatabase )


afterEach( () => {
    console.debug('Tear Down After Task test')
})

test('Should create a new task for userTwo', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}` )
        .send({
            title: 'Hello Node',
            description: 'Description for task 1'
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.title).toEqual('Hello Node')
    expect(task.description).toEqual('Description for task 1')
    expect(task.completed).toBe(false)
})

test('Should fetch own two tasks (for user one)', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    expect(response.body).not.toBeNull()
    expect(response.body.length).toBe(2)
    expect(response.body[0].owner).toEqual(userOne._id.toHexString())
    expect(response.body[1].owner).toEqual(userOne._id.toHexString())
})

test('Should delete own task for logged in user', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
})

test('Should not delete not own task for logged in user', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskTree._id.toHexString()}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskTree._id)
    expect(task).not.toBeNull()
})

test('Should update own task data for logged in user', async () => {
    const taskBefore = await Task.findById(taskTwo._id)
    const response = await request(app)
        .patch(`/tasks/${taskTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: true
        })
        .expect(200)

    const taskAfter = await Task.findById(taskTwo._id)
    expect(taskBefore).not.toEqual(taskAfter)
    expect(taskBefore.completed).not.toEqual(taskAfter.completed)
    expect(taskBefore.completed).toEqual(false)
    expect(taskAfter.completed).toEqual(true)
})

test('Should not update not own task for logged in user', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskTree._id.toHexString()}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: true
        })
        .expect(404)
        
    const task = await Task.findById(taskTree._id)
    expect(task.completed).not.toEqual(true)
})

