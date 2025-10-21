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

let blogs: Blog[] = [];
let nextId = 1;

export default function createBlogModel() {
  return {
    getAll: async (): Promise<Blog[]> => {
      return blogs;
    },

    getById: async (id: number): Promise<Blog | null> => {
      return blogs.find(b => b.id === id) || null;
    },

    create: async (data: Omit<Blog, 'id'>): Promise<Blog> => {
      const newBlog: Blog = { id: nextId++, ...data };
      blogs.push(newBlog);
      return newBlog;
    },

    update: async (id: number, data: Partial<Omit<Blog, 'id'>>): Promise<Blog | null> => {
      const index = blogs.findIndex(b => b.id === id);
      if (index === -1) return null;
      blogs[index] = { ...blogs[index], ...data };
      return blogs[index];
    },

    delete: async (id: number): Promise<boolean> => {
      const index = blogs.findIndex(b => b.id === id);
      if (index === -1) return false;
      blogs.splice(index, 1);
      return true;
    }
  };
}
