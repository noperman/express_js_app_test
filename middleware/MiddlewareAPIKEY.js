'use strict'

const signature = require("../helper/signature")

const db = require("../models");
const Ecelebration = db.ecelebration

const MiddlewareAPIKEY = async (req,res,next) => {
  try{
    const {apikey} = req.query
  
    if(!apikey || apikey === '') return res.status(403).json({success:false, msg: "Apikey is required"})
  
    const msg = "Apikey tidak valid, silahkan input ulang dengan apikey valid"
    
    const data = await Ecelebration.find().select('_id')
    if(data.length <= 0){
      return res.status(403).json({success: false, msg})
    }
    
    const valid = data.map(el=>{
      if(signature.verify(el._id.toString(),apikey))
        return true
      else
        return false
    })

    if(!valid.includes(true)){
      return res.status(403).json({success: false, msg})
    }
    next()

    // if(!signature.verify(process.env.CLIENT_1,apikey)) return res.status(200).json({success:false, msg:"Apikey is required"})
    // next()
  }catch(err){    
    console.log(err)
    return res.status(500).send({success: false, msg: err.message || "Something went wrong"})
  }
}

module.exports = MiddlewareAPIKEY