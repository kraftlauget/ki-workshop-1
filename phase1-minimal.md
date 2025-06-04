# Phase 1: Database Schema & Authentication - Simplified Implementation Plan

## Overview
Phase 1 establishes the minimal viable database schema and basic authentication for the meeting room booking application. Focus on core functionality without real-time features or advanced optimizations.

## 1. Database Schema Design

### 1.1 Core Tables (Minimal)

#### Profiles Table
- **Purpose**: Basic user information linked to Supabase auth
- **Attributes**:
  - `id` (UUID, primary key, references auth.users)
  - `email` (text, from auth metadata)
  - `full_name` (text, nullable)
  - `created_at` (timestamptz, default now())
- **Simple trigger**: Auto-create profile when user signs up

#### Rooms Table
- **Purpose**: Basic room information
- **Attributes**:
  - `id` (UUID, primary key)
  - `name` (text, unique, not null)
  - `capacity` (integer, not null)
  - `created_at` (timestamptz, default now())
- **Keep it simple**: No equipment arrays, no soft deletion, no location details

#### Bookings Table
- **Purpose**: Meeting reservations
- **Attributes**:
  - `id` (UUID, primary key)
  - `room_id` (UUID, foreign key to rooms.id)
  - `user_id` (UUID, foreign key to profiles.id)
  - `title` (text, nullable)
  - `start_time` (timestamptz, not null)
  - `end_time` (timestamptz, not null)
  - `created_at` (timestamptz, default now())
- **Basic constraint**: `end_time > start_time`
- **Simple index**: On room_id and start_time for basic queries

### 1.2 Minimal Database Functions

#### Basic Conflict Check
- **Simple function**: Check if room is available for given time slot
- **No complex triggers**: Just a SQL function to call before inserting

## 2. Authentication System (Basic)

### 2.1 Supabase Auth (Default Setup)
- **Sign Up**: Email/password only
- **Sign In**: Email/password only  
- **No email confirmation**: Skip for simplicity
- **Basic session handling**: Use Supabase defaults

### 2.2 Route Protection (Simple)
- **Client-side only**: Check auth state in components
- **No middleware**: Keep routing simple initially
- **Manual redirects**: Handle in individual pages

## 3. Row Level Security (Essential Only)

### 3.1 Basic Security Policies

#### Profiles Table
- **SELECT**: All authenticated users can view profiles
- **UPDATE**: Users can only update their own profile

#### Rooms Table  
- **SELECT**: All authenticated users can view rooms
- **No admin features**: Everyone can see all rooms, no modification UI initially

#### Bookings Table
- **SELECT**: All authenticated users can view all bookings
- **INSERT**: Authenticated users can create bookings
- **DELETE**: Users can only delete their own bookings
- **UPDATE**: Skip for Phase 1 (no editing bookings)

## 4. No Real-time Features
- **Skip subscriptions**: No real-time updates in Phase 1
- **Manual refresh**: Users refresh page to see updates
- **Static data**: Query database on page load only

## 5. Migration Strategy (Minimal)

### 5.1 Single Migration File
- **One migration**: Create all tables, constraints, and policies in one file
- **Seed data**: Add 3-4 sample rooms in the same migration
- **No complex rollback**: Keep migration simple and linear

### 5.2 Sample Data
```sql
-- Just insert a few basic rooms
INSERT INTO rooms (name, capacity) VALUES 
  ('Meeting Room A', 8),
  ('Conference Room B', 12),
  ('Small Room C', 4);
```

## 6. Development Approach

### 6.1 Implementation Order
1. **Create database tables** (single migration)
2. **Set up basic RLS policies**
3. **Create profile trigger** for auto-user creation
4. **Add conflict check function**
5. **Test basic auth flow**

### 6.2 Testing (Basic)
- **Manual testing**: Test in browser only
- **Basic scenarios**:
  - [ ] User can sign up and sign in
  - [ ] Profile gets created automatically
  - [ ] User can view rooms
  - [ ] User can create booking (if no conflict)
  - [ ] User can view their own bookings
  - [ ] User can delete their own bookings

## 7. What We're NOT Doing in Phase 1

- **No real-time updates**
- **No complex conflict resolution**
- **No admin roles or room management**
- **No email confirmations**
- **No equipment tracking**
- **No capacity validation**
- **No time zone handling** (assume local time)
- **No performance optimizations**
- **No automated testing**
- **No middleware or complex routing**
- **No recurring bookings**
- **No booking modifications** (only create/delete)

## 8. Success Criteria (Minimal)

Phase 1 is complete when:
- [ ] Users can register and login
- [ ] Database tables exist with basic data
- [ ] Users can view available rooms
- [ ] Users can create simple bookings
- [ ] Basic conflict prevention works
- [ ] Users can see and delete their own bookings
- [ ] No unauthorized access to other users' data

This simplified approach focuses on getting the absolute core functionality working quickly, deferring all advanced features to later phases.