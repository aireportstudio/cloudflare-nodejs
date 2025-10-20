import { getRedis, Env } from '../db/redisClient';

export interface Blog {
  id: number;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  category: string;
  featured: boolean;
  image: string;
  publishedDate: string;
  readTime: string;
  content: string;
}

export default function createBlogModel(env: Env) {
  const redis = getRedis(env);
  const BLOG_LIST_KEY = 'blogs:list';
  let nextIdKey = 'blogs:nextId';

  // Helper to generate incremental IDs
  async function getNextId(): Promise<number> {
    const id = await redis.incr(nextIdKey);
    return id;
  }

  return {
    getAll: async (): Promise<Blog[]> => {
      const cached = await redis.get<string>(BLOG_LIST_KEY);
      if (cached) return JSON.parse(cached);
      // If no cached list, build from individual keys
      const keys = await redis.keys('blogs:*');
      const blogs = [];
      for (const key of keys) {
        if (key === nextIdKey || key === BLOG_LIST_KEY) continue;
        const blogStr = await redis.get<string>(key);
        if (blogStr) blogs.push(JSON.parse(blogStr));
      }
      await redis.set(BLOG_LIST_KEY, JSON.stringify(blogs), { ex: 60 * 5 });
      return blogs;
    },

    getById: async (id: number): Promise<Blog | null> => {
      const blog = await redis.get<string>(`blogs:${id}`);
      return blog ? JSON.parse(blog) : null;
    },

    create: async (data: Omit<Blog, 'id'>): Promise<Blog> => {
      const id = await getNextId();
      const blog: Blog = { id, ...data };
      await redis.set(`blogs:${id}`, JSON.stringify(blog));
      await redis.del(BLOG_LIST_KEY); // invalidate list cache
      return blog;
    },

    update: async (id: number, data: Partial<Omit<Blog, 'id'>>): Promise<Blog | null> => {
      const key = `blogs:${id}`;
      const existing = await redis.get<string>(key);
      if (!existing) return null;
      const blog: Blog = { ...JSON.parse(existing), ...data };
      await redis.set(key, JSON.stringify(blog));
      await redis.del(BLOG_LIST_KEY);
      return blog;
    },

    delete: async (id: number): Promise<boolean> => {
      const key = `blogs:${id}`;
      const exists = await redis.get(key);
      if (!exists) return false;
      await redis.del(key);
      await redis.del(BLOG_LIST_KEY);
      return true;
    }
  };
}
