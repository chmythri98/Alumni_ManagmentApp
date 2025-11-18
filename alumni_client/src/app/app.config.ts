import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// ✅ Router & animations
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

// ✅ Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore'; // ✅ Added Firestore
import { environment } from './environments/environment';

// ✅ Angular Material + Forms
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import {  MatDialogActions, MatDialogClose, MatDialogModule } from '@angular/material/dialog';

export const appConfig: ApplicationConfig = {
  providers: [
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
      MatDialogModule,
      MatDialogActions,
      MatDialogClose,
      FormsModule,   
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatCardModule,
         
      

      // ✅ Initialize Firebase + Firestore
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()) 
    ),
  ],
};
