var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const doCatch = require("../../helper/error/ResponseCatch");

const db = require("../../models")
const Users = db.users
/** AUTHENTICATION TOOLS */
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, "../../", "private.key"), "utf8");

const { default: phone } = require("phone");
const randomString = require('../../helper/randomString');

const { default: axios } = require("axios")

router.post('/signin', 
  check('email').isEmail().withMessage('Email tidak valid'),
  check('password').isLength({min: 6, max: 20}).withMessage('Password tidak kurang dari 6 karakter dan tidak lebih dari 20 karakter'),
  async (req, res, next)  => {
    try{
      /** Params Validation */
      const validationErrors = validationResult(req)
      if(!validationErrors.isEmpty()){
        return res.status(422).send({success: false, error: validationErrors.array()})
      }
      /** Params Validation */
    
      const {body} = req
      const authMsg = "Autentikasi gagal, perikas kembali email dan password anda"
      body.email = body.email.toLowerCase()
    
      const user = await Users.findOne({email: body.email})
      if(user === null) return res.send({success: false, msg: authMsg})
      if(!bcrypt.compareSync(body.password,user.password)) return res.send({success: false, msg: authMsg})

      const data = {
        'isLoggedIn' : true,
        'id' : user._id,
        'avatar' : user.avatar,
        'fullname' : user.fullname,
        'isVerified' : user.isVerified,
        'role' : user.roles
      };
    
      const token = jwt.sign(data, PRIVATE_KEY, {
        algorithm: process.env.JWT_ALGORITHM,
        expiresIn: process.env.JWT_SECURITY_AGE
      });
    
      return res.send({success: true, token})
  }catch(err){
    return res.status(500).send({success: false, msg: err.message || "Something went wrong"})
  }
})

router.post('/signup',
check('fullname').isString().isLength({min: 3, max: 50}).withMessage('Nama lengkap tidak kurang dari 3 karakter dan tidak lebih dari 50 karakter'),  
check('email').isEmail().withMessage('Email harus valid'),
check('phone').isMobilePhone('id-ID').withMessage('Nomor telpon tidak valid'),
check('password').isLength({min: 6, max: 20}).withMessage('Password tidak kurang dari 6 karakter dan tidak lebih dari 20 karakter'),
async(req,res)=>{
  try{
    /** Params Validation */
    const validationErrors = validationResult(req)
    if(!validationErrors.isEmpty()){
      return res.status(422).send({success: false, error: validationErrors.array()})
    }
    /** Params Validation */
    const {body} = req
  
    body.verificationCode = randomString(6,'0123456789')
    body.password = bcrypt.hashSync(body.password,10)
  
    const phoneCheck = phone(body.phone.toString(), { country: "ID" })
    if(!phoneCheck.isValid) return res.status(422).json({success: false, msg: 'Nomor telepon tidak valid'})
    body.phone = phoneCheck.phoneNumber.replace('+','')
    body.isVerified = false
  
    const user = new Users(body)
    user.email = user.email.toLowerCase()
    const userSaved = await user.save()
    
    // const verificationKey = await signature.generate(userSaved._id.toString())
    const msg =  `Kode verifikasi anda *${userSaved.verificationCode}* gunakan kode ini untuk memverifikasi pendaftaran anda pada laman dibawah ini: 

${process.env.CLIENT_HOME_PAGE}verifikasi/${userSaved._id.toString()}

Jika anda tidak meminta verifikasi, abaikan pesan ini atau hubungi kami dengan membalas pesan ini.`
    
    return await axios({
      method: 'POST',
      url: process.env.WAGATEWAY_URL+'sendMessage/'+process.env.WAGATEWAY_PHONE,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        apikey: process.env.WAGATEWAY_APIKEY
      },
      data: {
        to: user.phone,
        message: msg
      }
    }).then(async resWA=>{
      if(!resWA.data.succes){
        /** Cancel signup */
        await Users.deleteOne({_id : userSaved._id.toString()});
        const msg = resWA.data.msg || 'Undefined'
        return res.send({success: false, msg})
      }
    
      const data = {
        'isLoggedIn' : true,
        'id' : userSaved._id,
        'avatar' : userSaved.avatar,
        'fullname' : userSaved.fullname,
        'isVerified' : userSaved.isVerified,
        'role' : userSaved.roles
      };
    
      const token = jwt.sign(data, PRIVATE_KEY, {
        algorithm: process.env.JWT_ALGORITHM,
        expiresIn: process.env.JWT_SECURITY_AGE
      });
    
      return res.send({success: true, token})
    }).catch(async errWA=>{
      /** Cancel signup */
      await Users.deleteOne({_id : userSaved._id.toString()});
      
      let status = 500
      let msg = 'Internal server error'
      if(errWA.response){
        status = errWA.response.status
        msg = errWA.response.statusText
      }
      return res.status(status).json({success: false, msg})
    })
  }catch(err){
    return doCatch(err,res)
  }
})

router.post('/signup/verification/:id',
check('id').isAlphanumeric(),
async(req,res)=>{
  try{
    /** Params Validation */
    const validationErrors = validationResult(req)
    if(!validationErrors.isEmpty()){
      return res.status(422).send({success: false, error: validationErrors.array()})
    }
    /** Params Validation */
    const {otp} = req.body
    const {id} = req.params

    const user = await Users.findOne({_id: id, verificationCode: otp, isVerified: false})

    if(user === null){
      return res.send({success: false})
    }
    
    user.isVerified = true
    const userSaved = await user.save()
    
    const data = {
      'isLoggedIn' : true,
      'id' : userSaved._id,
      'avatar' : userSaved.avatar,
      'fullname' : userSaved.fullname,
      'isVerified' : userSaved.isVerified,
      'role' : userSaved.roles
    };
  
    const token = jwt.sign(data, PRIVATE_KEY, {
      algorithm: process.env.JWT_ALGORITHM,
      expiresIn: process.env.JWT_SECURITY_AGE
    });
  
    return res.send({success: true, token})
  }catch(err){
    return doCatch(err,res)
  }
})

module.exports = router;