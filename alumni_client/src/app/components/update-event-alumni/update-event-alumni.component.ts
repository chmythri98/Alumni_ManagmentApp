import { Component } from '@angular/core';
import { Firestore, collection, query, where, doc, updateDoc } from '@angular/fire/firestore';
import { getDocs } from 'firebase/firestore';
import { MatSnackBar, } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-update-event-alumni',
  templateUrl: './update-event-alumni.component.html',
  styleUrls: ['./update-event-alumni.component.scss'],
   standalone: true,
  imports: [ MatProgressSpinnerModule]
})

export class UpdateEventAlumniComponent {
  isLoading = false;
  updatedCount = 0;
  cancelRequested = false;

  constructor(private firestore: Firestore, private snack: MatSnackBar) {}

  cancelSync() {
    this.cancelRequested = true;
    this.isLoading = false;
  }

  async syncEventDataOnce() {
    this.isLoading = true;
    this.updatedCount = 0;
    this.cancelRequested = false;

    const eventRef = collection(this.firestore, 'event_alumni');
    const eventDocs = await getDocs(eventRef);

    console.log(`📌 Total event records found: ${eventDocs.size}`);

    for (const eventDoc of eventDocs.docs) {
      if (this.cancelRequested) {
        console.log("❌ Sync stopped by user");
        return;
      }

      const eventData = eventDoc.data();
      const studentId = eventData['studentId'];

      if (!studentId) {
        console.log(`⚠️ Missing studentId for event record: ${eventDoc.id}`);
        continue;
      }

      // Skip already-updated ones
      if (eventData['graduationYear']) {
        console.log(`⏭ Skipping (already updated): ${studentId}`);
        continue;
      }

      const alumniRef = collection(this.firestore, 'alumni');
      const q = query(alumniRef, where('Student ID', '==', studentId));
      const alumniDocs = await getDocs(q);

      if (alumniDocs.empty) {
        console.log(`❌ No matching alumni found for studentId: ${studentId}`);
        continue;
      }

      const s = alumniDocs.docs[0].data();

      const updatePayload: any = {
     
        graduationYear: s['Graduation Year'],
        major: s['Major'],
      
      };

      const eventDocRef = doc(this.firestore, 'event_alumni', eventDoc.id);
      await updateDoc(eventDocRef, updatePayload);

      this.updatedCount++;
      console.log(`✔ Updated (${this.updatedCount}): studentId = ${studentId} → eventDoc = ${eventDoc.id}`);
    }

    this.isLoading = false;
    this.snack.open(`Updated ${this.updatedCount} records 🎉`, 'OK', { duration: 4500 });
    console.log("🎉 Sync completed");
  }
}
