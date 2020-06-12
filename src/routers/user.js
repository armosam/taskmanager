const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer') // File upload support
const sharp = require('sharp') // Manipulate uploaded file
const fs = require('fs');
const { sendAccountCreatedEmailNotification, sendAccountUpdatedEmailNotification, sendAccountRemovedEmailNotification } = require('../email/account')



router.post('/users/login', async (req, res) => {
    try {
        const user  = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken(process.env.JWT_SECRET)

        res.status(200).send({user, token})
    } catch(e) {
        console.log(e)
        res.status(404).send({code: 404, msg: e.message})
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.status(200).send({code: 200, msg: 'Usee logged out'})
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send({code: 200, msg: 'All users logged out'})
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        const token = await user.generateAuthToken(process.env.JWT_SECRET)
        await user.save()
        sendAccountCreatedEmailNotification(user.email, user.name)
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        return res.status(400).send({code: 400, msg: 'Invalid update'})
    }

    try {
        // update user from request and save your date
        updates.forEach((field) => { req.user[field] = req.body[field] })

        // We are using save here as we have preSave() middleware
        await req.user.save()
        sendAccountUpdatedEmailNotification(req.user.email, req.user.name)
        res.status(200).send(req.user)

    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        req.user.remove()
        sendAccountRemovedEmailNotification(req.user.email, req.user.name)
        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Upload middleware for avatar endpoint
// It returns file buffer as Binary to be saved in the database
const avatarUpload = multer({

    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        
        const allowedTypes = ['image/jpg', 'image/png', 'image/jpeg' ]
        
        if(!allowedTypes.includes(file.mimetype)){
            cb(new Error('File must be png, jpg, jpeg format'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, avatarUpload.single('file'), async (req, res) => {
    
    const buffer = await sharp(req.file.buffer).resize({ width: 800, height: 600 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    sendAccountUpdatedEmailNotification(req.user.email, req.user.name)
    res.status(200).send('Avatar successfully uploaded')

}, (err, req, res, next) => {  // Error handler of multer
    res.status(415).send({code: 415, msg: err.message})
    next()
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        sendAccountUpdatedEmailNotification(req.user.email, req.user.name)
        res.status(200).send({code: 200, msg: 'Avatar successfully removed'})
    } catch (e) {
        res.status(500).send({code: 500, msg: e.message})
    } 
})

router.get('/users/me/avatar', auth, (req, res) => {
    
    try {
        if(!req.user.avatar){
            throw new Error('User avatar not found')
        }

        res.set('Content-Type', 'image/png')
        res.status(200).send(req.user.avatar)
    } catch (e) {
        res.status(404).send({code: 404, msg: e.message})
    }
})

// Upload middleware for resume endpoint
// It returns file that should be saved in the file system (uploads/resume/)
const resumeUpload = multer({
    dest: 'uploads/resume/',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        
        const allowedTypes = ['application/pdf', 'application/doc', 'plain/text' ]
        
        if(!allowedTypes.includes(file.mimetype)){
            cb(new Error('File must be in PDF format'))
        }
        cb(undefined, true)
    }
})

router.post('/user/me/resume', auth, resumeUpload.single('file'), async (req, res) => {

    req.user.resume = req.file.path
    await req.user.save()
    sendAccountUpdatedEmailNotification(req.user.email, req.user.name)
    res.status(200).send('Resume successfully uploaded')

}, (err, req, res, next) => {  // Error handler
    res.status(415).send({code: 415, msg: err.message})
    next()   
})

router.delete('/users/me/resume', auth, (req, res) => {
    try {
        fs.unlink(req.user.resume, async (err) => {
            if (err) {
                throw new Error('File net found to be removed from file system')
            };
            
            req.user.resume = undefined
            await req.user.save()
            sendAccountUpdatedEmailNotification(req.user.email, req.user.name)
            res.status(200).send({code: 200, msg: 'Resume successfully removed'})
          });
    } catch (e) {
        res.status(500).send({code: 500, msg: e.message})
    }
})

router.get('/users/me/resume', auth, (req, res) => {
    try {
        if(!req.user.resume){
            throw new Error('User resume not found')
        }

        fs.readFile(req.user.resume, (err, data) => {
            if(err) {
                throw new Error(err.message)
            }

            res.set('Content-Type', 'application/pdf')
            res.status(200).send(data)
        })

    } catch (e) {
        res.status(404).send({code: 404, msg: e.message})
    }
})

router.get('/users', auth, async (req, res) => {
    
    try {
        // We can check user access rights here
        const users = await User.find({})
        if (!users) {
            return res.status(404).send({code: 404, msg: 'Data not found'})
        }
        res.status(200).send(users)
    } catch (e){
        res.status(500).send(e)
    }
})

router.get('/users/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send({code: 404, msg: 'Data not found'})   
        }
        res.status(200).send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/:id/avatar', async (req, res) => {

    try {
        const _id = req.params.id
        const user = await User.findById(_id)
        if(!user || !user.avatar){
            throw new Error('User or User Avatar not found')
        }

        res.set('Content-Type', 'image/png')
        res.status(200)
        res.send(user.avatar)

    } catch (e) {
        res.status(404).send({code: 404, msg: e.message})
    }
})

router.get('/users/:id/resume', async (req, res) => {
    try {
        const _id = req.params.id
        const user = await User.findById(_id)
        if(!user || !user.resume){
            throw new Error('User or User Resume not found')
        }
        
        fs.readFile(user.resume, (err, data) => {
          
            if(err) {
                throw new Error(err.message)
            }

            res.set('Content-Type', 'application/pdf')
            res.status(200)
            res.send(data)
        })

    } catch (e) {
        res.status(404).send({code: 404, msg: e.message})
    }
})

router.patch('/users/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        return res.status(400).send({code: 400, msg: 'Invalid update'})
    }

    try {
        const user = await User.findById(req.params.id)

        // update user from request and save your date
        updates.forEach((update) => { user[update] = req.body[update] })

        // We are using save here as we have preSave() middleware
        await user.save()

        if (!user) {
            return res.status(404).send({code: 404, msg: 'Data not fund'})
        }
        sendAccountUpdatedEmailNotification(user.email, user.name)
        res.status(200).send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/:id', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(404).send({code: 404, msg: 'Data not found'})
        }
        sendAccountRemovedEmailNotification(user.email, user.name)
        res.status(200).send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router