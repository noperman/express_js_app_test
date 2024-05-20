const express = require('express');
const router = express.Router();
const db = require("../../models");
const { check, validationResult } = require('express-validator');
const BankMaster = db.bankMasters
const doCatch = require("../../helper/error/ResponseCatch");

const multer = require('multer');
const maxSize = 1024*200; // 200 KB
const allowedMimeType = ['image/jpeg','image/jpg','image/png','image/svg+xml']

router.get("/bank-master", async(req, res)=>{
  try{
    const data = await BankMaster.find()
    return res.status(200).send({success: true, data})
  }catch(err){
    return doCatch(err,res)
  }
})

router.post("/bank-master", async(req,res)=>{
  try{    
    const upload = multer({limits: { fileSize: maxSize }}).single('logo');

    return upload(req, res, async (err) => {
      const {body} = req
      if(!body.name || body.name === '' || body.name == null) return res.send({success: false, msg: 'Periksa kembali parameter'})

      if (err || err instanceof multer.MulterError) {
        const msg = err.toString().split(':')[1].trim() || "Tidak diketahui, upload file gagal"
        return res.status(422).json({success: false, msg: msg})
      }

      if(!allowedMimeType.includes(req.file.mimetype)) return res.send({success: false, msg: 'File tidak didukung'}) 

      // Everything went fine.
      const base64data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      const dataToSave = new BankMaster({
        name: body.name,
        code: body.code,
        logo: base64data
      })

      await dataToSave.save()
      return res.status(200).json({success: true, msg: 'Berhasil'})
    })
  }catch(err){
    return doCatch(err,res)
  }
})

router.patch("/bank-master/:id", 
  check('id').isAlphanumeric(),
async(req,res)=>{
  try{
    /** Params Validation */
    const validationErrors = validationResult(req)
    if(!validationErrors.isEmpty()){
      return res.status(422).send({success: false, error: validationErrors.array()})
    }
    const {id} = req.params

    const bankMaster = await BankMaster.findOne(
      {_id: id}
    )

    const upload = multer({limits: { fileSize: maxSize }}).single('logo');

    return upload(req, res, async (err) => {
      const {body} = req
      if(!body.name || body.name === '' || body.name == null) return res.send({success: false, msg: 'Periksa kembali parameter'})

      if (err || err instanceof multer.MulterError) {
        const msg = err.toString().split(':')[1].trim() || "Tidak diketahui, upload file gagal"
        return res.status(422).json({success: false, msg: msg})
      }

      if(req.file && !allowedMimeType.includes(req.file.mimetype)) return res.send({success: false, msg: 'File tidak didukung'}) 

      bankMaster.name = body.name
      bankMaster.code = body.code

      if(req.file) bankMaster.logo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`

      await bankMaster.save()
      return res.status(200).json({success: true, msg: 'Berhasil'})
    })
  }catch(err){
    return doCatch(err,res)
  }
})

router.delete("/bank-master/:id", 
  check('id').isAlphanumeric(),
async(req,res)=>{
  try{
    /** Params Validation */
    const validationErrors = validationResult(req)
    if(!validationErrors.isEmpty()){
      return res.status(422).send({success: false, error: validationErrors.array()})
    }
    const {id} = req.params

    const record = await BankMaster.findOne(
      {_id: id}
    )
    
    await record.remove();

    return res.send({success: true, msg: 'Berhasil'})
  }catch(err){
    return doCatch(err,res)
  }
})

module.exports = router