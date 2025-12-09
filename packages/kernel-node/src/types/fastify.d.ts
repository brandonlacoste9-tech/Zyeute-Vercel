import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    db: PrismaClient;
    redis: Redis;
    mind: any;     // Replace 'any' with Mind type when available
    guardian: any; // Replace 'any' with Guardian type when available
    config: any;
  }
}

