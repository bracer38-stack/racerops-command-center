import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { openStore } from './database.mjs';
import { createApp } from './app.mjs';

if (existsSync('.env')) process.loadEnvFile('.env');

const store = openStore(process.env.DATABASE_PATH || './data/racerops.sqlite');
const app = createApp(store, process.env, { staticDir: resolve('dist') });
const server = app.listen(Number(process.env.PORT || 3001), '0.0.0.0', () => console.info('RacerOps API ready.'));
function shutdown() { server.close(() => { store.db.close(); process.exit(0); }); }
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
