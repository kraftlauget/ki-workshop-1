# Phase 1 Frontend Implementation Plan

## Overview
Build minimal viable frontend components for meeting room booking system with basic authentication and core booking functionality.

## 1. Authentication System

### 1.1 Auth Context & Hooks
- **Create**: `src/contexts/AuthContext.tsx`
- **Purpose**: Manage auth state globally, handle sign in/out
- **Features**: 
  - `useAuth()` hook
  - Auto-redirect logic
  - Loading states

### 1.2 Authentication Pages
- **Sign In Page**: `src/app/auth/signin/page.tsx`
  - Email/password form
  - Link to sign up
  - Redirect to dashboard after login
  
- **Sign Up Page**: `src/app/auth/signup/page.tsx`  
  - Email/password form
  - Auto-create profile via trigger
  - Redirect to dashboard after signup

### 1.3 Route Protection (Simple)
- **Protected Layout**: `src/app/dashboard/layout.tsx`
- **Logic**: Check auth state, redirect to signin if not authenticated
- **No middleware**: Keep it simple with client-side checks

## 2. Dashboard & Navigation

### 2.1 Main Dashboard
- **Create**: `src/app/dashboard/page.tsx`
- **Content**: Welcome message, navigation to rooms/bookings
- **Layout**: Simple card-based layout

### 2.2 Navigation Component
- **Create**: `src/components/Navigation.tsx`
- **Features**: Links to rooms, bookings, sign out button
- **Style**: Simple horizontal nav or sidebar

## 3. Rooms Management

### 3.1 Rooms Listing Page
- **Create**: `src/app/dashboard/rooms/page.tsx`
- **Features**:
  - Fetch all rooms from database
  - Display room name, capacity
  - "Book Room" button for each room
- **No filtering**: Keep it simple, show all rooms

### 3.2 Room Card Component
- **Create**: `src/components/RoomCard.tsx`
- **Display**: Room name, capacity, book button
- **Action**: Navigate to booking form with room pre-selected

## 4. Booking System

### 4.1 Booking Form Page
- **Create**: `src/app/dashboard/book/page.tsx`
- **Form Fields**:
  - Room selection (dropdown)
  - Title (optional)
  - Start date/time
  - End date/time
- **Validation**: End time > start time, conflict check
- **Submit**: Create booking, redirect to user bookings

### 4.2 User Bookings Page
- **Create**: `src/app/dashboard/bookings/page.tsx`
- **Features**:
  - List user's own bookings
  - Show room, title, date/time
  - Delete button for each booking
- **No editing**: Phase 1 only supports create/delete

### 4.3 Booking Components
- **BookingCard**: `src/components/BookingCard.tsx`
  - Display booking details
  - Delete button with confirmation
- **BookingForm**: `src/components/BookingForm.tsx`
  - Reusable form component
  - Conflict checking before submit

## 5. Utilities & Types

### 5.1 Database Types
- **Create**: `src/types/database.ts`
- **Content**: TypeScript interfaces for tables
- **Generated**: Use Supabase CLI to generate types

### 5.2 API Utilities
- **Create**: `src/lib/api.ts`
- **Functions**: 
  - `getRooms()`
  - `getUserBookings(userId)`
  - `createBooking(booking)`
  - `deleteBooking(id)`
  - `checkBookingConflict(roomId, startTime, endTime)`

## 6. Implementation Order

### Phase 1A: Authentication (Day 1)
1. ✅ Database migration complete
2. Create AuthContext and useAuth hook
3. Build sign in/sign up pages
4. Add route protection to dashboard
5. Test basic auth flow

### Phase 1B: Core Features (Day 2)
1. Create dashboard layout and navigation
2. Build rooms listing page
3. Create booking form with conflict checking
4. Build user bookings page with delete functionality
5. Test complete booking workflow

## 7. File Structure
```
src/
├── app/
│   ├── auth/
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── rooms/page.tsx
│   │   ├── book/page.tsx
│   │   └── bookings/page.tsx
├── components/
│   ├── Navigation.tsx
│   ├── RoomCard.tsx
│   ├── BookingCard.tsx
│   └── BookingForm.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── api.ts
│   └── supabase.ts (existing)
└── types/
    └── database.ts
```

## 8. Success Criteria
- [ ] Users can sign up and sign in
- [ ] Dashboard redirects work properly
- [ ] Users can view all available rooms
- [ ] Users can create bookings (with conflict prevention)
- [ ] Users can view their own bookings
- [ ] Users can delete their own bookings
- [ ] No unauthorized access to other users' data

## 9. Keep It Simple
- **No real-time updates**: Manual page refresh
- **Basic styling**: Use existing Tailwind classes
- **No advanced features**: Focus on core functionality
- **Client-side only**: No API routes or middleware
- **Manual testing**: Test in browser, no automated tests yet