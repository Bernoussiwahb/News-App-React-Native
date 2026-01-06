# PulseWave News App (Expo + React Native)

PulseWave is a modern news app built with Expo and React Native. It includes
Firebase authentication, profile management, favorites storage in Firestore,
and news discovery powered by News API.

## Features

- Email/password authentication (Firebase Auth)
- Profile editing with preferred genres
- Home feed with featured categories and article grid
- Search for news articles
- Favorites synced to Firestore
- Article details view with full info and original link

## Requirements

- Node.js (LTS recommended)
- Expo Go (mobile testing)

## Getting Started

1) Install dependencies

```bash
npm install
```

2) Configure Firebase

Update the file `src/config/firebase.js` with your Firebase web config.

3) Configure News API

Create a News API key at https://newsapi.org.
Then update `src/config/newsApi.js`:

```js
export const NEWS_API_KEY = 'YOUR_NEWS_API_KEY';
```

Note: Do not commit your API key to a public repo.

4) Start the app

```bash
npm start -- --clear
```

Scan the QR code with Expo Go (Android/iOS).

## Firebase Setup (Quick Steps)

1) Create a project in Firebase Console.
2) Enable Email/Password auth under Build -> Authentication.
3) Create a Firestore database under Build -> Firestore Database.
4) Use these Firestore rules for user profiles and favorites:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Project Structure

```
src/
  components/      Reusable UI components
  config/          Firebase and News API config
  constants/       Static data (genres)
  context/         Auth context
  hooks/           Favorites hook
  navigation/      App navigation
  screens/         App screens
  services/        News API service
  theme/           Colors and styling
```

## Scripts

- `npm start`        Start Expo dev server
- `npm run android` Run on Android
- `npm run ios`     Run on iOS (macOS only)
- `npm run web`     Run web build
