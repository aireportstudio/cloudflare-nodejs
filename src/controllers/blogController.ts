import { Request, Response } from 'express';
import createBlogModel, { Blog } from '../models/blogModel';
import { Env } from '../db/redisClient';

const env: Env = {
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL!,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN!,
};

const blogModel = createBlogModel(env);

export const getAllBlogs = async (req: Request, res: Response) => {
  const blogs = await blogModel.getAll();
  res.json(blogs);
};

export const getBlogById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const blog = await blogModel.getById(id);
  if (!blog) return res.status(404).json({ error: 'Blog not found' });
  res.json(blog);
};

export const createBlog = async (req: Request, res: Response) => {
  const data = req.body as Omit<Blog, 'id'>;
  const requiredFields: (keyof Omit<Blog, 'id'>)[] = ['slug','title','description','tags','author','category','featured','image','publishedDate','readTime','content'];
  for (const field of requiredFields) {
    if (!(field in data)) return res.status(400).json({ error: `Missing field: ${field}` });
  }
  const newBlog = await blogModel.create(data);
  res.status(201).json(newBlog);
};

export const updateBlog = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await blogModel.update(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Blog not found' });
  res.json(updated);
};

export const deleteBlog = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const success = await blogModel.delete(id);
  if (!success) return res.status(404).json({ error: 'Blog not found' });
  res.status(204).send();
};
