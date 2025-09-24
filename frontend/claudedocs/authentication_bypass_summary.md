# Authentication Bypass for UI Development

## Overview
This document outlines the changes made to bypass the authentication system in the ScoreBoard React application to enable UI development without requiring login credentials.

## Changes Made

### 1. App.tsx - Route Protection Removal
**File**: `/src/App.tsx`

**Changes**:
- Removed `ProtectedRoute` wrapper from all main application routes
- Commented out the `ProtectedRoute` import
- Removed conditional redirect logic for `/auth` route
- Removed unused `isAuthenticated` variable

**Before**:
```tsx
<Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

**After**:
```tsx
<Route path="/" element={<Dashboard />} />
```

### 2. Header.jsx - Navigation Always Visible
**File**: `/src/components/layout/Header.jsx`

**Changes**:
- Removed conditional rendering based on authentication status
- Navigation menu is now always visible
- Admin and Style Guide buttons are always accessible
- Changed user greeting to "UI 개발자님!" for development context
- Modified logout menu item to redirect to login page instead of actual logout

**Before**:
```jsx
{isAuthenticated ? ( /* navigation */ ) : ( /* login button */ )}
```

**After**:
```jsx
{/* AUTHENTICATION BYPASSED - ALWAYS SHOW NAVIGATION FOR UI DEVELOPMENT */}
<Box sx={{ display: 'flex', alignItems: 'center' }}>
  {/* All navigation buttons always visible */}
</Box>
```

### 3. useAuth.js - Mock Authentication Hook
**File**: `/src/hooks/useAuth.js`

**Changes**:
- Added `UI_DEV_MODE = true` flag at the top of the hook
- When in UI dev mode, returns mock user data and authentication state
- Mock user has admin role to access all features
- All authentication actions return console logs instead of making API calls
- Original authentication code is preserved but bypassed

**Mock User Data**:
```javascript
const mockUser = {
  user_id: 'ui_dev_user',
  name: 'UI 개발자',
  email: 'ui.dev@scoreboard.local',
  role: 'admin', // Admin role to access all features
};
```

## Affected Pages
All pages that previously required authentication are now accessible:
- `/` - Dashboard
- `/clubs` - Club List
- `/matches` - Match List
- `/tournaments` - Tournament List
- `/competitions` - Competition Page
- `/templates` - Template Management
- `/admin` - Admin Dashboard
- `/live` - Live Matches
- `/style-dash` - Style Guide Dashboard

## How to Re-enable Authentication

To restore authentication functionality when UI development is complete:

1. **In `useAuth.js`**: Change `UI_DEV_MODE` from `true` to `false`
2. **In `App.tsx`**:
   - Uncomment the `ProtectedRoute` import
   - Wrap routes with `<ProtectedRoute>` components again
   - Restore conditional auth redirect logic
3. **In `Header.jsx`**:
   - Restore conditional rendering based on `isAuthenticated`
   - Revert logout functionality to actual logout action

## Benefits for UI Development
- **No Login Required**: Immediate access to all pages for styling work
- **Full Navigation Access**: All menu items and admin features visible
- **No Authentication Errors**: Pages expecting user data receive mock data
- **Preserved Architecture**: Original authentication system remains intact
- **Easy Restoration**: Single flag toggle to restore full authentication

## Development Notes
- Mock user has admin role to ensure access to all features and pages
- Console logging is used for authentication actions to aid debugging
- All authentication-dependent components continue to work normally
- Style Guide and Admin Dashboard are always accessible for development

## Current Status
✅ Authentication completely bypassed for UI development
✅ All pages accessible without login
✅ Navigation menu always visible
✅ Original authentication system preserved for future restoration