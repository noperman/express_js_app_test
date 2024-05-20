'use strict'

module.exports = (mongoose) => {
  const schema = mongoose.Schema({
    roles: {
      type: String,
      enum: ['Administrator','Member'],
      default: 'Member'
    },
    parent: String,
    fullname: String,
    email: {
      type:String,
      unique: true,
    },
    phone: {
      type:String,
      unique: true
    },
    password: String,
    avatar: String,
    referral: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationCode: String,
    apiKey: String,
  },{timestammps: true, versionKey: false})

  const User = mongoose.model("users", schema)
  return User
}