import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';

// Allow both normal login & anonymous login
export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  const user = await new Promise((resolve) =>
    onAuthStateChanged(auth, (u) => resolve(u))
  );

  if (user) {
    return true; // ✔ Logged in or Guest
  } else {
    router.navigate(['/login']);
    return false;
  }
};
