import { Agenda } from 'agenda';


export interface eventScheduler {
    define(name: string, handler: (job:any) => Promise<unknown>): void;
    start(): Promise<ThisType>;
    schedule(name: string, time: string, data: any): Promise<void>;
    cancel(name: string, data: any): Promise<void>;
}