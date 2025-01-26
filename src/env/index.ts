import { config } from 'dotenv';
import { z } from 'zod';

// console.log(process.env.NODE_ENV); // tem todas as vars de ambiente do meu pc mas ainda n carregou o .env
// só carrega quando chamamos o método config
// mas se eu rodar os tests o vites já preenche o node_env com test, assim no meu .env.test n preciso declarar o node_env

if (process.env.NODE_ENV === 'test') {
    config({ path: '.env.test' });
} else {
    config(); // por padrao já vai no .env
}

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('production'),
    DATABASE_URL: z.string(),

    PORT: z.number().default(3000),
});

const _env = envSchema.safeParse(process.env);
if (_env.success === false) {
    console.error(
        'Environment vars is not configured correctly!',
        _env.error.format(),
    );
    throw new Error('Invalid environment variables.');
}

export const env = _env.data;
