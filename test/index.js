import {HaikuClient, HaikuPaginator} from '../dist/index.js';
import { Intents, MessageEmbed } from 'discord.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./config.json');
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const client = new HaikuClient({ intents: [Intents.FLAGS.GUILDS] }, config);

const paginator = new HaikuPaginator(new MessageEmbed(),{maxFields: 2, maxDescriptionLength:10, splitOnSpace: true});

paginator.addField('test', 'first');
paginator.addField('test', 'second');
paginator.addField('test', 'third');
paginator.addField('test', 'fourth');
paginator.addField('test', 'fifth');

paginator.setDescription('a sentence that\'s the worst thing I can think of right now to paginate')

client.login(config.token);