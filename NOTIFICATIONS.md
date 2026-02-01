# Task Notifications

## How It Works

SmartPlan AI now automatically sends you notifications **5 minutes before** each scheduled task starts!

### Features

- ⏰ **Automatic Reminders**: Get notified 5 minutes before every task
- 🔔 **Smart Notifications**: Only active (uncompleted) tasks trigger reminders
- 📱 **Native Integration**: Uses Android/iOS native notification system
- 🔄 **Auto-Updates**: Notifications update when you edit task time or title

### What Triggers Notifications

Notifications are automatically scheduled when:

1. You create a new task via AI Planner
2. You manually add a task
3. You unmark a completed task
4. You update a task's scheduled time

Notifications are automatically cancelled when:

1. You complete a task
2. You delete a task
3. The scheduled time has passed

### Notification Format

```
Title: "Task Starting Soon! ⏰"
Body: "[Your Task Title] starts in 5 minutes"
```

### Permissions

The app will request notification permissions on first launch. Make sure to:

- ✅ Allow notifications when prompted
- ✅ Enable "Exact Alarms" on Android 12+ for precise timing

### Testing

To test notifications:

1. Create a task scheduled for 10 minutes from now
2. Wait 5 minutes
3. You'll receive the notification!

### Troubleshooting

**Not receiving notifications?**

- Check notification permissions in device settings
- Ensure the task time is in the future
- Notifications only work on physical devices (not simulators)
- Make sure battery optimization is disabled for the app

**Notifications delayed?**

- Some Android devices have aggressive battery saving
- Add SmartPlan AI to battery optimization exceptions
