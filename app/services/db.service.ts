// tslint:disable:radix
// tslint:disable:member-ordering
import { Injectable } from '@angular/core';
import * as Tools from '../tools/tools';

import { Comic } from '../interfaces/comic';

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

	// Change "acquired" of a record
	acquire(comic: Comic): Promise<any> {
		let returnObject = {
			output: <Comic>{},
			error: true
		};
		return this.connections.db.get(comic.id)
			.then((dbRecord: any) => {
				let dbComic = Tools.db2Comic(dbRecord);
				dbComic.acquire();
				returnObject.output = dbComic;
				return this.connections.db.put(Tools.comic2db(dbComic))
					.then(() => {
						returnObject.error = false;
						return returnObject;
					})
					.catch((e: any) => {
						Tools.handleError(e);
						return returnObject;
					});
			})
			.catch((e: any) => {
				Tools.handleError(e);
				return returnObject;
			});
	}

// Get a record info
	info(comic: Comic) {
		console.log(comic);
	}
}