import express from 'express';
import {
  getAllBlogs,
  getBlogById,
  createBlog,   // Note: this is an array with multer + handler
  updateBlog,   // Also array with multer + handler
  deleteBlog
} from '../controllers/blogController';

const router = express.Router();

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/', createBlog);      // Accepts multipart form with 'image'
router.put('/:id', updateBlog);    // Accepts multipart form with optional 'image'
router.delete('/:id', deleteBlog);

export default router;
