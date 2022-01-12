import {HaikuClient, HaikuPaginator} from '../dist/index.js';
import { Intents, MessageEmbed } from 'discord.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./config.json');
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const client = new HaikuClient({ intents: [Intents.FLAGS.GUILDS] }, config);

const paginator = new HaikuPaginator(new MessageEmbed(),{maxFields: 2, maxDescriptionLength:10, splitOnSpaces: false});


client.login(config.token);