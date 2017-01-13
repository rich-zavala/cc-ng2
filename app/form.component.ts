// tslint:disable:radix
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Comic } from './interfaces/comic';
import { YearsService } from './services/years.service';
import { FormService } from './services/form.service';

@Component({
	moduleId: module.id,
	selector: 'form-record',
	template: `<form [formGroup]="form">
							<h3>Add a record</h3>
							<div>
								<label>Title: </label>
								<input formControlName="title" [(ngModel)]="comic.title" />
							</div>
							<div>
								<label>Volume: </label>
								<input formControlName="volume" type="number" [(ngModel)]="comic.volume" digits />
							</div>
							<div>
								<label>Date: </label>
								<input formControlName="date" type="date" [(ngModel)]="comic.date" useValueAsDate />
							</div>
							<div>
								<label>Variant: </label>
								<input formControlName="variant" [(ngModel)]="comic.variant" />
							</div>
							<div>
								<label>Price: </label>
								<input formControlName="price" type="number" [(ngModel)]="comic.price" number />
							</div>
							<div>
								<label>Acquired: </label>
								<input formControlName="acquired" type="checkbox" [(ngModel)]="comic.acquired" />
							</div>
							<button (click)="save()">Save</button>
							<button (click)="resetDB()" style="float: right;">Reset DB</button>
						</form>`
})

export class FormComponent {
	fb: FormBuilder;
	form: FormGroup;
	comic: Comic;

	constructor( @Inject(FormBuilder) fb: FormBuilder, private frms: FormService, private ys: YearsService) {
		this.fb = fb;
		this.initializeForm();

		this.form.valueChanges.subscribe((values: any) => {
			for (let attribute in values) {
				if (attribute !== 'acquired') {
					this.comic[attribute] = values[attribute];
				}
			}

			this.comic.acquire(values.acquired);
		});
	}

	// Initialize comic
	private initializeForm() {
		// this.frms.comic = new Comic('Prueba - ' + new Date().toTimeString(), 54, new Date());
		this.frms.comic = new Comic('Orion', 54, new Date());
		this.frms.comic.price = 29;
		this.frms.comic.acquire(true);
		this.frms.comic.volume++;
		this.comic = this.frms.comic;

		this.form = this.fb.group({
			title: [this.comic.title, Validators.compose([Validators.required, Validators.minLength(2)])],
			volume: [this.comic.volume, Validators.required],
			date: [this.comic.date, Validators.required],
			variant: this.comic.variant,
			acquired: this.comic.acquired,
			price: [this.comic.price, Validators.required]
		});
	}

	// Return valid value for numeric inputs
	/*numeric(input: any, id: string, decimal?: boolean) {
		let value = input.value;
		if (isNaN(value)) {
			value = null;
		} else {
			if (typeof decimal === 'undefined') {
				value = parseInt(value);
			} else {
				value = parseFloat(value).toFixed(2);
			}
	}

		if (value === null || parseFloat(input.value) !== parseFloat(value)) {
			this.comic[id] = value;
		}
	}*/

	save() {
		if (this.form.invalid) {
			alert('Complete lacking fields');
		} else {
			this.frms.add(this.comic).then((result: any) => {
				if (!result.error) {
					console.log('form.comic.added', result);
					if (result.yearUpdated || result.yearNew) {
						this.ys.fetchYears()
							.then(() => this.updateYearComponent(result));
					} else {
						this.updateYearComponent(result);
					}
					this.initializeForm();
				} else {
					alert(result.errorMsg);
				}
			});
		}
	}

	private updateYearComponent(result: any) {
		// Reload records if years service is setted on this year
		let comicYear = result.year;
		let serviceSelectedYear = this.ys.getSelectedYear();
		if (typeof serviceSelectedYear !== 'undefined' && this.ys.getSelectedYear().year === comicYear) {
			console.warn('Same year selected! Lets fetch!');
			this.ys.fillComics();
		} else {
			console.warn('Not same year selected. No fetch needed');
		}
	}

	resetDB() {
		this.frms.destroy();
	}
}