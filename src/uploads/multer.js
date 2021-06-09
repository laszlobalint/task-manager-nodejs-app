const multer = require('multer');

const upload = multer({
  fileFilter(req, file, cb) {
    if (file.originalname.match(/\.(jpg|jpeg|gif|png)$/)) return cb(undefined, true);

    cb(new Error('Please, upload an image file!'));
  },
  limits: {
    fileSize: 1500000,
  },
});

module.exports = upload;
