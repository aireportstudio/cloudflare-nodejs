// src/app.ts
import express from 'express';
import blogRoutes from './routes/blogRoutes';
const app = express();

app.use(express.json());
app.use('/blogs', blogRoutes);

export default app;
