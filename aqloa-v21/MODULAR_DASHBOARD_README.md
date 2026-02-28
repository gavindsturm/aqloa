# Modular Dashboard Architecture

## New Widget System

All dashboard widgets are now modular components in `/app/dashboard/components/dashboard-widgets/`:

### Available Widgets:

1. **TeamFeed.tsx**
   - Shows team wins and sales
   - Real-time emoji reactions (🔥👏💪🎉🚀💰👍❤️⭐)
   - Format: "Joseph Asmann - Another One Sold! - Approved $651 AP - Term UHL"
   - Each team member can react with emojis

2. **DailyGoals.tsx**
   - Progress bars for daily targets
   - Tracks: Calls, Appointments, Closes
   - Visual progress indicators
   - Celebration message when goal completed

3. **TeamPerformance.tsx**
   - Leaderboard of team members
   - Sorted by revenue
   - Shows closes and total revenue
   - Gold/silver/bronze styling for top 3

4. **StatsOverview.tsx**
   - Grid of stat cards
   - Customizable stats with icons
   - Color-coded by category

5. **TeamChat.tsx**
   - Real-time team messaging
   - Scrollable message history
   - Send button + Enter key support
   - User avatars and timestamps

6. **RecentActivity.tsx**
   - Activity feed
   - Shows: new leads, appointments, sales, calls
   - Color-coded by activity type
   - Timestamps

## How to Use

### Import widgets in your dashboard:

```typescript
import TeamFeed from './components/dashboard-widgets/TeamFeed'
import DailyGoals from './components/dashboard-widgets/DailyGoals'
import TeamPerformance from './components/dashboard-widgets/TeamPerformance'
import StatsOverview from './components/dashboard-widgets/StatsOverview'
import TeamChat from './components/dashboard-widgets/TeamChat'
import RecentActivity from './components/dashboard-widgets/RecentActivity'
```

### Use in your layout:

```typescript
<div className="space-y-6">
  <StatsOverview stats={statsData} />
  
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <TeamFeed />
    <DailyGoals goals={goalsData} />
  </div>
  
  <TeamPerformance teamMembers={teamData} />
  <RecentActivity />
</div>
```

## Key Features Added

### 1. Saved Calculations
- Calculations now save to lead profile
- Fields saved: `selectedCarrier`, `monthlyPremium`, `annualPremium`, `carrierQuotes`
- View saved calculations in lead detail view

### 2. Team Chat
- Added to Team Management tab
- Real-time messaging between team members
- Positioned as sidebar next to team list

### 3. Team Feed with Reactions
- Celebrates team wins
- Emoji reactions (click "+ React" to add)
- Shows who reacted
- Auto-updates

### 4. CSV Upload
- Upload CSV to import leads
- Format: name,phone,email,source,value,age
- Example included in code comments

### 5. Lead Detail Enhancements
- Shows saved calculations if they exist
- Notes section with save button
- Action buttons (Calculate, Call, Email)
- Mini dashboard with quick stats

## Navigation Structure

```
Dashboard (new!)
  ├─ Stats Overview
  ├─ Team Feed (with reactions)
  ├─ Daily Goals
  ├─ Team Performance
  └─ Recent Activity

Leads
  ├─ Stats cards
  ├─ Filters (search, status, source)
  ├─ CSV Upload
  └─ Leads table (click for detail view)

Calendar
  └─ Calendar System component

Team
  ├─ Team list (2/3 width)
  └─ Team Chat (1/3 width)

CRM
  └─ Email/SMS automation
```

## Files Modified

1. `app/dashboard/components/InsuranceToolkit.tsx` - Added calculation saving
2. `app/dashboard/components/TeamManagement.tsx` - Added Team Chat integration
3. `app/dashboard/page.tsx` - Added Dashboard tab and modular widgets
4. `app/page.tsx` - Updated to "Aqloa" with circle design

## Files Created

1. `dashboard-widgets/TeamFeed.tsx`
2. `dashboard-widgets/DailyGoals.tsx`
3. `dashboard-widgets/TeamPerformance.tsx`
4. `dashboard-widgets/StatsOverview.tsx`
5. `dashboard-widgets/TeamChat.tsx`
6. `dashboard-widgets/RecentActivity.tsx`

## Next Steps

The dashboard is now fully modular. You can:
- Add new widgets by creating files in `dashboard-widgets/`
- Rearrange widgets in the main dashboard
- Customize widget data by passing different props
- Extend functionality by modifying individual widget files

All widgets are self-contained and reusable!
