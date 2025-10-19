import redis from '../db/redisClient';

const BLOG_LIST_KEY = 'blogs';

export interface Blog {
  id: string;
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

// Helper: ensure id is a valid non-empty string or convertible to string
function ensureStringId(id: unknown): string {
  if (typeof id === 'string' && id.trim() !== '') {
    return id;
  } else if (id != null && typeof id.toString === 'function') {
    const str = id.toString();
    if (str.trim() !== '') return str;
  }
  throw new TypeError('Invalid id: must be a non-empty string or convertible to string');
}

export default {
  getAll: async (): Promise<Blog[]> => {
    const ids = (await redis.lrange(BLOG_LIST_KEY, 0, -1)) as string[] | null;
    if (!ids || ids.length === 0) return [];

    const pipeline = redis.pipeline();
    ids.forEach(id => {
      pipeline.get(`blog:${String(id)}`);
    });
    const results = await pipeline.exec();

    return (results as Array<[any, string | null]>)
      .map(([err, val]) => (val ? JSON.parse(val) : null))
      .filter((b): b is Blog => b !== null);
  },

  getById: async (id: string): Promise<Blog | null> => {
    const validId = ensureStringId(id);
    const data: any = await redis.get(`blog:${validId}`);
    return data ? JSON.parse(data) : null;
  },

  create: async (blog: Omit<Blog, 'id'>): Promise<Blog> => {
    const id = Date.now().toString();
    const newBlog = { id, ...blog };
    await redis.set(`blog:${id}`, JSON.stringify(newBlog));
    await redis.lpush(BLOG_LIST_KEY, id);
    return newBlog;
  },

  update: async (id: string, data: Partial<Omit<Blog, 'id'>>): Promise<Blog | null> => {
    const validId = ensureStringId(id);
    const existing: any = await redis.get(`blog:${validId}`);
    if (!existing) return null;

    const blog = { ...JSON.parse(existing), ...data };
    await redis.set(`blog:${validId}`, JSON.stringify(blog));
    return blog;
  },

  delete: async (id: string): Promise<boolean> => {
    const validId = ensureStringId(id);
    const removed = await redis.del(`blog:${validId}`);
    await redis.lrem(BLOG_LIST_KEY, 0, validId);
    return removed > 0;
  }
};
