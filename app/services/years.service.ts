import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject, Subject } from 'rxjs/Rx';
import * as Tools from '../tools/tools';

import { DBService } from './db.service';
import { RecordsService } from './records.service';

import { Year } from '../interfaces/year';
import { Comic } from '../interfaces/comic';
import { Title } from '../interfaces/title';

@Injectable()
export class YearsService {
	// years = new Array<Year>();

	private selectedYear: Year; // Year selected for looking for comics and dates
	selectedYear$: BehaviorSubject<Year> = new BehaviorSubject(new Year(0));
	comicsCatalog$: Observable<Comic[]>; // Comics in this year

	/** **/
	years$: BehaviorSubject<Year[]> = new BehaviorSubject([]);

	constructor(private dbs: DBService, private rs: RecordsService) {
		this.fetchYears();
	}

	// Fetch for years
	fetchYears(): Promise<Array<Year>> {
		return this.dbs.connections.dby.allDocs({
			include_docs: true,
			attachments: false
		})
			.then((r: any) => {
				let years = new Array<Year>();
				r.rows.forEach((re: any) => {
					years.push(new Year(re.doc.year, re.doc.dates, re.doc._rev));
				});
				this.years$.next(years);
				console.warn('db.years.fetched', years);
				return this.years$;
			})
			.catch((e: any) => console.error(e));
	}

	// Return selected year
	getSelectedYear(): Year {
		return this.selectedYear;
	}

	// Set year in wich records belong
	selectYear(y: Year): Year {
		console.log('db.years.changed');
		this.selectedYear = y;
		this.fillComics();
		return y;
	}

	// Fill comics
	fillComics() {
		this.comicsCatalog$ = Observable.fromPromise(this.getComics());
	}

	// Get all records of a year
	private getComics(year?: number): Promise<Comic[]> {
		let yearToFetch = typeof year === 'undefined' ? this.selectedYear.year : year;
		console.warn('db.years.comics.fetching.' + yearToFetch);
		return this.dbs.connections.db.allDocs({
			include_docs: true,
			startkey: yearToFetch.toString(),
			endkey: (yearToFetch + 1).toString(),
			inclusive_end: false
		})
			.then((dbComics: any) => {
				console.log('db.years.comics.fetching.done', dbComics);
				return dbComics.rows.map((comic: any) => {
					return Tools.db2Comic(comic.doc);
				});
			})
			.catch(Tools.handleError);
	}

	// Remove a record
	remove(comic: Comic): Promise<boolean> {
		return this.dbs.connections.db.remove(comic.id, comic._rev) // Remove comic
			.then(() => { // Handle titles DB
				return this.titleUpdate(comic)
					.then(() => { // Handle date in year
						return this.dayUpdate(comic)
							.then((dayUpdateResult: any) => {
								return this.yearUpdate(dayUpdateResult)
									.then((tmp) => {
										// Check if currently selected year was deleted
										if (typeof this.selectedYear !== 'undefined' && tmp.yearsLeft.findIndex((y: Year) => y.year === this.selectedYear.year) === -1) {
											if (tmp.yearsLeft.length > 0) {
												this.selectYear(tmp.yearsLeft[0]);
												this.selectedYear$.next(this.selectedYear);
											}
										}
										return true;
									})
									.catch(this.handleError);
							});
					})
					.catch(this.handleError);
			})
			.catch(this.handleError);
	}

	// Update/Remove title
	private titleUpdate(comic: Comic): Promise<any> {
		return this.dbs.connections.dbt.get(Tools.alpha(comic.title))
			.then((r: Title) => {
				r.records.splice(r.records.indexOf(comic.id), 1);
				if (r.records.length > 0) {
					return this.dbs.connections.dbt.put(r)
						.then(() => this.rs.reset());
				} else {
					return this.dbs.connections.dbt.remove(r)
						.then(() => this.rs.reset());
				}
			})
	}

	// Update/Remove day in a year
	private dayUpdate(comic: Comic): Promise<any> {
		return this.dbs.connections.dby.get(comic.getYear().toString())
			.then((resultYear: Year) => {
				// Get index of comic's day
				let dayInfo = {
					index: -1,
					sum: 0,
					year: comic.getYear()
				};

				// Update sum in date
				for (let i = 0; i < resultYear.dates.length && dayInfo.index === -1; i++) {
					if (resultYear.dates[i].date === comic.dateString) {
						dayInfo.index = i;
						resultYear.dates[i].sum -= comic.price;
					}
					dayInfo.sum = resultYear.dates[i].sum;
				}


				return this.getComics(comic.getYear())
					.then((resultComics: Comic[]) => {
						if (dayInfo.sum === 0) { // Remove day
							resultYear.dates.splice(dayInfo.index, 1);
						}

						return this.dbs.connections.dby.put(resultYear)
							.then(() => dayInfo);
					})
			})
	}

	// Year update
	private yearUpdate(dayUpdateResult: any): Promise<any> {
		let tmp = <Year[]>this.years$.getValue(); // Get current years
		let affectedYear = tmp.find((y) => y.year === dayUpdateResult.year); // Locate affected year
		if (dayUpdateResult.sum === 0) { // Remove date if empty (Yes, again. But now to cached array)
			affectedYear.dates.splice(dayUpdateResult.index, 1);
		}

		let returnObject = {
			updated: false,
			yearsLeft: tmp
		};

		if (affectedYear.dates.length > 0) { // Everyting is fine
			return new Promise((resolve) => resolve(returnObject));
		} else { // The year is empty. Remove it
			affectedYear._deleted = true;
			return this.dbs.connections.dby.get(affectedYear._id).then((doc: any) => {
				return this.dbs.connections.dby.remove(doc);
			}).then((result: any) => {
				// Remove deleted year from current years
				tmp.splice(tmp.findIndex((y) => y.year === affectedYear.year), 1);
				returnObject.yearsLeft = tmp;
				returnObject.updated = true;
				return returnObject;
			});
		}
	}

	// Record deletion handler
	private handleError(e: any): boolean {
		Tools.handleError(e);
		console.log(666)
		return false;
	}
}