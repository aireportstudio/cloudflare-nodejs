import { sql } from '../db/db';

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

export default function createBlogModel() {
  return {
    getAll: async (): Promise<Blog[]> => {
      const result = await sql`SELECT * FROM blogs ORDER BY id DESC;`;
      return result as Blog[];
    },

    getById: async (id: number): Promise<Blog | null> => {
      const result = await sql`SELECT * FROM blogs WHERE id = ${id};`;
      return (result[0] as Blog) || null;
    },

    create: async (data: Omit<Blog, 'id'>): Promise<Blog> => {
      const result = await sql`
        INSERT INTO blogs 
          (slug, title, description, tags, author, category, featured, image, publishedDate, readTime, content)
        VALUES
          (${data.slug}, ${data.title}, ${data.description}, ${data.tags}, ${data.author}, 
           ${data.category}, ${data.featured}, ${data.image}, ${data.publishedDate}, 
           ${data.readTime}, ${data.content})
        RETURNING *;
      `;
      return result[0] as Blog;
    },

    update: async (id: number, data: Partial<Omit<Blog, 'id'>>): Promise<Blog | null> => {
      const existing = await sql`SELECT * FROM blogs WHERE id = ${id};`;
      if (existing.length === 0) return null;
      const merged = { ...(existing[0] as Blog), ...data };
      const result = await sql`
        UPDATE blogs 
        SET slug = ${merged.slug}, title = ${merged.title}, description = ${merged.description},
            tags = ${merged.tags}, author = ${merged.author}, category = ${merged.category},
            featured = ${merged.featured}, image = ${merged.image},
            publishedDate = ${merged.publishedDate}, readTime = ${merged.readTime}, content = ${merged.content}
        WHERE id = ${id}
        RETURNING *;
      `;
      return result[0] as Blog;
    },

    delete: async (id: number): Promise<boolean> => {
      const result = await sql`DELETE FROM blogs WHERE id = ${id} RETURNING id;`;
      return result.length > 0;
    }
  };
}
