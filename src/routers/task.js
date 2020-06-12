const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

/** GET /tasks?completed=true */
/** GET /tasks?limit=5&skip=0 */
/** GET /tests?sortBy=createdAt:desc */
router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}

    /** collects query params for filter completed */
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    /** Collect query params for sorting */
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    
    try {
        /** This gets related tasks for logged in user with some filters, pagination and ordering */
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        
        if (req.user.tasks.length === 0) {
            return res.status(404).send({code: 404, msg: 'Data not found'})
        }
        res.status(200).send(req.user.tasks)    
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id: _id, owner: req.user._id})

        if (!task) {
            return res.status(404).send({code: 404, msg: 'Data not found'})
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'description', 'completed']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        return res.status(400).send({code: 400, msg: 'Invalid update'})
    }

    try {

        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send({code: 404, msg: 'Data not fund'})
        }

        updates.forEach((update) => { task[update] = req.body[update] })
        task.save()

        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send({code: 404, msg: 'Data not found'})
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router