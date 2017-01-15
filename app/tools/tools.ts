// tslint:disable:radix
import * as _ from 'lodash';
import { Comic } from '../interfaces/comic';

export function dateFormat(d: Date): string {
	d = new Date(d);
	return _.padStart(d.getFullYear().toString(), 4, '0') + '-'
		+ _.padStart((d.getMonth() + 1).toString(), 2, '0') + '-'
		+ _.padStart(d.getDate().toString(), 2, '0');
}

// Transform a "DB Comic" to "Comic"
export function db2Comic(c: any): any {
	let r = new Comic(c.title, c.volume, c.date);
	r.acquire(c.acquired);
	r.variant = c.variant;
	r.price = c.price;
	r.dateAcquired = c.dateAcquired;
	r.dateRegistered = c.dateRegistered;
	if (typeof c._rev !== 'undefined') { r._rev = c._rev; }
	return r;
}

// Transform a "Comic" to DB abject
export function comic2db(c: Comic): any {
	let returnObject = {
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

	if (c._rev) {
		returnObject['_rev'] = c._rev;
	}

	return returnObject;
}

// Reduce string to alphanumeric
export function alpha(s: string) {
	return typeof s === 'string' ? s.toLowerCase().replace(/[^a-z0-9]/gi, '') : '';
}

export function handleError(error: any, comment?: string) {
	if (comment) { console.warn(comment, error); } else { console.warn(error); }
}