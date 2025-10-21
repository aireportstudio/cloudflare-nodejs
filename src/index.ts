
import express from 'express';
import { httpServerHandler } from 'cloudflare:node';
import app from './app';

app.get('/', (req, res) => {
  res.send('Hello from Express.js on Cloudflare Workers!');
});

app.listen(8080);

export default httpServerHandler({ port: 8080 });
