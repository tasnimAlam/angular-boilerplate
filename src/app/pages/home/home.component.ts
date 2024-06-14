import { Component } from '@angular/core';
import { SelectModule, InputModule } from '@ui';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SelectModule, InputModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
