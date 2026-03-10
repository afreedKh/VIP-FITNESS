# VIP Fitness – Setup Guide

## 1. Install dependencies
```bash
npm install
```

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project → Add a web app
3. Copy the config values into `.env`
4. Go to **Firestore Database** → Create database → Start in test mode
5. In Firestore, the app will auto-create a `gallery` collection

### Cloudinary Setup
1. Go to [Cloudinary](https://cloudinary.com/) → Sign up / Log in
2. From the Dashboard, copy your **Cloud Name**
3. Go to **Settings → Upload → Upload presets**
4. Create a new **unsigned** upload preset
5. Copy the preset name into `.env` as `VITE_CLOUDINARY_UPLOAD_PRESET`

### Admin Password
Set `VITE_ADMIN_PASSWORD` to whatever you want (default: `vipfitness2024`)

## 3. Start development server
```bash
npm run dev
```

## 4. Routes
| URL | Description |
|-----|-------------|
| `/` | Main homepage |
| `/gallery` | Full gallery with filters & sort |
| `/admin/login` | Admin login page |
| `/admin` | Admin panel (upload & manage media) |

## 5. Firebase Firestore Rules (for production)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gallery/{doc} {
      allow read: if true;
      allow write: if false; // All writes done via backend/admin SDK
    }
  }
}
```

> **Note:** For production, secure Firestore with Firebase Auth or a server-side API route instead of client-side writes.

## 6. Build for production
```bash
npm run build
```
