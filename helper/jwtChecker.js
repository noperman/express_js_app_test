'use strict'

const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, "../", "public.key"), "utf8");

const jwtChecker = (token) => {
  try{
    return jwt.verify(token, PUBLIC_KEY, { algorithms: [process.env.JWT_ALGORITHM] }, (err, payload) => {          
      if (err === null) {
        return {
          valid: true,
          msg: 'Your token was successfully validated!',
          data: payload
        }
      }else{
        try{
          const error = err.toString()
          return {
            valid: false,
            msg: error
          }
        }catch(e){  
          if (err.name === 'TokenExpiredError') {
            return {
              valid: false,
              msg: 'Whoops, your token has expired!'
            }
          }

          if (err.name === 'JsonWebTokenError') {
            return {
              valid: false,
              msg: 'That token is malformed!'
            }
          }

          return {
            valid: false,
            msg: 'Unknown error at authorized!'
          }
        }
      }
    });
  }catch(e){
    return {
      valid: false,
      msg: 'Something error at authorized!'
    }
  }
}

module.exports = jwtChecker