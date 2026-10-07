import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router'; // Importamos Router
import { Sidebar } from './components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'rancho-los-ruiz';
  
  // Le pedimos a Angular que nos preste el Router
  constructor(public router: Router) {} 
}