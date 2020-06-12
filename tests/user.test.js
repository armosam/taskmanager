const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {
    userOne,
    userTwo,
    setupDatabase
} = require('../tests/fixtures/db')


beforeEach( setupDatabase )


afterEach( () => {
    console.debug('Tear Down After User test')
})

test('Should sign up a new user account', async () => {
    
    const response = await request(app)
        .post('/users')
        .send({
            name: 'New User',
            email: 'a@a.am',
            password: 'User123!',
            age: 40
        })
        .expect(201)

    expect(response.body.user.email).toEqual('a@a.am')
    expect(response.body.user.name).toEqual('New User')
    expect(response.body.user.age).toEqual(40)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
})

test('Should login to existing user account', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)

    const user = await User.findById(userOne._id)
    expect( response.body.token ).toEqual( user.tokens[1].token )
})

test('Should return a list of existing users', async () => {
    const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userTwo._id)
    // Asserting that response.body is:
    // 1. an array 
    // 2. that contains an object
    // 3. that object has name, email and age properties with values 
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                name: user.name,
                email: user.email,
                age: user.age
            })
        ])
    )
})

test('Should return a profile of logged in user', async () => {
    const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOne._id)
    expect(response.body).toEqual(
        expect.objectContaining({
            name: user.name,
            email: user.email,
            age: user.age,
            status: user.status
        })
    )
})

test('Should upload avatar of logged in user', async () => {
    const response = await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .attach('file', 'tests/fixtures/images/avatar1.jpg')
        .expect(200)
    
    const user = await User.findById(userTwo._id)
    expect(user.avatar).not.toBeUndefined()
    expect(user.avatar).not.toBeNull()
})

test('Should delete avatar of logged in user', async () => {
    const response = await request(app)
        .delete('/users/me/avatar')
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userTwo._id)
    expect(user.avatar).not.toBeNull()
})

test('Should not delete avatar for not logged user', async () => {
    const response = await request(app)
        .delete('/users/me/avatar')
        .send()
        .expect(401)
})

test('Should update data of logged in user', async () => {
    
    const userBefore = await User.findById(userTwo._id)
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            name: 'Changed by user'
        })
        .expect(200)

    const userAfter = await User.findById(userTwo._id)
    expect(userBefore).not.toEqual(userAfter)
    expect(userBefore.name).toBe(userTwo.name)
    expect(userAfter.name).not.toBe(userTwo.name)
    expect(userAfter.name).toBe('Changed by user')
})
