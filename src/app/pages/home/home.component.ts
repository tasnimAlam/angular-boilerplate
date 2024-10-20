import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { SelectModule, InputModule } from '@ui';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SelectModule, InputModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
