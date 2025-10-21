import { Request, Response } from 'express';
import createBlogModel, { Blog } from '../models/blogModel';
import { ensureTableExists } from '../db/db';
import upload from '../utils/multer';
import { uploadToR2, deleteFromR2 } from '../utils/r2Client';

const blogModel = createBlogModel();
let tableCreated = false;

// Ensure table exists
async function prepareDB() {
  if (!tableCreated) {
    await ensureTableExists();
    tableCreated = true;
  }
}

// ------------------- GET ALL BLOGS -------------------
export const getAllBlogs = async (req: Request, res: Response) => {
  await prepareDB();
  try {
    const blogs = await blogModel.getAll();
    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

// ------------------- GET BLOG BY ID -------------------
export const getBlogById = async (req: Request, res: Response) => {
  await prepareDB();
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid blog ID' });

  try {
    const blog = await blogModel.getById(id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

// ------------------- CREATE BLOG -------------------
export const createBlog = [
  upload.single('image'),
  async (req: Request, res: Response) => {
    await prepareDB();

    const file = req.file;
    let imageUrl = '';

    if (file) {
      try {
        imageUrl = await uploadToR2(file.buffer, file.originalname);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Image upload failed' });
      }
    }

    const data = req.body as Omit<Blog, 'id'>;
    data.image = imageUrl;

    // Parse tags if sent as string
    if (typeof data.tags === 'string') {
      try {
        data.tags = JSON.parse(data.tags);
      } catch {
        data.tags = [];
      }
    }

    // Validate required fields
    const requiredFields: (keyof Omit<Blog, 'id'>)[] = [
      'slug', 'title', 'description', 'tags', 'author',
      'category', 'featured', 'image', 'publishedDate',
      'readTime', 'content'
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    try {
      const newBlog = await blogModel.create(data);
      res.status(201).json(newBlog);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create blog' });
    }
  }
];

// ------------------- UPDATE BLOG -------------------
export const updateBlog = [
  upload.single('image'),
  async (req: Request, res: Response) => {
    await prepareDB();

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid blog ID' });

    const existingBlog = await blogModel.getById(id);
    if (!existingBlog) return res.status(404).json({ error: 'Blog not found' });

    const file = req.file;
    let imageUrl = existingBlog.image;

    if (file) {
      try {
        imageUrl = await uploadToR2(file.buffer, file.originalname);
        // Optionally delete old image
        if (existingBlog.image) await deleteFromR2(existingBlog.image);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Image upload failed' });
      }
    }

    const data = req.body as Partial<Omit<Blog, 'id'>>;
    data.image = imageUrl;

    // Parse tags if sent as string
    if (data.tags && typeof data.tags === 'string') {
      try {
        data.tags = JSON.parse(data.tags);
      } catch {
        data.tags = existingBlog.tags;
      }
    }

    try {
      const updated = await blogModel.update(id, data);
      if (!updated) return res.status(404).json({ error: 'Blog not found' });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update blog' });
    }
  }
];

// ------------------- DELETE BLOG -------------------
export const deleteBlog = async (req: Request, res: Response) => {
  await prepareDB();

  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid blog ID' });

  const existingBlog = await blogModel.getById(id);
  if (!existingBlog) return res.status(404).json({ error: 'Blog not found' });

  try {
    // Delete image from R2 if exists
    if (existingBlog.image) await deleteFromR2(existingBlog.image);

    const success = await blogModel.delete(id);
    if (!success) return res.status(404).json({ error: 'Blog not found' });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};
