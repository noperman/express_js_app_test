// const { default: mongoose } = require("mongoose")
const ErrResponse = require("./Response");

module.exports = (err,res) => {
  // if(err instanceof mongoose.Error.MongooseServerSelectionError){
    if(err.code && err.message && err.keyValue){
      err.message = ErrResponse(err.code, JSON.stringify(err.keyValue)) || "Something went wrong"
      return res.status(400).send({success: false, msg: err.message})
    }
    if(err.reason) err.message = err.reason.toString()
  // }
  return res.status(500).send({success: false, msg: err.message || "Something went wrong"})
}