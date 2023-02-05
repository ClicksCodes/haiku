import * as Haiku from './src/index';

const client = new Haiku.Client({intents: ["Guilds"], mongoURL:"mongodb://localhost:27017/haiku"});

