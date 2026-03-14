# ArchTrack Interactive Cookbook
## Employee Onboarding - Learn by Building

This interactive cookbook teaches new employees how to use ArchTrack while they actually set up their own tracking dashboard. By the end, they'll have a personalized tracking view and understand the system.

---

## What You'll Build

A personalized ArchTrack dashboard view that shows:
- Your assigned projects and tasks
- Your productivity metrics
- Quick access to time tracking
- Custom alerts for your workflow

---

## Prerequisites

Before starting:
1. You have ArchTrack desktop app installed
2. Your manager has created your employee account
3. You have your login credentials

---

## Step 1: Understanding the Architecture (5 minutes)

**Concept:** ArchTrack has two main components:
- **Desktop App** - Runs on your computer, tracks activity
- **Admin Dashboard** - Web interface for viewing reports

**Activity:** 
- Open the ArchTrack desktop app
- Notice the system tray icon - this is how you know it's running
- The app automatically tracks which applications you're using

**Key Learning:** The desktop tracker runs silently in the background. It doesn't record what you type or sensitive information - only which applications are active and for how long.

---

## Step 2: Log Into Your Dashboard (5 minutes)

**Concept:** The admin dashboard is where you view your tracked time, productivity scores, and assigned tasks.

**Activity:**
1. Open your browser and navigate to: [Your company's ArchTrack URL]
2. Log in with your credentials
3. You'll see the main dashboard with:
   - Your profile card (left sidebar)
   - Activity timeline (center)
   - Quick stats (top cards)

**Key Learning:** The dashboard updates in real-time via WebSocket. As you work, your activity appears here within seconds.

---

## Step 3: Understanding Productivity Scoring (10 minutes)

**Concept:** ArchTrack classifies activities as productive, neutral, or unproductive based on your role.

**Activity:**
1. Look at your "Productivity Score" card
2. Click on "View Details" to see the breakdown
3. Notice the categories:
   - **Productive:** CAD software, project management, documentation
   - **Neutral:** Email, file browsing, communication tools
   - **Unproductive:** Social media, gaming, entertainment

**Customization:**
- Click "Customize Categories" 
- Drag applications to the appropriate category for YOUR role
- An architect might classify SketchUp as productive, while admin staff might not

**Key Learning:** Productivity is role-specific. What matters is whether the activity contributes to YOUR work goals.

---

## Step 4: Project and Task Assignment (10 minutes)

**Concept:** Time is tracked against projects and tasks for accurate billing and resource allocation.

**Activity:**
1. Navigate to the "Projects" tab
2. You'll see projects you've been assigned to
3. Click on a project to see:
   - Project details and deadline
   - Tasks assigned to you
   - Hours logged by team members

**Practice:**
- Click on your name in the "Team" section
- See all your assigned tasks across projects
- Note the priority levels and due dates

**Key Learning:** Always check your task assignments at the start of each day. This helps the system categorize your time correctly.

---

## Step 5: Time Entry and Manual Logging (10 minutes)

**Concept:** While ArchTrack auto-tracks activity, you may need to manually log time for meetings, site visits, or offline work.

**Activity:**
1. Go to the "Time Entries" tab
2. Click "Add Manual Entry"
3. Fill in:
   - Date and time range
   - Project and task
   - Description of work done
   - Mark as billable/non-billable

**Best Practice:**
- Log manual entries at the end of each day
- Be specific in descriptions: "Client meeting regarding facade design" not just "meeting"
- Always associate with a project when possible

**Key Learning:** Manual entries fill gaps in auto-tracking. They're essential for accurate client billing.

---

## Step 6: Understanding Alerts (5 minutes)

**Concept:** ArchTrack detects suspicious or unproductive patterns and alerts managers.

**Common Alerts:**
- **YouTube Idle:** YouTube open but no keyboard/mouse activity
- **Rapid Switching:** Constantly changing apps (distraction indicator)
- **Extended Break:** No activity for >30 minutes during work hours
- **Off-Hours Activity:** Work happening outside scheduled hours

**Your Role:**
- Don't panic if you see an alert on your record
- Most are false positives (YouTube playing music while you work in CAD)
- Managers understand context - alerts are conversation starters, not accusations

**Key Learning:** Alerts help identify burnout, disengagement, or training needs. They're not punitive tools.

---

## Step 7: Generate Your First Report (10 minutes)

**Concept:** Reports help you understand your work patterns and productivity trends.

**Activity:**
1. Go to the "Reports" tab
2. Select "Personal Productivity Report"
3. Choose date range: Last 7 days
4. Click "Generate"

**Analyze Your Report:**
- **Productivity Trend:** Are you improving over time?
- **Peak Hours:** When are you most productive?
- **App Usage:** Which tools do you use most?
- **Project Breakdown:** Where is your time going?

**Action Item:** Based on your report, identify one productivity improvement to work on this week.

---

## Step 8: Build Your Personal Dashboard View (15 minutes)

**Now the fun part!** Let's create a custom dashboard view just for you.

**Activity:**

1. **Create a new view:**
   - Click "Customize Dashboard"
   - Select "Create Personal View"
   - Name it: "[Your Name] - Daily View"

2. **Add these widgets:**
   - Today's Tasks (priority sorted)
   - Productivity Score (real-time)
   - Active Project Timeline
   - Weekly Hours Summary
   - Recent Alerts (if any)

3. **Arrange your layout:**
   - Drag widgets to preferred positions
   - Resize based on importance
   - Save your layout

**Key Learning:** A personalized dashboard helps you stay focused on what matters to YOUR role.

---

## Step 9: Desktop App Settings (5 minutes)

**Concept:** Configure the desktop tracker to work best for your setup.

**Activity:**
1. Right-click the ArchTrack system tray icon
2. Select "Settings"
3. Configure:
   - **Idle Time:** How long before you're considered idle (default: 5 min)
   - **Screenshots:** Enable/disable (if your company allows)
   - **Startup:** Launch on system start (recommended)
   - **Privacy Mode:** Pause tracking when needed

**Important:** Privacy Mode is for personal breaks, not to hide unproductive time. Use it ethically.

---

## Step 10: Best Practices Checklist

**Daily:**
- [ ] Check assigned tasks in the morning
- [ ] Log any manual time entries
- [ ] Review productivity score

**Weekly:**
- [ ] Generate personal productivity report
- [ ] Review time allocation across projects
- [ ] Check for any alerts on your record

**Monthly:**
- [ ] Discuss productivity trends with manager
- [ ] Update app categorizations if needed
- [ ] Review and optimize your dashboard layout

---

## Troubleshooting Common Issues

### "My activity isn't showing up"
- Check desktop app is running (system tray icon)
- Verify you're logged into the correct account
- Check network connection
- Try restarting the desktop app

### "Productivity score seems wrong"
- Review your app categorizations
- Remember: score is role-specific
- Manual entries might not be categorized yet

### "I forgot to log manual time"
- Add entries as soon as you remember
- Be accurate with times - don't guess
- Add a note explaining the late entry

### "Desktop app keeps crashing"
- Check for updates
- Restart your computer
- Contact IT with error logs (found in Settings > Logs)

---

## Advanced Features (Optional)

Once you're comfortable with basics, explore:

### Keyboard Shortcuts
- `Ctrl+Shift+A` - Quick add manual time entry
- `Ctrl+Shift+P` - Toggle privacy mode
- `Ctrl+Shift+R` - Refresh dashboard

### Integration with Calendar
- Connect your Google/Outlook calendar
- Auto-categorize meeting time
- Block focus time on calendar

### Mobile Access
- Access dashboard from phone browser
- View-only mode for checking stats on-the-go
- Get push notifications for urgent tasks

---

## Congratulations! 🎉

You've completed the ArchTrack onboarding cookbook!

**What you've accomplished:**
- ✅ Understand how ArchTrack tracks activity
- ✅ Navigated the admin dashboard
- ✅ Customized productivity categories
- ✅ Learned to log manual time entries
- ✅ Generated your first productivity report
- ✅ Built a personalized dashboard view
- ✅ Configured desktop app settings

**You're now ready to:**
- Use ArchTrack effectively in your daily work
- Interpret your productivity data
- Maintain accurate time records
- Communicate with managers about your work patterns

---

## Feedback

How did this interactive cookbook work for you?
- What was most helpful?
- What was confusing?
- What would you add?

Share feedback with your manager or IT team to improve onboarding for future employees.

---

*Generated from Ben's Bites Newsletter - March 13, 2026*
*Interactive Cookbook Pattern by Ben Tossell*
