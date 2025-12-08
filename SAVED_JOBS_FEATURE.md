# Saved Jobs Feature Documentation

## Overview
The Saved Jobs feature allows users to bookmark jobs for later review. Jobs can be saved from the "All Jobs" tab and viewed in the dedicated "Saved Jobs" tab.

## What Was Implemented

### 1. **Database Table** (`saved_jobs`)
A new table to store user-saved jobs with:
- User-job relationship tracking
- Job data snapshot at save time
- Optional notes field for each saved job
- Automatic timestamps
- RLS policies for security

### 2. **Updated Components**

#### **JobCard.jsx**
- Added heart icon button for save/unsave
- Visual feedback for saved state (filled red heart)
- Optimistic UI updates
- Error handling for save operations
- Disabled state while saving

#### **AllJobsTab.jsx**
- Fetches user's saved job IDs on mount
- Tracks saved state for each displayed job
- Passes saved state to JobCard components
- Updates saved state when user saves/unsaves

#### **SavedJobsTab.jsx** (NEW)
- Displays all user's saved jobs
- Beautiful empty state
- Delete all saved jobs functionality
- Stats display (total count, latest save date)
- Real-time updates when jobs are unsaved

### 3. **Dashboard Integration**
- SavedJobsTab replaces placeholder content
- Seamless tab switching
- Consistent UI/UX with other tabs

## Features

### ✨ **Core Functionality**
- ✅ Save jobs with one click
- ✅ Unsave jobs easily
- ✅ View all saved jobs in dedicated tab
- ✅ Delete all saved jobs at once
- ✅ Persistent storage in database
- ✅ Real-time UI updates

### 🎨 **UI/UX**
- Beautiful heart icon button
- Smooth animations
- Visual feedback (filled heart = saved)
- Loading states
- Error handling
- Empty state with call-to-action

### 🔒 **Security**
- Row Level Security (RLS) policies
- Users can only see their own saved jobs
- Automatic user association
- Protected against unauthorized access

## Database Setup

Run the SQL script in `saved-jobs-setup.sql`:

```bash
# Open Supabase SQL Editor and run:
# saved-jobs-setup.sql
```

This creates:
1. **saved_jobs table** with proper schema
2. **Indexes** for performance
3. **RLS policies** for security
4. **Helper function** for quick lookups

### Table Schema

```sql
CREATE TABLE public.saved_jobs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id bigint NOT NULL,
  job_data jsonb NOT NULL,
  saved_at timestamp with time zone DEFAULT now(),
  notes text NULL,
  CONSTRAINT saved_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT unique_user_job UNIQUE (user_id, job_id)
);
```

### Key Features of Schema
- **user_id**: Links to authenticated user
- **job_id**: References the job from `job_jobrole_all`
- **job_data**: Stores complete job data as JSON snapshot
- **saved_at**: Automatic timestamp
- **notes**: Optional field for user notes (future enhancement)
- **unique constraint**: Prevents duplicate saves

## Usage

### For Users

#### **Saving a Job**
1. Navigate to "All Jobs" tab
2. Browse jobs
3. Click the heart icon on any job card
4. Heart fills with red = job is saved
5. Job now appears in "Saved Jobs" tab

#### **Unsaving a Job**
1. Click the filled heart icon on a saved job
2. Heart becomes outline = job is unsaved
3. In "Saved Jobs" tab, job is removed from list

#### **Viewing Saved Jobs**
1. Click "Saved Jobs" tab in sidebar
2. See all your saved jobs
3. Click "View Job" to visit the posting
4. Click heart to unsave
5. Use "Remove All" to clear all saved jobs

### For Developers

#### **JobCard Props**
```javascript
<JobCard
  job={jobData}           // Job object from database
  isSaved={boolean}       // Is this job saved by user?
  onSaveToggle={(jobId, isSaved) => {}}  // Callback when save state changes
/>
```

#### **Detecting Saved State**
The AllJobsTab fetches saved job IDs and passes to JobCard:
```javascript
const [savedJobIds, setSavedJobIds] = useState(new Set());

// In render:
isSaved={savedJobIds.has(job.job_id)}
```

## Code Flow

### **Saving a Job**
1. User clicks heart icon
2. `handleSaveToggle()` in JobCard executes
3. Insert row into `saved_jobs` table
4. Update local state (optimistic UI)
5. Call `onSaveToggle` callback
6. Parent component updates saved job IDs
7. UI reflects saved state

