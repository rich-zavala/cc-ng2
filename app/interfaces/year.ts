// tslint:disable:radix
import * as _ from 'lodash';
import { Day } from './day';

export class Year {
	_id: string;
	_rev: string;
	_deleted: boolean;
	year: number;
	dates: Day[];

	constructor(year: any, dates?: Array<Day>, rev?: string) {
		this.dates = [];
		this.year = parseInt(year);
		this._deleted = false;
		if (typeof dates !== 'undefined' && dates.length > 0) {
			for (let d of dates) {
				this.dates.push(d);
			}
		}

		if (typeof rev !== 'undefined') {
			this._rev = rev;
		}

		this._id = this.year.toString();
	}
}