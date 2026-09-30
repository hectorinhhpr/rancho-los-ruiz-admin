import { Component } from '@angular/core';
import { Router } from '@angular/router'; // 1. Importamos la herramienta de navegación

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  
  // 2. Le pedimos prestado el Router a Angular
  constructor(private router: Router) {}

  // 3. Creamos la función del botón (Atajo temporal para tus pruebas)
  iniciarSesion() {
    this.router.navigate(['/pos']); 
  }
  
}