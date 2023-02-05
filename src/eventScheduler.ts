import { Agenda } from '@hokify/agenda';
import * as Haiku from './typings/index';
import type { eventScheduler } from './typings/eventScheduler';

export class EventScheduler extends Haiku.Base implements eventScheduler {
    private agenda: Agenda;
    constructor(client: Haiku.Client) {
        super(client)
        this.agenda = new Agenda({
            db: {
                address: client.haikuOptions.mongoURL,
                collection: 'agendaTasks'
            }
        })
    }

    define(name: string, handler: (job:any) => Promise<unknown>) {
        this.agenda.define(name, handler);
    }

    async start() {
        await new Promise(resolve => this.agenda.once('ready', resolve));
        await this.agenda.start();
        return this;
    }

    async schedule(name: string, time: string, data: any) {
        await this.agenda.schedule(time, name, data);
    }

    async cancel(name: string, data: any) {
        await this.agenda.cancel({ name, data });
    }

}