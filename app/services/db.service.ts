// tslint:disable:radix
// tslint:disable:member-ordering
import { Injectable } from '@angular/core';
import * as Tools from '../tools/tools';

interface Pouch {
	put: Function; get: Function; allDocs: Function; remove: Function;
	compact: Function; destroy: Function; query: Function;
}

const PouchDB = require('pouchdb'),
	dbName = 'comics',
	dbTitles = 'titles',
	dbYears = 'years';

@Injectable()
export class DBService {
	// DB Objects aliases
	connections = {
		db: <Pouch>{},
		dbt: <Pouch>{},
		dby: <Pouch>{}
	};

	// Define a schema
	constructor() {
		console.log('dbService.constructed');
		this.create();
	}

	// Create DB
	create() {
		this.connections = {
			db: new PouchDB(dbName, { adapter: 'websql' }),
			dbt: new PouchDB(dbTitles, { adapter: 'websql' }),
			dby: new PouchDB(dbYears, { adapter: 'websql' })
		};
	}
}