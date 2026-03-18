//Defining property/accommodation structure
//Links to user(owner)
//Stores umages, ameniities, location, price, and other details about the property
//NSFAS accreditation status and other relevant information for students


const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a property name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false, // Don't return password by default
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
    },
    university: {
        type: String,
        required: [true, 'Please select a university'],
    },
    fundingType: {
        type: String,
        enum: ['NSFAS', 'private', 'self-funded'],
        required: [true, 'Please select funding type'],
    },
    verifiedStudent: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Property', propertySchema);