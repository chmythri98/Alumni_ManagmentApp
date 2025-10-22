import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// ✅ Required for routerLink
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

// ✅ Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

// ✅ Forms and Material (optional global imports)
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // ✅ provideRouter enables routing across the app
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),

    importProvidersFrom(
      FormsModule,
      MatButtonModule,
      MatInputModule,
      MatCardModule,
      MatToolbarModule,
      MatFormFieldModule,
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideAuth(() => getAuth())
    ),
  ],
};
