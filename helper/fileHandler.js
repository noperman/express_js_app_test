'use strict'

const fs = require('fs')

const fileHandler = {
  originUpload: (path,filename,data) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(`${path}/${filename}`, data, err => {
        if (err) reject({success: false, error: err})
        resolve({success: true})
      })
    })
  },
  delete: (path,filename) => {
    return new Promise((resolve, reject) => {
      fs.unlink(`${path}/${filename}`, err => {
        if (err) reject({success: false, error: err})
        resolve({success: true})
      })
    })
  }
}

module.exports = fileHandler