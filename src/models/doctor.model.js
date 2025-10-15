
const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        
    },
    lastName: {
        type: String,
        required: true,

    }, 
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    createdTimestamp: {
        default: Date.now(),
        type: Date
    }
})

module.exports = mongoose.model('Doctor', DoctorSchema);