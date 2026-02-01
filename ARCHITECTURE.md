# SmartPlan AI - Architecture Overview

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│  ┌────────────┐  ┌────────────┐  ┌────────┐  ┌──────────┐  │
│  │    Auth    │  │    Home    │  │  Tasks │  │   Notes  │  │
│  │   Screen   │  │  Dashboard │  │ Screen │  │  Screen  │  │
│  └────────────┘  └────────────┘  └────────┘  └──────────┘  │
│         │               │              │            │        │
│         └───────────────┴──────────────┴────────────┘        │
│                         │                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              AI Planner Screen                        │  │
│  │  • Text Input  • AI Analysis  • Task Preview         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Context Layer (State)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AuthContext - User state, Login/Logout methods       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer (Logic)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ authService  │  │ taskService  │  │  noteService    │  │
│  │ • login()    │  │ • getTasks() │  │  • getNotes()   │  │
│  │ • register() │  │ • create()   │  │  • create()     │  │
│  │ • logout()   │  │ • update()   │  │  • update()     │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               aiService (OpenRouter)                  │  │
│  │  • analyzeAndPlan() - Converts text to tasks         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
┌────────────────────────┐   ┌──────────────────────┐
│   Firebase Backend     │   │   OpenRouter API     │
│                        │   │                      │
│  ┌──────────────────┐ │   │  ┌────────────────┐ │
│  │  Authentication  │ │   │  │  GPT-4o-mini   │ │
│  │  • Email/Pass    │ │   │  │  AI Model      │ │
│  │  • Anonymous     │ │   │  └────────────────┘ │
│  └──────────────────┘ │   │                      │
│                        │   └──────────────────────┘
│  ┌──────────────────┐ │
│  │    Firestore     │ │
│  │  ┌────────────┐  │ │
│  │  │   tasks    │  │ │
│  │  │   notes    │  │ │
│  │  └────────────┘  │ │
│  │  Security Rules  │ │
│  └──────────────────┘ │
└────────────────────────┘
```

## 📊 Data Flow Diagrams

### Authentication Flow

```
User Registration/Login
    │
    ▼
authService.login()
    │
    ▼
Firebase Auth
    │
    ▼
AuthContext updates
    │
    ▼
User object stored
    │
    ▼
Navigate to Home
```

### AI Task Planning Flow

```
User enters text
    │
    ▼
aiService.analyzeAndPlan()
    │
    ▼
OpenRouter API (GPT-4o-mini)
    │
    ▼
JSON response parsed
    │
    ▼
Display task preview
    │
    ▼
User confirms
    │
    ▼
taskService.createTasks()
    │
    ▼
Firestore saves tasks
    │
    ▼
Navigate to Task List
```

### Task Management Flow

```
User opens Tasks screen
    │
    ▼
taskService.getTasks(userId)
    │
    ▼
Firestore query (filtered by userId)
    │
    ▼
Tasks displayed & grouped by date
    │
    ▼
User toggles completion
    │
    ▼
taskService.toggleTaskCompletion()
    │
    ▼
Firestore updated
    │
    ▼
UI refreshes
```

### Notes Flow

```
User creates/edits note
    │
    ▼
noteService.createNote() / updateNote()
    │
    ▼
Firestore saves note
    │
    ▼
noteService.getNotes(userId)
    │
    ▼
Notes displayed (sorted by updatedAt)
```

## 🔐 Security Architecture

```
┌────────────────────────────────────────┐
│          Firebase Auth Layer           │
│  • Verifies user identity              │
│  • Issues auth tokens                  │
│  • Manages sessions                    │
└────────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────┐
│       Firestore Security Rules         │
│                                        │
│  Rule: request.auth.uid == userId      │
│                                        │
│  ✅ Allows: User's own data            │
│  ❌ Denies: Other users' data          │
└────────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────┐
│         Application Layer              │
│  • All queries filtered by userId      │
│  • Services enforce user isolation     │
│  • Context checks auth state           │
└────────────────────────────────────────┘
```

## 📱 Screen Navigation Tree

```
App Root
│
├─ index.tsx (Auth Gate)
│   │
│   ├─ Logged In → /(tabs)/index
│   └─ Logged Out → /auth
│
├─ /auth
│   └─ Login/Register/Anonymous
│
├─ /(tabs)/
│   └─ index (Home Dashboard)
│       ├─ AI Planner Button → /ai-planner
│       ├─ My Tasks Button → /tasks
│       └─ Quick Notes Button → /notes
│
├─ /ai-planner
│   ├─ Input Form
│   ├─ AI Analysis
│   └─ Task Preview & Save
│
├─ /tasks
│   ├─ Filter Tabs
│   ├─ Task List (grouped by date)
│   └─ Completion Toggle
│
└─ /notes
    ├─ Note List
    ├─ Create Note (Modal)
    └─ Edit/Delete Note
