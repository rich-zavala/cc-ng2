import { Component, OnInit, Input } from '@angular/core';

import * as Tools from './tools/tools';

import { Comic } from './interfaces/comic';
import { Year } from './interfaces/year';
import { Day } from './interfaces/day';

import { YearsService } from './services/years.service';

@Component({
	moduleId: module.id,
	selector: 'comics-in-day',
	template: `
		<div>
			<table border="1" width="100%" cellspan="0" cellspace="0">
				<tr>
					<th width="100%">{{day.date}}</th>
					<th nowrap colspan="4">{{day.sum | currency : 'USD' : true : '2.2-2'}}</th>
				</tr>
				<tr *ngIf="comics.length === 0"><td colspan="4">Loading...</td></tr>
				<tbody *ngIf="comics.length > 0">
					<tr *ngFor="let comic of comics">
						<td>{{comic.title}} #{{comic.volume}}</td>
						<td>{{ comic.price | currency : 'USD' : true : '2.2-2' }}</td>
						<td><input type="checkbox" [(ngModel)]="comic.acquired" (change)="acquire($event, comic)" /></td>
						<td><button (click)="delete(comic)">x</button></td>
						<td><button (click)="info(comic)">i</button></td>
					</tr>
				</tbody>
			</table>
			<br>
		</div>`
})

export class DayComponent implements OnInit {
	@Input() day: Day;
	comics: Comic[] = [];

	constructor(private ys: YearsService) { }

	ngOnInit() {
		this.fillComics();
	}

	fillComics() {
		this.ys.comicsCatalog$.subscribe(
			r => this.comics = r
				.filter((c: Comic) => c.dateString === this.day.date)
				.map((c: Comic) => Tools.db2Comic(c)),
			r => console.error('Error', r),
			() => {
				if (this.comics.length === 0) {
					console.log('this day must be removed!');
				}
			}
		);
	}

	acquire(event: any, comic: Comic) {
		if (comic.acquired && confirm('Sure?')) {
			comic.acquire(false);
		} else if (!comic.acquired) {
			comic.acquiring = true;



			comic.acquire(true);
		}

		event.currentTarget.checked = comic.acquired;
	}

	info(comic: Comic) {
		console.log(comic);
	}

	delete(comic: Comic) {
		if (confirm('Sure?')) {
			comic.deleting = true;
			this.ys.remove(comic)
				.then((r) => {
					if (r) {
						this.comics.splice(this.comics.findIndex(c => c.id === comic.id), 1);
						this.day.sum -= comic.price;
					} else {
						alert('There\'s been an error when deleting...');
						comic.deleting = false;
					}
				});
		}
	}
}