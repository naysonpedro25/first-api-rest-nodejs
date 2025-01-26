import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { checkSessionId } from '../middlewares/check-session-id';

export async function transactionsRoutes(app: FastifyInstance) {
    app.get(
        '/',
        {
            preHandler: checkSessionId,
        },
        async (request, reply) => {
            // por padrao o status code é 200
            const { sessionId } = request.cookies;
            const transactions = await knex('transactions')
                .where('session_id', sessionId)
                .select('*');
            return reply.send({
                transactions,
            });
        },
    );

    app.get(
        '/:id',
        {
            preHandler: [checkSessionId],
        },
        async (request: FastifyRequest) => {
            const { sessionId } = request.cookies;

            const paramsSchema = z.object({
                id: z.string().uuid(),
            });
            const { id } = paramsSchema.parse(request.params);
            const transaction = await knex('transactions')
                .where({
                    id,
                    session_id: sessionId,
                })
                .first();
            return {
                transaction,
            };
        },
    );

    app.get(
        '/summary',
        {
            preHandler: [checkSessionId],
        },
        async (request) => {
            const { sessionId } = request.cookies;
            // o knex sempre rotorna um array das querys, nesses caso o método first q deixa de ser array

            const summary = await knex('transactions')
                .where('session_id', sessionId)
                .sum('amount', { as: 'summary' })
                .first();
            return { ...summary };
        },
    );

    app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
        // basicamente isso é a validação
        const bodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        });

        const { title, amount, type } = bodySchema.parse(request.body);

        let sessionId = request.cookies.sessionId;

        if (!sessionId) {
            sessionId = randomUUID();
            reply.cookie('sessionId', sessionId, {
                path: '/', // rotas que podem acesssar tal cookie
                maxAge: 60 * 60 * 24 * 7, // 7 days. A função aq diz q é em milesec mas na doc diz q é dem sec ent vou na doc
            });
        }

        await knex('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id: sessionId,
        });

        reply.status(201).send();
    });
}
