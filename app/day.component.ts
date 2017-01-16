import { Component, OnInit, Input } from '@angular/core';

import * as Tools from './tools/tools';

import { Comic } from './interfaces/comic';
import { Day } from './interfaces/day';

import { DBService } from './services/db.service';
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
					<tr *ngFor="let comic of comics; let i = index;">
						<td><span *ngIf="comic.acquiring">*</span>{{comic.title}} #{{comic.volume}} - {{comic.dateAcquired}}</td>
						<td>{{comic.price | currency : 'USD' : true : '2.2-2'}}</td>
						<td><input type="checkbox" [(ngModel)]="comic.acquired" (change)="acquire($event, comic, i)" /></td>
						<td><button (click)="delete(comic, i)">x</button></td>
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

	constructor(private ys: YearsService, private db: DBService) { }

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

	acquire(event: any, comic: Comic, index: number) {
		comic.acquiring = !comic.acquired || (comic.acquired && confirm('Sure?'));

		if (comic.acquiring) { // Execute
			this.db.acquire(comic)
				.then((result) => {
					if (!result.error) {
						event.target.checked = result.output.acquired;
						this.comics[index] = result.output; // Replace record
					} else {
						alert('An error ocourred.');
						event.target.checked = comic.acquired;
					}
				})
				.catch(Tools.handleError)
		} else { // Return to original state
			event.target.checked = comic.acquired;
		}
	}

	// Delete a record
	delete(comic: Comic, index: number) {
		if (confirm('Sure?')) {
			comic.deleting = true;
			this.ys.remove(comic)
				.then((r) => {
					if (r) {
						this.comics.splice(index, 1);
						this.day.sum -= comic.price;
					} else {
						alert('There\'s been an error when deleting...');
						comic.deleting = false;
					}
				});
		}
	}

	// Info
	info(comic: Comic){
		this.db.info(comic);
	}
}