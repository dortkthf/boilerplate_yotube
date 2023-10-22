const express = require('express');
const router = express.Router();
// const { Video } = require("../models/Video");
const path = require('path')
const { auth } = require("../middleware/auth");
const multer = require('multer');
const { error } = require('console');

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, 'uploads/');
    },
    filename: (req,file,cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

const fileFilter = (req,file,cb) => {
    if(file.mimetype == 'video/mp4') {
        cb(null, true)
    } else{
        cb({msg:'mp4 파일만 업로드 가능합니다.'})
    }
    }


const upload = multer({storage: storage, fileFilter: fileFilter}).single('file');

//=================================
//             User
//=================================

router.post('/uploadfiles', (req, res) => {
    // 비디오를 서버에 저장한다.
    upload(req,res, err => {
        if(err) {
            return res.status(400).json({success: false, error: err.msg});
        } else{
            return res.json({success:true, filePath:res.req.file.path, fileName: res.req.file.filename})
        }
    })
})

module.exports = router;
