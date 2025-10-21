import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

export async function ensureTableExists() {
  await sql`
    CREATE TABLE IF NOT EXISTS blogs (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      tags TEXT[],
      author TEXT,
      category TEXT,
      featured BOOLEAN,
      image TEXT,
      publishedDate TEXT,
      readTime TEXT,
      content TEXT
    );
  `;
}
