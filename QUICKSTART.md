# SmartPlan AI - Quick Reference

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 🔧 Essential Setup

### 1. Create `.env` file

```bash
cp .env.example .env
```

### 2. Fill in credentials

- Get Firebase config from Firebase Console
- Get OpenRouter API key from openrouter.ai

### 3. Deploy Firestore rules

```bash
firebase deploy --only firestore:rules
```

## 📂 Key Files to Configure

| File              | Purpose                    | Required |
| ----------------- | -------------------------- | -------- |
| `.env`            | API keys & Firebase config | ✅ Yes   |
| `firestore.rules` | Database security          | ✅ Yes   |

## 🎯 Main Features

| Feature         | Screen        | Access                         |
| --------------- | ------------- | ------------------------------ |
| AI Task Planner | `/ai-planner` | Home → AI Task Planner         |
| View Tasks      | `/tasks`      | Home → My Tasks                |
| Quick Notes     | `/notes`      | Home → Quick Notes             |
| Auth            | `/auth`       | Auto-redirect if not logged in |

## 🔐 Firebase Setup Checklist

- [ ] Create Firebase project
- [ ] Enable Authentication → Email/Password
- [ ] Enable Authentication → Anonymous (optional)
- [ ] Create Firestore Database
- [ ] Deploy security rules
- [ ] Copy Firebase config to `.env`

## 🤖 OpenRouter Setup Checklist

- [ ] Create account at openrouter.ai
- [ ] Generate API key
- [ ] Add credits to account
- [ ] Copy API key to `.env`

## 🎨 UI Components

### Priority Colors

- 🔴 **High** - Red (#FF3B30)
- 🟠 **Medium** - Orange (#FF9500)
- 🟢 **Low** - Green (#34C759)

### Navigation

- **Tab Bar** - Home (simplified)
- **Stack** - AI Planner, Tasks, Notes, Auth
- **Modal** - Note Editor

## 📊 Data Flow

```
User Input → AI Service → OpenRouter API → Structured Tasks
                                                ↓
                                        Firebase Firestore
                                                ↓
                                        Task/Note Services
                                                ↓
                                            UI Screens
```

## 🐛 Troubleshooting

### "Firebase config not found"

→ Check `.env` file exists and has all variables

### "OpenRouter API error"

→ Verify API key and account has credits

### "Permission denied" in Firestore

→ Deploy security rules: `firebase deploy --only firestore:rules`

### App won't start

→ Clear cache: `expo start -c`

## 📱 Test User Journey

1. Open app → Auth screen
2. Register with email/password
3. Redirect to Home
4. Tap "AI Task Planner"
5. Enter: "Plan birthday party next Saturday, buy cake, send invitations"
6. Tap "Analyze with AI"
7. Review AI plan
8. Tap "Save Tasks"
9. Go back → Tap "My Tasks"
10. See saved tasks
11. Toggle task completion
12. Go back → Tap "Quick Notes"
13. Tap + button
14. Type note → Save
15. Logout from Home

## 💡 Tips

- Use meaningful task descriptions for better AI analysis
- AI works best with context-rich input
- Anonymous login for quick testing
- Pull to refresh on Tasks and Notes screens
- Long-press note cards for quick delete

## 📞 Support

For detailed instructions, see:

- [SETUP.md](SETUP.md) - Complete setup guide
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Implementation details
- [app.txt](app.txt) - Project specification

## ✅ Verification

Run through this checklist to ensure everything works:

```bash
# 1. Dependencies installed
npm install

# 2. Environment configured
cat .env  # Should show your credentials

# 3. Start app
npm start

# 4. Test features
# - Register new user
# - Create tasks with AI
# - View tasks
# - Create notes
# - Logout and login again
```

---

**Ready to go! Start building your productive life with AI! 🎉**
