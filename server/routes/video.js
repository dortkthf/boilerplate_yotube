const express = require('express');
const router = express.Router();
const { Video } = require("../models/Video");
const path = require('path')
const { auth } = require("../middleware/auth");
const multer = require('multer');
const { error } = require('console');
const ffmpeg = require('fluent-ffmpeg');


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
            return res.json({success:true, url:res.req.file.path, fileName: res.req.file.filename})
        }
    })
})

router.post('/uploadVideo', (req, res) => {
    // 비디오 정보를 저장한다.
    const video = new Video(req.body)

    video.save()
    .then((doc)=> {
        res.status(200).json({success:true})
    })
    .catch((err) => {
        return res.json({success:false, err})
    })
})

router.post('/thumbnail', (req, res) => {
    // 썸네일 생성 하고 비디오 러닝타임도 가져오기

    let filePath = ''
    let fileDuration = ''
    // 비디오 정보 가져오기
    ffmpeg.ffprobe(req.body.url, function(err, metadata) {
        console.dir(metadata);
        console.log(metadata.format.duration);
        fileDuration = metadata.format.duration
    })
    // 썸네일 생성
    ffmpeg(req.body.url)
    .on('filenames', function (filenames) {
        console.log('will generate' + filenames.join(', '))
        console.log(filenames)

        filePath = 'uploads/thumbnails/' + filenames[0]
    })
    .on('end', function() {
        console.log('screenshots taken');
        return res.json({ success:true, url: filePath, fileDuration:fileDuration})
    })
    .on('error', function(err) {
        console.error(err)
        return res.json({success:false, err})
    })
    .screenshots({
        count:3,
        folder: 'uploads/thumbnails',
        size:'320x240',
        filename:'thumbnail-%b.png'
    })
})

module.exports = router;
