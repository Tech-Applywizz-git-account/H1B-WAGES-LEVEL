# Logout Loading State Feature

## ✅ Feature Added
Added a "Logging out..." loading indicator that displays when the user clicks the logout button.

## 🎯 Changes Made

### 1. **useAuth.js** - Added `loggingOut` state
- Added `loggingOut` state (default: `false`)
- Set to `true` when `signOut()` is called
- Set to `false` in `finally` block after logout completes
- Exposed `loggingOut` in the context value

```javascript
const [loggingOut, setLoggingOut] = useState(false);

const signOut = async () => {
  setLoggingOut(true);
  try {
    // ... logout logic
  } catch (err) {
    // ... error handling
  } finally {
    setLoggingOut(false);
  }
};

const value = {
  user,
  role,
  loading,
  loggingOut, // ✅ Added
  signOut,
};
```

### 2. **Navbar.jsx** - Updated logout buttons
- Destructured `loggingOut` from `useAuth()`
- Updated **desktop dropdown logout button** to show spinner when logging out
- Updated **mobile menu logout button** to show spinner when logging out
- Disabled buttons during logout to prevent multiple clicks

**Desktop Dropdown:**
```jsx
<button
  onClick={handleLogout}
  disabled={loggingOut}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loggingOut ? (
    <>
      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="font-medium">Logging out...</span>
    </>
  ) : (
    <>
      <LogOut size={18} />
      <span className="font-medium">Logout</span>
    </>
  )}
</button>
```

**Mobile Menu:** Same pattern as desktop dropdown

### 3. **Dashboard.jsx** - Updated sidebar logout button
- Destructured `loggingOut` from `useAuth()`
- Updated logout button to show spinner when logging out
- Disabled button during logout

```jsx
<button
  onClick={async () => { await signOut(); navigate("/"); }}
  disabled={loggingOut}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loggingOut ? (
    <>
      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      Logging out...
    </>
  ) : (
    <>
      <svg>...</svg>
      Logout
    </>
  )}
</button>
```

## 🎨 UI Changes

### Before:
- Click logout → Instant navigation (no feedback)
- Button remains clickable (could click multiple times)

### After:
- Click logout → Button shows:
  - Spinning red loading animation
  - Text changes to "Logging out..."
  - Button becomes disabled (prevents multiple clicks)
  - Opacity reduces to 50%
- After logout completes → Navigate to homepage

## 📍 Locations Updated

1. **Navbar Desktop** - Profile dropdown menu
2. **Navbar Mobile** - Mobile hamburger menu
3. **Dashboard Sidebar** - Logout button at bottom

## ✅ Benefits

1. **Better UX** - User gets immediate visual feedback that logout is processing
2. **Prevents Multiple Clicks** - Button is disabled during logout
3. **Professional Feel** - Matches modern web app standards
4. **Consistent Behavior** - Same loading state across all logout buttons
5. **No Functionality Changes** - All existing logout logic preserved

## 🧪 Testing

Test the logout loading state from:
- ✅ Navbar profile dropdown (desktop)
- ✅ Navbar mobile menu
- ✅ Dashboard sidebar logout button

Expected behavior:
1. Click any logout button
2. Button should show spinner and "Logging out..." text
3. Button should be disabled (grayed out, can't click again)
4. After ~1 second, navigate to homepage
5. User should be logged out

---

**No other functionality was touched or modified.**
