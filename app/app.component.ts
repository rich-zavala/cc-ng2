import { Component } from '@angular/core';

@Component({
	selector: 'my-app',
	template: `<div>
							<h3>Comic manager</h3>
							<hr />
							<button [routerLink]="['/years']">Years</button>
							<button [routerLink]="['/form']">Add record</button>
							<button [routerLink]="['/records']">Find record</button>
							<hr />
							<router-outlet></router-outlet>
						</div>`
})
export class AppComponent {
	constructor() { }
}
