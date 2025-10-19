import { Request, Response } from 'express';
import model from '../models/blogModel';

export const getAllBlogs = async (req: Request, res: Response) => {
  const blogs = await model.getAll();
  res.json(blogs);
};

export const getBlogById = async (req: Request, res: Response) => {
  const id = req.params.id;  // Keep as string
  const blog = await model.getById(id);
  if (!blog) return res.status(404).json({ error: 'Blog not found' });
  res.json(blog);
};

export const createBlog = async (req: Request, res: Response) => {
  const data = req.body;
  const requiredFields = ['slug', 'title', 'description', 'tags', 'author', 'category', 'featured', 'image', 'publishedDate', 'readTime', 'content'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }
  const newBlog = await model.create(data);
  res.status(201).json(newBlog);
};

export const updateBlog = async (req: Request, res: Response) => {
  const id = req.params.id;
  const updated = await model.update(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Blog not found' });
  res.json(updated);
};

export const deleteBlog = async (req: Request, res: Response) => {
  const id = req.params.id;
  const success = await model.delete(id);
  if (!success) return res.status(404).json({ error: 'Blog not found' });
  res.status(204).send();
};
