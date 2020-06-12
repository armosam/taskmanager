const mongoose = require('mongoose');
const validator = require('validator'); 
const Schema = mongoose.Schema

const taskSchema = new Schema({
    title: {
        type: String, 
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: 'Description is not specified...'
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

// Middleware of Task model
/** Runs before Task model saves */
taskSchema.pre('save', async function(){
    console.debug('Task beforeSave triggered...')
})

/** Runs after Task model saves */
taskSchema.post('save', async function(){
    console.debug('Task afterSave triggered...')
})

/** Create Task model and assign taskSchema to Task model */
const Task = mongoose.model('Task', taskSchema);

module.exports = Task