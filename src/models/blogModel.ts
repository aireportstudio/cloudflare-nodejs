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
    return blog;
  },
  update: (id: number, data: Partial<Omit<Blog, 'id'>>): Blog | undefined => {
    const blog = blogs.find(b => b.id === id);
    if (blog) {
      Object.assign(blog, data);
    }
    return blog;
  },
  delete: (id: number): boolean => {
    const index = blogs.findIndex(b => b.id === id);
    if (index !== -1) {
      blogs.splice(index, 1);
      return true;
    }
    return false;
  }
};
