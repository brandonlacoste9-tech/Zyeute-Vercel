import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    db: any;
    redis: any;
    mind: any;
    guardian: any;
  }
}
