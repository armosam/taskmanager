const express = require('express')
const router = new express.Router()

router.get('/', (req, res) => {

    res.status(200).send('Welcome to Task Manager')
})

router.get('/contact', (req, res) => {

    res.status(200).send('Please contact us by email address')
})

module.exports = router