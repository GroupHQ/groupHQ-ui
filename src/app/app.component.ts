import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {'class': 'page-container'}
})
export class AppComponent {
  title = 'groupHQ-UI';
}
