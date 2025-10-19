import { Request, Response } from 'express';
import model from '../models/blogModel';

export const getAllBlogs = (req: Request, res: Response) => {
  res.json(model.getAll());
};

export const getBlogById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const blog = model.getById(id);
  if (!blog) return res.status(404).json({ error: 'Blog not found' });
  res.json(blog);
};

export const createBlog = (req: Request, res: Response) => {
  const data = req.body;
  // Simple validation: check required fields
  const requiredFields = ['slug', 'title', 'description', 'tags', 'author', 'category', 'featured', 'image', 'publishedDate', 'readTime', 'content'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }
  const newBlog = model.create(data);
  res.status(201).json(newBlog);
};

export const updateBlog = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = model.update(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Blog not found' });
  res.json(updated);
};

export const deleteBlog = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const success = model.delete(id);
  if (!success) return res.status(404).json({ error: 'Blog not found' });
  res.status(204).send();
};
