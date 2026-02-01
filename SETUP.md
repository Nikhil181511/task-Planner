# SmartPlan AI - Setup Guide

## Prerequisites

- Node.js 18+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- Firebase account
- OpenRouter API account

## 1. Install Dependencies

```bash
npm install
```

## 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - (Optional) Enable "Anonymous"
4. Create **Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Deploy the security rules from `firestore.rules`
5. Get your Firebase config:
   - Go to Project Settings > Your apps
   - Register a web app
   - Copy the firebaseConfig object

## 3. OpenRouter Setup

1. Go to [OpenRouter](https://openrouter.ai/)
2. Create an account and get your API key
3. Add credits to your account

## 4. Environment Configuration

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

## 5. Deploy Firestore Security Rules

1. Install Firebase CLI:

   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:

   ```bash
   firebase login
   ```

3. Initialize Firebase (if not already done):

   ```bash
   firebase init firestore
   ```

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## 6. Run the App

```bash
npm start
```

Then:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Project Structure

```
smartplan-ai/
├── app/                      # App screens
│   ├── (tabs)/              # Tab navigation screens
│   │   └── index.tsx        # Home screen
│   ├── _layout.tsx          # Root layout
│   ├── auth.tsx             # Authentication screen
│   ├── ai-planner.tsx       # AI Task Planner
│   ├── tasks.tsx            # Task management
│   └── notes.tsx            # Quick notes
├── config/                   # Configuration
│   └── firebase.ts          # Firebase config
├── context/                  # React contexts
│   └── AuthContext.tsx      # Authentication context
├── services/                 # Business logic
│   ├── authService.ts       # Auth operations
│   ├── taskService.ts       # Task CRUD
│   ├── noteService.ts       # Note CRUD
│   └── aiService.ts         # OpenRouter integration
└── components/              # Reusable components
```

## Features

### 1. Authentication

- Email/Password login and registration
- Anonymous login option
- Persistent sessions

### 2. AI Task Planner

- Convert unstructured text into organized tasks
- AI analyzes and suggests:
  - Task breakdown
  - Priority levels
  - Time estimates
  - Scheduling

### 3. Task Management

- View all tasks grouped by date
- Filter by: Today, Upcoming, Completed
- Mark tasks as complete
- Priority indicators
- Time estimates

### 4. Quick Notes

- Fast note creation
- Edit and delete notes
- Auto-save functionality
- Sorted by last updated

## Security

- Firestore rules enforce user isolation
- Each user can only access their own data
- API keys stored in environment variables
- Frontend-only architecture (accepted trade-off)

## Troubleshooting

### Firebase errors

- Verify all Firebase config values in `.env`
- Ensure Authentication is enabled
- Check Firestore rules are deployed

### OpenRouter errors

- Verify API key is correct
- Ensure you have credits in your account
- Check API key has proper permissions

### Build errors

- Clear cache: `expo start -c`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## Future Enhancements

- Backend proxy for API calls (better security)
- Calendar integration
- Push notifications
- Voice input for tasks
- AI-based task rescheduling
- Collaboration features
- Dark mode
