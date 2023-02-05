import type * as Database from './typings/database';
import * as Mongo from 'mongodb';

export class HaikuCollection implements Database.MongoCollection {
    collection: Mongo.Collection;
    functions: Record<string, Function>;
    constructor(collection: Mongo.Collection) {
        this.collection = collection;
        this.functions = {};
    }

    addFunctions(functions: Record<string, Function>) {
        for(const [name, func] of Object.entries(functions)) {
            if(this.functions[name]) throw new Error(`Function ${name} already exists!`);
            else this.functions[name] = func;
        }
    }

    setFunction(name: string, func: Function) {
        this.functions[name] = func;
    }

    getFunction(name: string) {
        return this.functions[name];
    }

}

export class HaikuDB implements Database.MongoDatabase {
    mongoDB: Mongo.Db;
    collections: Record<string, Database.MongoCollection>;
    constructor(url:string, options?: Mongo.MongoClientOptions) {
        this.mongoDB = new Mongo.MongoClient(url, options).db('Haiku');
        this.collections = {};
    }

    addCollections(...collections: string[]) {
        collections.forEach(collection => {
            if(!this.collections[collection]) console.log(`Collection ${collection} will be created implicitly!`)
            this.collections[collection] = new HaikuCollection(this.mongoDB.collection(collection));
        });
    }

    getCollection(collection: string) {
        if(!this.collections[collection]) throw new Error(`Collection ${collection} does not exist!`);
        return this.collections[collection];
    }

}