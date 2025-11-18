import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  role = '';

  roles = [
    'University Admin',
    'Admissions Officer',
    'Event Coordinator',
    'Department Head',
    'Alumni Relations Manager'
  ];

  loading = false;

  constructor(
    private auth: Auth,
    private db: Firestore,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  async register() {
    if (!this.email || !this.password || !this.firstName || !this.lastName || !this.role) {
      this.snackBar.open('⚠️ Please fill all fields.', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    try {
      // ✅ Create user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(this.auth, this.email, this.password);

      // ✅ Send verification email
      await sendEmailVerification(userCred.user);

      // ✅ Store profile in Firestore under “admin” collection
      const adminRef = doc(collection(this.db, 'admin'), userCred.user.uid);
      await setDoc(adminRef, {
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        role: this.role,
        status: 'pending', // will become 'active' after verification
        createdAt: new Date().toISOString()
      });

      this.snackBar.open('✅ Registration successful! Verification link sent to your email.', 'Close', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });

      // redirect to login
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.snackBar.open('❌ ' + err.message, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
    } finally {
      this.loading = false;
    }
  }
}
