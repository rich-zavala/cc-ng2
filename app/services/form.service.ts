// tslint:disable:member-ordering
import { Injectable } from '@angular/core';

import * as Tools from '../tools/tools';
import * as _ from 'lodash';

import { DBService } from './db.service';
import { RecordsService } from './records.service';

import { Comic } from '../interfaces/comic';
import { Title } from '../interfaces/title';
import { Year } from '../interfaces/year';
import { Day } from '../interfaces/day';

@Injectable()
export class FormService {
	comic: Comic;

	constructor(private dbs: DBService, private rs: RecordsService) {
		this.comic = new Comic('Comic de ejemplo', null, new Date());
	}

	// Add a record
	add(comic: Comic): Promise<Comic[]> {
		let comicYear = comic.getYear();
		let comic_id = comicYear.toString(); // Id for this year

		let returnObject = { // Information about transaction
			error: false,
			errorMsg: '',
			yearUpdated: false,
			yearNew: false,
			year: comicYear,
			comic: comic
		};

		let newDay = <Day>{
			date: Tools.dateFormat(comic.date),
			sum: comic.price
		}
		return this.getComicByTitleAndVolumeAndVariant(comic.title, comic.volume, comic.variant)
			.then((result: Array<Comic>) => {
				if (result.length > 0) {
					returnObject.error = true;
					returnObject.errorMsg = 'Record already in DB.';
					return returnObject;
				} else {
					return this.dbs.connections.db.put(this.comic2db(comic)).then(() => {
						// Insert new title to catalog
						let title_id = Tools.alpha(comic.title);
						this.dbs.connections.dbt.get(title_id)
							.then((existingTitle: Title) => {
								if (!_.includes(existingTitle.records, comic.id)) {
									existingTitle.records.push(comic.id);
									existingTitle.sum += comic.price;
									return this.newTitle(existingTitle);
								}
							}) // Title exists
							.catch(() => {
								let title = {
									_id: title_id,
									title: comic.title,
									records: [comic.id],
									sum: 0
								};
								return this.newTitle(title as Title);
							});

						// Add year and date
						return this.dbs.connections.dby.get(comic_id)
							.then((existingYear: Year) => { // Year exists
								// Look for this comic's date
								let dayExists = existingYear.dates.filter((r: Day) => r.date === comic.dateString).length === 0;
								if (dayExists) { // Date not in this year
									existingYear.dates.push(newDay);
								} else {
									// Date in this year. Update sum
									for (let i in existingYear.dates) {
										if (existingYear.dates[i].date === comic.dateString) {
											existingYear.dates[i].sum += comic.price;
										}
									}
								}

								// Update year
								return this.newYear(existingYear)
									.then(() => {
										returnObject.yearUpdated = true;
										return returnObject;
									})
									.catch(Tools.handleError);
							})
							.catch(() => { // Year doesnt't exists
								let newYear = new Year(comicYear);
								newYear.dates.push(newDay);
								return this.newYear(newYear)
									.then(() => {
										returnObject.yearNew = true;
										return returnObject;
									})
									.catch(Tools.handleError);
							});
					});
				}
			});
	}

	// Look for a comic by title and volume
	getComicByTitleAndVolumeAndVariant(title: string, volume: number, variant: string): Promise<any> {
		return this.dbs.connections.db.allDocs({
			include_docs: true,
			attachments: true
		}).then((result: any) => {
			let returnObject = Array<Comic>();
			if (result.rows.length > 0) {
				returnObject = result.rows
					.filter((record: any) => {
						let value = record.doc;
						return Tools.alpha(value.title) === Tools.alpha(title)
							&& parseInt(value.volume) === parseInt(volume.toString())
							&& value.variant === variant;
					})
					.map((record: any) => record.doc);
			}
			return returnObject;
		});
	}

	// Add a year to DB
	private newYear(y: Year): Promise<any> {
		return this.dbs.connections.dby.put(y)
			.then(() => y)
			.catch((e: any) => {
				console.warn('Error on YEAR put!', y, e);
				return false;
			});
	}

	// Add a title to DB
	private newTitle(t: Title): Promise<any> {
		t.title = t.title.toUpperCase().trim();
		t.records = t.records.sort();
		return this.dbs.connections.dbt.put(t)
			.then(() => this.rs.reset()) // Reset titles catalog
			.catch((e: any) => {
				console.warn('Error on TITLE put!', t, e);
			});
	}

	// Transform a "Comic" to DB abject
	private comic2db(c: Comic): any {
		return {
			_id: c.id,
			title: c.title,
			volume: c.volume,
			acquired: c.acquired,
			dateAcquired: c.dateAcquired,
			variant: c.variant,
			price: c.price,
			date: c.date,
			dateString: c.dateString,
			dateRegistered: c.dateRegistered,
			year: new Date(c.date).getFullYear()
		};
	}

	// Load fake data
	private fakePosition = 0;
	private fakeData: any;
	fake() {
		if (this.fakePosition === 0) {
			this.fakeData = require('../temp/catalog.temporal').data;
		}

		if (this.fakeData.length - 1 > this.fakePosition) {
			let d = this.fakeData[this.fakePosition];
			let td = new Comic(d.titulo, d.volumen, d.fecha);
			if (d.adquirido === 1) { td.acquire(); }
			td.dateAcquired = d.fecha_adquisicion;
			td.variant = d.variante;
			td.price = d.precio;
			td.date = new Date(d.fecha);
			td.dateRegistered = new Date(d.fecha_registro);

			this.add(td)
				.then(() => {
					console.log('New record in DB');
					this.fakePosition++;
					setTimeout(() => this.fake(), 20);
				})
				.catch(Tools.handleError);
		} else {
			this.dbs.connections.db.compact();
			this.dbs.connections.dby.compact();
			this.dbs.connections.dbt.compact();
			console.log('Fake done!');
		}
	}

	destroy(): Promise<any> {
		console.log('db.destroying');
		return this.dbs.connections.db.destroy().then(() => {
			return this.dbs.connections.dby.destroy().then(() => {
				return this.dbs.connections.dbt.destroy().then(() => {
					this.dbs.create();
					setTimeout(() => {
						this.fake();
					}, 1000);
				});
			});
		});
	}
}