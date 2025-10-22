import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { firstValueFrom, from, map } from 'rxjs';

// ✅ This guard protects routes (e.g. Home)
export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Convert Firebase Auth observable into a Promise
  const user = await new Promise((resolve) =>
    onAuthStateChanged(auth, (u) => resolve(u))
  );

  if (user) {
    return true; // ✅ User logged in → allow navigation
  } else {
    router.navigate(['/login']);
    return false; // 🚫 Not logged in → redirect to login
  }
};
