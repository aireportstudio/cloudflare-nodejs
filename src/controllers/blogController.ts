import { Request, Response } from 'express';
import createBlogModel, { Blog } from '../models/blogModel';
import { ensureTableExists } from '../db/db';
import upload from '../utils/multer';  // your multer config

const blogModel = createBlogModel();
let tableCreated = false;

async function prepareDB() {
  if (!tableCreated) {
    await ensureTableExists();
    tableCreated = true;
  }
}

// Helper placeholder: Upload buffer to Cloudflare R2 or other storage and return file URL
async function uploadToR2(buffer: Buffer, filename: string): Promise<string> {
  // You need to implement actual upload logics like:
  // - Initialize Cloudflare R2 client
  // - Upload file.buffer with a unique name or path
  // - Return accessible public URL
  return `${process.env.R2_BUCKET_URL}/${filename}`;
}

export const getAllBlogs = async (req: Request, res: Response) => {
  await prepareDB();
  try {
    const blogs = await blogModel.getAll();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  await prepareDB();
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid blog ID' });

  try {
    const blog = await blogModel.getById(id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

// Create blog with multer middleware for image upload
export const createBlog = [
  upload.single('image'),
  async (req: Request, res: Response) => {
    await prepareDB();

    const file = req.file;
    let imageUrl = '';

    if (file) {
      try {
        imageUrl = await uploadToR2(file.buffer, file.originalname);
      } catch {
        return res.status(500).json({ error: 'Image upload failed' });
      }
    }

    // Parse tags if sent as string
    const data = req.body as Omit<Blog, 'id'>;
    data.image = imageUrl;
    if (typeof data.tags === 'string') {
      try {
        data.tags = JSON.parse(data.tags);
      } catch {
        data.tags = [];
      }
    }

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
    } catch {
      res.status(500).json({ error: 'Failed to create blog' });
    }
  }
];

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
      } catch {
        return res.status(500).json({ error: 'Image upload failed' });
      }
    }

    const data = req.body as Partial<Omit<Blog, 'id'>>;
    data.image = imageUrl;

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
    } catch {
      res.status(500).json({ error: 'Failed to update blog' });
    }
  }
];

export const deleteBlog = async (req: Request, res: Response) => {
  await prepareDB();
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid blog ID' });

  try {
    const success = await blogModel.delete(id);
    if (!success) return res.status(404).json({ error: 'Blog not found' });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};
