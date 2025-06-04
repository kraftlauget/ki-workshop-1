# Meeting Room Booking System - Implementation Plan (Claude Code)

You are tasked with creating a comprehensive implementation plan for a meeting room booking system. The project has an **excellent existing foundation** that you must leverage and build upon.

## Existing Foundation Analysis

The codebase is a modern Next.js application with this stack:
- **Next.js 15.3.3** with App Router + React 19 + TypeScript
- **Supabase 2.49.10** (client configured, database ready)
- **shadcn/ui** component library (New York style, Lucide icons)
- **Tailwind CSS v4** with CSS variables and RSC support
- **Modern tooling**: ESLint, Turbopack for dev

**Key existing files:**
- `/src/lib/supabase.ts` - Supabase client configured
- `/src/components/ui/button.tsx` - shadcn Button component
- `/src/lib/utils.ts` - Utility functions (cn for className merging)
- Scaffolded app structure with working Supabase connection test

## User Stories (Norwegian → English)
1. **Login & Authentication**: Users can log into the system and access room overview
2. **Room Overview**: View all bookable meeting rooms  
3. **Room Booking**: Select room and book for specific date/time
4. **Room Details**: View room-specific bookings (today/weekly views)
5. **Calendar Overview**: Weekly calendar view across all rooms showing availability
6. **Quick Booking**: "Book now" for immediate slots (30min default)
7. **Personal Bookings**: View own booking history/upcoming bookings
8. **Booking Management**: Cancel own bookings from any view (calendar/room/personal views)
9. **Smart Suggestions**: Room recommendations based on time/capacity needs

## Implementation Plan Requirements

### Phase 1: Database Schema & Auth (Foundation)
**Leverage existing Supabase setup**, create:
- User authentication flow (Supabase Auth)
- Database tables: `users`, `rooms`, `bookings`
- Row Level Security (RLS) policies
- Real-time subscriptions for booking updates

### Phase 2: Core Booking Features
**Build on existing shadcn/ui components**:
- Room listing/overview page
- Room booking form with date/time selection
- Room detail views (today/week toggle)
- Basic booking CRUD operations

### Phase 3: Advanced Features  
**Extend the component system**:
- Weekly calendar component (all rooms)
- "Book now" quick-booking feature
- Personal bookings dashboard
- Booking cancellation from all views

### Phase 4: Smart Features & Polish
**Add intelligent features**:
- Room suggestion algorithm (time/capacity)
- Conflict detection and resolution
- Real-time updates via Supabase realtime
- Enhanced UX/error handling

## Architectural Decisions Required

### Database Design
- Room attributes (capacity, equipment, location)
- Booking constraints (duration limits, advance booking window)
- User roles and permissions structure
- Conflict resolution strategy

### Component Architecture  
- Leverage existing shadcn/ui patterns
- Calendar component approach (custom vs library)
- Real-time state management strategy
- Mobile-responsive design patterns

### API Design
- Server Actions vs API routes for mutations
- Real-time subscription patterns
- Error handling and loading states
- Optimistic updates implementation

## Deliverables Expected

1. **Database Schema** (Supabase migrations)
2. **Component Hierarchy** (extending existing shadcn/ui setup)
3. **Page Structure** (Next.js App Router pages)
4. **API Layer** (Server Actions + real-time subscriptions)
5. **Authentication Flow** (Supabase Auth integration)

## Success Criteria

- **Maintains existing code quality** (TypeScript strict, component patterns)
- **Builds incrementally** on current foundation without breaking changes
- **Follows shadcn/ui conventions** for new components
- **Leverages Supabase features** (auth, real-time, RLS)
- **Responsive design** using existing Tailwind setup
- **All user stories implemented** with robust error handling

## Key Constraints

- **No breaking changes** to existing foundation
- **Use existing tech stack** (no new major dependencies without justification)
- **Follow established patterns** (shadcn/ui, Next.js App Router conventions)
- **Norwegian/English support** consideration for UI text
- **Mobile-first responsive** design approach

Generate a detailed implementation plan that maximizes the existing foundation while delivering all user story requirements efficiently.