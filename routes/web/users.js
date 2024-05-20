const express = require("express")
const router = express.Router()
const db = require("../../models")
const { check, validationResult } = require('express-validator');
const ErrResponse = require("../../helper/error/Response");
const doCatch = require("../../helper/error/ResponseCatch");

const Users = db.users

router.get("/user/roles", async(req, res)=>{
  try{
    const userRoles = new Users
    const roles = userRoles.schema.path('roles').enumValues
    return res.send({success: true, data: roles})
  }catch(err){
    return doCatch(err,res)
  }
})

router.get("/user/:id", check('id').isAlphanumeric(), async(req, res)=>{
  try{
    /** Params Validation */
    const validationErrors = validationResult(req)
    if(!validationErrors.isEmpty()){
      return res.status(422).send({success: false, error: validationErrors.array()})
    }
    /** Params Validation */

    const {id} = req.params

    await Users.findOne({_id: id})
    .then(response=>{
      if(response === null){
        return res.send({success: false, data: null})
      }
      return res.send({success: true, data: response})
    })
    .catch(err=>{
      if(err.name) err.message = ErrResponse(err.name)
      return res.status(400).send({success: false, msg: err.message})
    })
  }catch(err){
    return res.status(500).send({success: false, msg: err.message || "Something went wrong"})
  }
})

module.exports = router