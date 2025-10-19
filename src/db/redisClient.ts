import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,            // Your Upstash REST URL
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,        // Your Upstash Token
});

export default redis;
