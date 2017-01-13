import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { YearComponent } from './years.component';
import { RecordsComponent } from './records.component';
import { FormComponent } from './form.component';

const routes: Routes = [
	{
		path: '',
		redirectTo: '/years',
		pathMatch: 'full'
	},
	{
		path: 'years',
		component: YearComponent
	},
	{
		path: 'records',
		component: RecordsComponent
	},
	{
		path: 'form',
		component: FormComponent
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})

export class AppRoutingModule { }