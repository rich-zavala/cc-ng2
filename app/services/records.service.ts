// tslint:disable:member-ordering
import { Injectable } from '@angular/core';

import * as Tools from '../tools/tools';
import * as _ from 'lodash';

import { DBService } from './db.service';
import { Comic } from '../interfaces/comic';

@Injectable()
export class RecordsService {

	constructor(private dbs: DBService) { }
	private titlesCatalog = new Array<any>();

	// Filter for titles searching
	filter(term: string, title: any) {
		return typeof term === 'undefined'
			|| term.trim().length === 0
			|| (term.trim().length > 0 && Tools.alpha(title.title).indexOf(Tools.alpha(term)) >= 0);
	}

	// Return full titles catalog
	searchTitles(term: string): Promise<any> {
		if (this.titlesCatalog.length > 0) {
			return new Promise(resolve => resolve(this.titlesCatalog.filter((title: any) => this.filter(term, title))));
		} else {
			return this.fetchTitles(term).then(() => this.searchTitles(term));
		}
	}

	// Reclaim titles and set in observable
	fetchTitles(term: string): Promise<any> {
		console.log('db.titles.fetching');
		return this.dbs.connections.dbt.allDocs({
			include_docs: true,
			attachments: false
		})
			.then((result: any) => {
				this.titlesCatalog = result.rows
					.map((title: any) => title.doc);
				return this.titlesCatalog;
			})
			.catch(Tools.handleError);
	}

	// Reset catalog
	reset() {
		this.titlesCatalog = [];
	}
}