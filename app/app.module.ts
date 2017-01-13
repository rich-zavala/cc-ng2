import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { DateValueAccessorModule } from 'angular-date-value-accessor';
import { CustomFormsModule } from 'ng2-validation';

import { DBService } from './services/db.service';
import { YearsService } from './services/years.service';
import { FormService } from './services/form.service';
import { RecordsService } from './services/records.service';

import { OrderByPipe } from './tools/orderBy.pipe';

import { AppComponent } from './app.component';
import { YearComponent } from './years.component';
import { DayComponent } from './day.component';
import { RecordsComponent } from './records.component';
import { FormComponent } from './form.component';


@NgModule({
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		DateValueAccessorModule,
		CustomFormsModule
	],
	declarations: [
		AppComponent,
		YearComponent,
		DayComponent,
		RecordsComponent,
		FormComponent,
		OrderByPipe
	],
	providers: [
		DBService,
		YearsService,
		FormService,
		RecordsService
	],
	bootstrap: [
		AppComponent
	]
})
export class AppModule { }
