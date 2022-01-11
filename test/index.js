import {HaikuClient, HaikuPaginator} from '../dist/index.js';
import { Intents, MessageEmbed } from 'discord.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./config.json');

const client = new HaikuClient({ intents: [Intents.FLAGS.GUILDS] }, config);

const paginator = new HaikuPaginator(new MessageEmbed(),{maxFields: 2, maxDescriptionLength:10});

paginator.addField('test', 'test');
paginator.addField('test', 'test');
paginator.addField('test', 'test');
paginator.addField('test', 'test');
paginator.addField('test', 'test');

paginator.setDescription('a sentence that\'s the worst thing I can think of right now to paginate')

console.log([...paginator])

client.login(config.token);