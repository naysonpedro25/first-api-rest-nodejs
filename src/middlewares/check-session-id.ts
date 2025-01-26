import { FastifyReply, FastifyRequest } from 'fastify';

export async function checkSessionId( // se essa porra não for assincrona, é preciso da calback done
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
        return reply.status(401).send({
            error: 'Unauthorized',
        });
    }
}
