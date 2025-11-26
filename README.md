
# 🎓 **ALUMNI MANAGEMENT WEB APPLICATION**

---

## 📝 **Project Overview**

Managing large alumni populations becomes challenging when the data is scattered across spreadsheets, Google Forms, and manual records. Universities struggle to track alumni progress, organize events, facilitate mentorship, and generate insights for admissions and fundraising.

The **Alumni Management Web Application** centralizes alumni information into one digital platform — enabling administrators to manage alumni records, events, requests, dashboards, and analytics in real time.

---

## 🚀 **Solution Summary**

| Module                     | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| 🔐 Authentication          | Firebase Authentication with secured login & route guards |
| 👤 Alumni Profiles         | View, search, filter, edit & export alumni records        |
| 📄 Profile Update Requests | Admin approval workflow for alumni-submitted forms        |
| 📊 Dashboards & Analytics  | Charts + KPIs from Firestore collections                  |
| 📁 Data Import             | Upload alumni/event spreadsheets directly to Firestore    |
| 📅 Event Management        | Track alumni event participation and history              |
| 🛡️ Role-Based Access      | Admin-only access to dashboard & data operations          |

➡️ The application converts **static alumni records into a live engagement and decision-support system**.

---

## 🔐 **Authentication (Firebase Implementation)**

Authentication is implemented using **Firebase Authentication (Email + Password)**.

### 🔧 How It Works

* Users log in via email and password
* Firebase validates credentials and generates a token
* Angular **route guards (`canActivate`)** restrict unauthorized access
* On logout or token expiry, user is redirected to `/login`

✔ Prevents unauthorized dashboard access
✔ Ensures secure session handling

---

## 🗄️ **Database Structure (Firestore Implementation)**

The system uses **Google Firestore** — a fast, scalable NoSQL database.

### 📌 Major Collections

| Collection             | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `alumni`               | Main alumni master records                       |
| `events`               | List of university alumni events                 |
| `event_alumni`         | Alumni participation in events                   |
| `alumni_form_requests` | Data from Google Form waiting for admin approval |
| `admin`                | Stored list of authorized users                  |

### 🔁 Update Workflow

```
Google Form → alumni_form_requests → Admin Approves → alumni
```

All connected dashboards refresh dynamically once new records are added.

---

## 🌍 **Live Deployed Application**

🔗 **Web App (Firebase Hosting):**
👉 [https://alumnidatamanagmentsystem.web.app/home](https://alumnidatamanagmentsystem.web.app/home)

🔗 **Firebase Console (Admin access only):**
👉 [https://console.firebase.google.com/project/alumnidatamanagmentsystem/firestore/databases](https://console.firebase.google.com/project/alumnidatamanagmentsystem/firestore/databases)

### 🔑 **Demo Credentials**

```
Email: chmadhurya98@gmail.com
Password: App@123
```

⚠ **IMPORTANT:** For production, remove demo credentials and activate enhanced password rules.

---

## 🛠️ **Tech Stack**

| Category    | Tools                                             |
| ----------- | ------------------------------------------------- |
| Frontend    | Angular, TypeScript, HTML, SCSS, Angular Material |
| Backend     | Firebase Authentication, Firestore                |
| Charts      | Chart.js                                          |
| Deployment  | Firebase Hosting                                  |
| File Import | XLSX Library for Excel uploads                    |

---

## ⚙️ **Run the Project Locally**

```bash
git clone https://github.com/your-github-repository
cd alumni-management
npm install
ng serve -o
```

### 🔧 Add Firebase Environment Config

Insert Firebase configuration inside:

```
/src/environments/environment.ts
```

---

## 🚢 **Deploy to Firebase**

```bash
firebase login
firebase init
firebase deploy
```

---

## 👥 **Contributors**

| Role        | Contributor                   |
| ----------- | ----------------------------- |
| Developer   | *Your Name / Team Name*       |
| Institution | Saint Louis University        |
| Project     | Alumni Engagement & Analytics |

---

## 📜 **License**

This project is intended for educational and institutional use only.
Unauthorized commercial usage is not permitted.

---

