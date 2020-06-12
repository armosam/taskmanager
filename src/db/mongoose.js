const mongoose = require('mongoose');
const endpoint = process.env.ENDPOINT

mongoose.connect(endpoint, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});