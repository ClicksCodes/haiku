import * as MongoDB from 'mongodb';

export interface MongoCollection {
    collection: MongoDB.Collection;
    functions: Record<string, Function>;
    addFunctions(functions: Record<string, Function>): void;
    setFunction(name: string, func: Function): void;
    getFunction(name: string): Function | undefined;
}

export interface MongoDatabase {
    mongoDB: MongoDB.Db;
    collections: Record<string, MongoCollection>;
    addCollections(...collections: string[]): void;
    getCollection(collection: string): MongoCollection | undefined;
}