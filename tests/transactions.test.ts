import { test, beforeAll, afterAll, expect, beforeEach } from 'vitest';
import { app } from '../src/app';
import request from 'supertest';
import { describe } from 'node:test';
import { execSync } from 'node:child_process';

describe('Transactions routes', () => {
    beforeAll(async () => {
        await app.ready();
    });

    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all');
        execSync('npm run knex migrate:latest');
    });

    afterAll(async () => {
        app.close();
    });

    async function createTransaction(data: {
        title: string;
        amount: number;
        type: 'credit' | 'debit';
    }) {
        const response = await request(app.server)
            .post('/transactions')
            .send(data)
            .expect(201);
        const cookies = response.get('Set-Cookie') ?? [];
        return { cookies };
    }

    async function getIdWithAllTransaction(cookies: string[]) {
        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200);

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New transaction',
                amount: 4000,
            }),
        ]);

        const transactionId = listTransactionsResponse.body.transactions[0].id;
        return {
            transactionId,
            transactions: listTransactionsResponse.body.transactions,
        };
    }

    test('User can create a new transaction', async () => {
        await createTransaction({
            title: 'New transaction',
            amount: 4000,
            type: 'credit',
        });
    });

    test('User can list all transactions', async () => {
        const { cookies } = await createTransaction({
            title: 'New transaction',
            amount: 4000,
            type: 'credit',
        });

        await getIdWithAllTransaction(cookies);
    });

    test('User can get one transaction with id', async () => {
        const { cookies } = await createTransaction({
            title: 'New transaction',
            amount: 4000,
            type: 'credit',
        });

        const { transactionId } = await getIdWithAllTransaction(cookies);

        const responseGetTransactionWithId = await request(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200);

        expect(responseGetTransactionWithId.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New transaction',
                amount: 4000,
            }),
        );
    });

    test('User can get summary of all transactions', async () => {
        const { cookies } = await createTransaction({
            title: 'New transaction',
            amount: 4000,
            type: 'credit',
        });

        const responseSummary = await request(app.server)
            .get('/transactions/summary')
            .set('Cookie', cookies)
            .expect(200);
        console.log(responseSummary.body);
        expect(responseSummary.body.summary).toEqual(4000);
    });
});
