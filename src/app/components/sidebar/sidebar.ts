import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  colapsado = false; // Variable para saber si está escondido

  toggleMenu() {
    this.colapsado = !this.colapsado;
  }
}