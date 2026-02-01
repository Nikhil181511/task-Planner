# SmartPlan AI 🚀

A personal productivity mobile app built with React Native (Expo) that uses AI to convert unstructured text into organized, trackable tasks.

## Features

✨ **AI Task Planner** - Convert messy ideas into structured tasks using OpenRouter AI  
📋 **Task Management** - View, track, and complete tasks with priorities and schedules  
📝 **Quick Notes** - Save quick thoughts and ideas like a digital notebook  
🔐 **User Authentication** - Secure login with Firebase (email/password + anonymous)  
☁️ **Cloud Sync** - All data stored in Firebase Firestore

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

You'll need:

- **Firebase credentials** (from Firebase Console)
- **OpenRouter API key** (from OpenRouter.ai)

See [SETUP.md](SETUP.md) for detailed setup instructions.

### 3. Run the App

```bash
npm start
```

Then scan the QR code with Expo Go app or press:

- `i` for iOS simulator
- `a` for Android emulator

## Project Structure

```
app/
├── (tabs)/          # Tab navigation
├── auth.tsx         # Login/Register screen
├── ai-planner.tsx   # AI Task Planner
├── tasks.tsx        # Task Management
└── notes.tsx        # Quick Notes

services/
├── authService.ts   # Authentication logic
├── taskService.ts   # Task CRUD operations
├── noteService.ts   # Note CRUD operations
└── aiService.ts     # OpenRouter integration

config/
└── firebase.ts      # Firebase configuration
```

## Tech Stack

- **Frontend**: React Native (Expo)
- **Navigation**: Expo Router
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI**: OpenRouter API (GPT-4o-mini)
- **Language**: TypeScript

## Security

Firestore security rules ensure:

- Users can only access their own data
- All queries filtered by `userId`
- Authentication required for all operations

Deploy rules with:

```bash
firebase deploy --only firestore:rules
```

## Documentation

📖 **Complete Guides:**

- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Start here! Complete overview
- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference card
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - What was built
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture
- **[app.txt](app.txt)** - Original specification

## License

Private - Personal Use Only

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
