'use strict'

const jwtChecker = require('../helper/jwtChecker');

const MiddlewareAuth = (req,res,next) => {
  try{
    // const signupVerification = req.originalUrl.split('/')
    if(['/api/v1/signin','/api/v1/signup','/api/v1/signup/verification'].includes(req.originalUrl)) return next()

    const {token} = req.query
    const tokenChecker = jwtChecker(token)
    if(!tokenChecker.valid) return res.status(403).json({success: false, msg: tokenChecker.msg || 'Something went wrong during token validate'})

    return next()
  }catch(err){    
    return res.status(500).send({success: false, msg: err.message || "Something went wrong"})
  }
}

module.exports = MiddlewareAuth 