```

## 🗂️ File Structure

```
smartplan-ai/
│
├── app/                          # Screens (Expo Router)
│   ├── index.tsx                 # Auth gate
│   ├── _layout.tsx               # Root layout + AuthProvider
│   ├── auth.tsx                  # Login/Register
│   ├── ai-planner.tsx            # AI Task Planner
│   ├── tasks.tsx                 # Task Management
│   ├── notes.tsx                 # Quick Notes
│   └── (tabs)/
│       ├── _layout.tsx           # Tab navigation
│       └── index.tsx             # Home Dashboard
│
├── services/                     # Business Logic
│   ├── authService.ts            # Auth operations
│   ├── taskService.ts            # Task CRUD
│   ├── noteService.ts            # Note CRUD
│   └── aiService.ts              # OpenRouter integration
│
├── context/                      # State Management
│   └── AuthContext.tsx           # Auth state
│
├── config/                       # Configuration
│   └── firebase.ts               # Firebase init
│
├── constants/                    # Constants
│   ├── theme.ts                  # Theme colors
│   └── styles.ts                 # Style constants
│
├── components/                   # Reusable UI
│   └── ui/                       # UI components
│
├── .env.example                  # Environment template
├── firestore.rules               # Security rules
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
│
└── docs/
    ├── README.md                 # Overview
    ├── SETUP.md                  # Setup guide
    ├── IMPLEMENTATION.md         # Implementation details
    ├── QUICKSTART.md             # Quick reference
    └── ARCHITECTURE.md           # This file
```

## 🔄 State Management

### AuthContext

```typescript
{
  user: User | null,           // Current user
  loading: boolean,            // Auth check in progress
  login: (email, password),    // Login method
  register: (email, password), // Register method
  loginAnonymously: (),        // Anonymous login
  logout: ()                   // Logout method
}
```

### Component State

- **AI Planner**: input, plan, loading
- **Tasks**: tasks[], filter, loading, refreshing
- **Notes**: notes[], modalVisible, noteContent, editingNote

## 🎨 Design System

### Colors

- Primary: `#007AFF` (iOS Blue)
- Success: `#34C759` (Green)
- Warning: `#FF9500` (Orange)
- Danger: `#FF3B30` (Red)

### Typography

- Title: 28px, Bold
- Subtitle: 18px, Semibold
- Body: 16px, Regular
- Caption: 14px, Regular

### Spacing

- XS: 4px
- SM: 8px
- MD: 12px
- LG: 16px
- XL: 20px
- XXL: 24px

## 🚀 Performance Considerations

1. **Lazy Loading**: Screens loaded on-demand via Expo Router
2. **Optimistic Updates**: UI updates before Firestore confirmation
3. **Pull to Refresh**: Manual data refresh option
4. **Efficient Queries**: Firestore queries filtered and indexed
5. **AsyncStorage**: Persistent auth sessions
6. **Error Boundaries**: Graceful error handling

## 📈 Scalability

### Current Limitations

- Frontend-only (no backend server)
- API keys exposed in client
- Limited offline support
- No real-time updates

### Production Improvements

1. Backend proxy for API calls
2. Server-side rendering
3. WebSocket for real-time updates
4. Offline-first architecture
5. CDN for static assets
6. Load balancing
7. Caching layer

## 🔍 Monitoring & Analytics

### Potential Integrations

- Firebase Analytics
- Crashlytics
- Performance Monitoring
- User behavior tracking
- Error logging (Sentry)

---

This architecture supports the current MVP while allowing for future scalability and enhancements.
