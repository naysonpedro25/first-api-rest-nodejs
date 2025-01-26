import { env } from './env/index';
import { knex as setupKnex, Knex } from 'knex';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not found');

export const config: Knex.Config = {
    client: env.DATABASE_CLIENT,
    connection:
        env.DATABASE_CLIENT === 'sqlite' // isso por conta da url no knex
            ? {
                  filename: env.DATABASE_URL,
              }
            : env.DATABASE_URL,
    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: './db/migrations',
    },
};

export const knex = setupKnex(config);
