import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor ingresa correo y contraseña.';
      return;
    }

    const res = await this.authService.login(this.email, this.password);

    if (res.success) {
      // Redirección según el rol asignado
      if (res.perfil?.rol === 'administrador') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/pos']);
      }
    } else {
      this.errorMessage = 'Credenciales incorrectas o error al iniciar sesión.';
    }
  }
}