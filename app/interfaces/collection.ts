/*import * as _ from 'lodash';
import { Year } from './year';
import { Day } from './day';
import { Comic } from './comic';

export class Collection {
	years: Year[];

	addComic(c: Comic): boolean {
		let comicYear = c.date.getFullYear();
		let existingYear = this.obtainYear(comicYear);
		if (existingYear.year > 0) { // The year exists
			this.years.push(new Year(comicYear));
			existingYear = this.obtainYear(comicYear);
		} else { // No year yet
			let newYear = new Year(comicYear);
			this.years.push(newYear);
		}

		// Add day to year
		existingYear.add(c.date);

		return false;
	}

	private obtainYear(_y: number): Year {
		return this.years.filter(y => y.year === _y)[0];
	}
}*/