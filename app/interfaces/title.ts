import { Comic } from './comic';

export interface Title {
	_id: string,
	_rev: string,
	title: string,
	records: Array<any>,
	docs: Array<Comic>,
	show: boolean,
	sum: number
}