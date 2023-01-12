const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Data', dataSchema);