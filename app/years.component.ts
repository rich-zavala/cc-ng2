import { Component } from '@angular/core';

// import * as _ from 'lodash';
import { Observable } from 'rxjs/Rx';
import * as Tools from './tools/tools';

import { Year } from './interfaces/year';
import { YearsService } from './services/years.service';
import { DBService } from './services/db.service';

@Component({
	moduleId: module.id,
	selector: 'years-list',
	template: `<div>
							<h4>Years listing</h4>
							<div *ngIf="years.length > 0">
								<ul>
									<li *ngFor="let year of years | orderBy : '-year'">
										<a (click)="selectYear(year);" routerLinkActive="active">{{year.year}}</a>
										<span *ngIf="year.year === selectedYear.year">**</span>
									</li>
								</ul>
								<hr />
								<div>
									<div *ngFor="let year of years">
										<div *ngIf="year.year === selectedYear.year">
											<comics-in-day [day]="day" *ngFor="let day of year.dates | orderBy : '-date'"></comics-in-day>
										</div>
									</div>
								</div>
							</div>
							<div *ngIf="years.length === 0">== No records yet ==</div>
						</div>`
})

export class YearComponent {
	// years$: Observable<Year[]>;
	years: Year[];
	public selectedYear: Year;

	constructor(private ys: YearsService, private db: DBService) {
		console.log('years.initialized');
		this.loadYears();
	}

	loadYears() {
		let yearsSubscription = this.ys.years$.subscribe(
			(years: Array<Year>) => {
				this.years = years;
				let selectedYear = this.ys.getSelectedYear();
				if (typeof years !== 'undefined'
					&& years.length > 0
					&& !this.selectedYear
					&& typeof selectedYear === 'undefined') { // First selection
					this.selectYear(years[years.length - 1]);
				} else {
					this.selectedYear = selectedYear;
				}
			},
			Tools.handleError
		);

		// If a year is deleted, service will update the selected year
		let selectedYearSubscription = this.ys.selectedYear$.subscribe((y: Year) => {
			if (y.year > 0) {
				this.selectedYear = y;
			}
		});
	}

	selectYear(y: Year) {
		if (y !== this.selectedYear) {
			this.ys.selectYear(y);
			this.selectedYear = y;
			console.log('year.selection.finished', this.selectedYear);
		}
	}
}
