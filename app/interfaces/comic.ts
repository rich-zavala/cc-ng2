import * as Tools from '../tools/tools';
import * as _ from 'lodash';

export class Comic {
	private _id: string = null;
	private _title: string = null;
	private _volume: number = null;
	private _variant: string = null;
	private _acquired: boolean = false;
	dateAcquired: Date = null;
	private _price: number = null;
	private _date: Date = null;
	dateString: string = null;
	dateRegistered: Date = new Date();
	_rev: string;

	/* Events indexes */
	deleting = false;
	acquiring = false;

	constructor(title: string, volume: number, date: Date) {
		this.date = date;
		this.title = title;
		this.volume = volume;
		this.dateRegistered = new Date();
	}

	get id(): string {
		return this._id;
	}

	get title(): string {
		return this._title;
	}

	set title(s: string) {
		this._title = s.toUpperCase();
		this.setId();
	}

	get volume(): number {
		return this._volume;
	}

	set volume(s: number) {
		this._volume = s;
		this.setId();
	}

	get date(): Date {
		return this._date;
	}

	set date(s: Date) {
		this._date = new Date(s);
		this.dateString = Tools.dateFormat(this._date);
		this.setId();
	}

	get price(): number {
		return this._price;
	}

	set price(s: number) {
		this._price = Math.round(s * 100) / 100;
	}

	set variant(s: string) {
		this._variant = s;
		this.setId();
	}

	get variant(): string {
		return this._variant;
	}

	// Toggle adquisition
	public acquire(isAcquired?: boolean): boolean {
		if (typeof isAcquired !== 'undefined') {
			this._acquired = isAcquired;
		} else {
			this._acquired = !this._acquired;
			if (this._acquired) {
				this.dateAcquired = new Date();
			} else {
				this.dateAcquired = null;
			}
		}
		return this._acquired;
	}

	get acquired(): boolean {
		return this._acquired;
	}

	// Set id based in title and volume
	private setId(): void {
		this._id = '';
		if (this._title !== null) { this._id += this._title.toLowerCase(); }
		if (this._volume !== null) { this._id += _.padStart(this._volume.toString(), 2, '0'); }
		if (this._variant !== null) { this._id += this._variant.toString(); }
		this._id = this.date.getFullYear().toString() + '-' + Tools.alpha(this._id);
	}

	// Return this comic's year
	public getYear(): number {
		return this.date.getFullYear();
	}
}