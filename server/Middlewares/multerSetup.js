import multer from 'multer';
import path from 'path';


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});


// const fileFilter = (req, file, cb) => {
//   console.log("")
//     if((file.mimetype).includes('jpeg') || (file.mimetype).includes('png') || (file.mimetype).includes('jpg')){
//         cb(null, true);
//     } else{
//         cb(null, false);
//     }
// };



const voicestorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/voice-messages';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir); // where to save the file
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Filter for file type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/wav', 'audio/mp3'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter, 
  voicestorage:voicestorage,
});

// app.post('/api/upload-voice-message', upload.single('audio'), (req, res) => {
//   const file = req.file;
//   if (!file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }
//   res.status(200).json({ message: 'File uploaded successfully', filePath: file.path });
// });

export default upload;
