'use strict'

require('dotenv').config()
const { default: mongoose } = require("mongoose")

mongoose.set('strictQuery', true);
const db = {}
db.mongoose = mongoose
db.url = process.env.MONGGO_DB_URL
db.users = require('./users')(mongoose)
db.bankMasters = require('./bankMasters')(mongoose)

module.exports = db