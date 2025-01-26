import { app } from './app';
import { env } from './env';
// dividi para poder usar o app apenas no tests sem precisar rodar o server
app.listen({ port: env.PORT, host: '0.0.0.0' }).then((addrs) => {
    console.log(`Http server runing in ${addrs}`);
});
