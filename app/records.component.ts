import { Component, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs/Rx';
import * as Tools from './tools/tools';

import { DBService } from './services/db.service';
import { RecordsService } from './services/records.service';

import { Comic } from './interfaces/comic';
import { Title } from './interfaces/title';

@Component({
	moduleId: module.id,
	selector: 'records',
	template: `<div>
							<h4>Records listing</h4>
							<input #searchBox (keyup)="search(searchBox.value)" placeholder="Search for a title" size="50" />
							<hr />
							<div *ngFor="let title of titles$ | async | orderBy: 'title'">
								<a (click)="fillRecords(title)">{{title.title}} ({{title.records.length}})</a>
								<div *ngIf="title.show">
									<div *ngIf="title.docs.length === 0">Loading...</div>
									<ul *ngIf="title.docs.length > 0">
										<li *ngFor="let doc of title.docs | orderBy : 'volume'">#{{doc.volume}} \${{doc.price}}</li>
									</ul>
								</div>
							<hr>
							</div>
						</div>
						`
})

export class RecordsComponent implements OnInit {
	titles$: Observable<Title[]>;
	private searchTerms = new Subject();

	constructor(private db: DBService, private dbs: RecordsService) {
		console.log('records.initialized');
	}

	ngOnInit() {
		this.loadTitles().then(r => this.search(''));
	}

	// Load titles. This returns a promise in order to let the app
	// know that the observer is ready and can execute the first search
	loadTitles(): Promise<any> {
		return new Promise((resolve) => {
			this.titles$ = this.searchTerms
				.debounceTime(200) // Wait a little
				.switchMap((term: any) => this.dbs.searchTitles(term))
				.catch((error: any) => Observable.of<Title[]>([]));
			resolve();
		});
	}

	// Filter results
	search(term: string) {
		this.searchTerms.next(term);
	}

	// Get records with this title
	fillRecords(title: Title) {
		if (!title.show) {
			title.docs = new Array();
			title.show = true;
			this.db.connections.db.allDocs({
				include_docs: true,
				attachments: false,
				keys: title.records
			})
				.then((result: any) => {
					title.docs = result.rows.map((r: any) => Tools.db2Comic(r.doc));
				});
		} else {
			title.show = false;
		}
	}
}