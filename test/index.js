import HaikuClient from '../dist/client.js';
import { Intents } from 'discord.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const config = require('./config.json');

const client = new HaikuClient({ intents: [Intents.FLAGS.GUILDS] }, config);


client.login()