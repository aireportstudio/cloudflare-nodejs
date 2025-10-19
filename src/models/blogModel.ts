import redis from "../db/redisClient";

interface Blog {
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

let blogs: Blog[] = [];
let nextId = 1;

export default {
  getAll: (): Blog[] => blogs,
  getById: (id: number): Blog | undefined => blogs.find(b => b.id === id),
  create: (data: Omit<Blog, 'id'>): Blog => {
    const blog = { id: nextId++, ...data };
    blogs.push(blog);
    redis.set(`blog:${blog.id}`, JSON.stringify(blog));
    return blog;
  },
  update: async (id: string, data: Partial<Omit<Blog, 'id'>>): Promise<Blog | null> => {
    // Fetch existing blog from Redis
    const json: any = await redis.get(`blog:${id}`);
    if (!json) return null;

    // Parse JSON to object
    const blog: Blog = JSON.parse(json);

    // Merge and update fields
    Object.assign(blog, data);

    // Save back updated blog object as JSON string to Redis
    await redis.set(`blog:${id}`, JSON.stringify(blog));

    return blog;
  },
  delete: async (id: string): Promise<boolean> => {
    // Delete blog data key
    const removed = await redis.del(`blog:${id}`);

    // Remove blog ID from the blog list
    await redis.lrem('blogs', 0, id);

    // removed is number of keys deleted (0 or 1)
    return removed > 0;
  }
};
