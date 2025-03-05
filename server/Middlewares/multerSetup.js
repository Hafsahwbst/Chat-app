import multer from 'multer';
import path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

const voicestorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/voiceMessages");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const voiceUpload = multer({
  storage: voicestorage,
});


export default upload ;
