import multer from 'multer';

// Use memory storage because Workers have no filesystem
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // Limit file size to 1MB
  },
});

export default upload;