### **Loading Saved Jobs**
1. User navigates to "Saved Jobs" tab
2. `fetchSavedJobs()` queries database
3. Filter by current user ID
4. Order by saved_at DESC
5. Display job cards with isSaved=true
6. Show stats and delete all option

## API Reference

### **Supabase Queries**

#### Fetch Saved Job IDs
```javascript
const { data, error } = await supabase
  .from('saved_jobs')
  .select('job_id')
  .eq('user_id', user.id);
```

#### Save a Job
```javascript
const { error } = await supabase
  .from('saved_jobs')
  .insert([{
    user_id: user.id,
    job_id: job.job_id,
    job_data: job,
  }]);
```

#### Unsave a Job
```javascript
const { error } = await supabase
  .from('saved_jobs')
  .delete()
  .eq('user_id', user.id)
  .eq('job_id', job.job_id);
```

#### Fetch All Saved Jobs
```javascript
const { data, error } = await supabase
  .from('saved_jobs')
  .select('*')
  .eq('user_id', user.id)
  .order('saved_at', { ascending: false });
```

#### Delete All Saved Jobs
```javascript
const { error } = await supabase
  .from('saved_jobs')
  .delete()
  .eq('user_id', user.id);
```

## Testing

### **Manual Testing Steps**

1. **Setup**
   - Run saved-jobs-setup.sql in Supabase
   - Verify table exists
   - Log in to your application

2. **Test Save**
   - Go to "All Jobs" tab
   - Click heart on a job
   - Verify heart fills with red
   - Check network tab for successful insert
   - Go to "Saved Jobs" tab
   - Verify job appears

3. **Test Unsave**
   - Go to "Saved Jobs" tab
   - Click filled heart on a saved job
   - Verify job disappears from list
   - Go to "All Jobs" tab
   - Verify heart is outlined (not filled)

4. **Test Delete All**
   - Save multiple jobs
   - Go to "Saved Jobs" tab
   - Click "Remove All"
   - Confirm dialog
   - Verify all jobs removed
   - Verify empty state shown

5. **Test Persistence**
   - Save some jobs
   - Log out
   - Log back in
   - Go to "Saved Jobs" tab
   - Verify jobs are still saved

### **Edge Cases to Test**
- ✅ Duplicate save attempts (should be handled gracefully)
- ✅ Saving when not logged in (shows alert)
- ✅ Network errors (shows error message)
- ✅ Empty saved jobs list (shows empty state)
- ✅ Rapid clicking heart button (disabled while saving)

## Troubleshooting

### **Jobs not saving?**
1. Check if saved_jobs table exists
2. Verify RLS policies are enabled
3. Check user is logged in
4. Look for errors in browser console
5. Check Supabase logs

### **Saved jobs not showing?**
1. Verify query is filtering by correct user_id
2. Check RLS policies allow reading
3. Ensure job_data JSONB column exists
4. Check console for fetch errors

### **Heart icon not updating?**
1. Check if onSaveToggle callback is firing
2. Verify savedJobIds state is updating
3. Look for React key warnings
4. Check isSaved prop is being passed correctly

## Future Enhancements

### **Planned Features**
1. **Notes**: Add personal notes to saved jobs
2. **Folders**: Organize saved jobs into folders/categories
3. **Email Reminders**: Get notified about saved jobs
4. **Export**: Export saved jobs to CSV/PDF
5. **Share**: Share saved job lists with others
6. **Search**: Search within saved jobs
7. **Filters**: Filter saved jobs by company, location, etc.
8. **Archive**: Archive old saved jobs without deleting

### **Technical Improvements**
1. Offline support with service workers
2. Batch operations for multiple saves/unsaves
3. Real-time sync across devices
4. Analytics on save behavior
5. Job expiration notifications

## Files Created/Modified

### ✨ **New Files**
- `saved-jobs-setup.sql` - Database schema and setup
- `src/components/SavedJobsTab.jsx` - Saved jobs display component

### 📝 **Modified Files**
- `src/components/JobCard.jsx` - Added save button
- `src/components/AllJobsTab.jsx` - Track saved job IDs
- `src/pages/Dashboard.jsx` - Integrated SavedJobsTab

## Summary

The Saved Jobs feature provides a complete bookmarking system for jobs:
- **Users** can easily save jobs for later review
- **Developers** have a clean API to work with
- **Database** is properly secured with RLS
- **UI** is intuitive and beautiful

This feature enhances user engagement and helps job seekers organize their job search effectively.

---

**Built with ❤️ using React, Supabase, and TailwindCSS**
