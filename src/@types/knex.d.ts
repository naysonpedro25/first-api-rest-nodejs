// eslint-disable-next-line
import { Knex } from 'knex';

declare module 'knex/types/tables' {
  export interface Tables {
    transactions: {
      id: string;
      title: string;
      amount: number;
      created_at: string;
      session_id?: string;
    };
  }
}

// assim eu add tipagem no knex

// arquivo para o intelisence reconhecer as tables do next. Assim eu estou sobrescrevendo o node_module/knex/types/tables
