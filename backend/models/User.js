const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'landlord'],
      default: 'student',
    },
    university: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    yearOfStudy: {
      type: String,
      trim: true,
    },
    fundingType: {
      type: String,
      enum: ['NSFAS', 'Private', 'Self-funded'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Student living preference
    livingPreference: {
      type: String,
      enum: ['individual', 'shared', 'noPreference'],
      default: 'noPreference',
    },
    // Landlord profile fields (captured via onboarding wizard)
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    avatar: { type: String }, // URL (Cloudinary or data URL)
    city: { type: String, trim: true },
    province: { type: String, trim: true },
    propertyType: { type: String, trim: true },
    numberOfProperties: { type: String, trim: true },
    idNumber: { type: String, trim: true },
    profileComplete: { type: Boolean, default: false },

    // Invite system
    inviteToken: { type: String, select: false },
    inviteTokenExpiry: { type: Date },
    isInvited: { type: Boolean, default: false },
    passwordSet: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
