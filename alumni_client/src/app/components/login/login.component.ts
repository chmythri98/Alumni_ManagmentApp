import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  MatCardModule
} from '@angular/material/card';
import {
  MatFormFieldModule
} from '@angular/material/form-field';
import {
  MatInputModule
} from '@angular/material/input';
import {
  MatButtonModule
} from '@angular/material/button';
import {
  MatIconModule
} from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class LoginComponent {
  email = '';
  password = '';
  hidePassword = true;
  loading = false;

  constructor(private auth: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  async login() {
    this.loading = true;
    try {
      await this.auth.login(this.email, this.password);
      this.snackBar.open('✅ Login successful! Welcome back.', 'Close', {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['success-snackbar']
      });
      this.router.navigate(['/home']);
    } catch (err: any) {
      this.snackBar.open('❌ ' + err.message, 'Close', {
        duration: 4000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading = false;
    }
  }
}
