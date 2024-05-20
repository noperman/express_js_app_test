'use strict'

module.exports = (mongoose) => {
  const schema = mongoose.Schema({    
    name: String,
    code: String,
    logo: String,
  },{timestammps: true, versionKey: false})

  const bankMaster = mongoose.model("bankMasters", schema)
  return bankMaster
}