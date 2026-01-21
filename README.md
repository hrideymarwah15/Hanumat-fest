# Sports Registration System - Backend

A complete Supabase backend for sports event registration and management.

## Tech Stack

- **Runtime**: Supabase Edge Functions (Deno)
- **Database**: PostgreSQL (Supabase Database)
- **Authentication**: Supabase Auth
- **Payment Gateway**: Razorpay
- **Email Service**: Resend
- **File Storage**: Supabase Storage
- **Realtime**: Supabase Realtime

## Project Structure

```
.env.example                    # Environment variables template
supabase/
├── config.toml                 # Supabase configuration
├── migrations/                 # SQL migration files
│   ├── 001_initial_setup.sql
│   ├── 002_profiles_table.sql
│   ├── 003_sports_table.sql
│   ├── 004_registrations_table.sql
│   ├── 005_team_members_table.sql
│   ├── 006_payments_table.sql
│   ├── 007_notifications_table.sql
│   ├── 008_audit_and_support_tables.sql
│   ├── 009_analytics_functions.sql
│   ├── 010_scheduled_jobs.sql
│   └── 011_storage_buckets.sql
├── functions/                  # Edge Functions
│   ├── _shared/               # Shared utilities
│   │   ├── utils.ts
│   │   ├── razorpay.ts
│   │   └── email.ts
│   ├── auth/                  # Authentication
│   ├── sports/                # Sports management
│   ├── registrations/         # Registration management
│   ├── payments/              # Payment processing
│   ├── notifications/         # Notifications
│   ├── analytics/             # Analytics & dashboards
│   └── admin/                 # Admin utilities
└── seed.sql                   # Sample data
```

## Setup Instructions

### 1. Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Deno](https://deno.land/) (for local function development)
- Supabase account and project

### 2. Environment Setup

```bash
# Copy environment template to create your .env file
# The .env.example file contains all required environment variables
cp .env.example .env

# Fill in your actual values in .env
# See .env.example for descriptions of each variable
```

### 3. Link to Supabase Project

```bash
supabase login
supabase link --project-ref your-project-ref
```

### 4. Run Migrations

```bash
# Push migrations to remote database
supabase db push

# Or run locally
supabase start
supabase db reset  # This runs migrations + seed
```

### 5. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy auth
supabase functions deploy sports
supabase functions deploy registrations
supabase functions deploy payments
supabase functions deploy notifications
supabase functions deploy analytics
supabase functions deploy admin

# Set secrets
supabase secrets set RAZORPAY_KEY_ID=your-key
supabase secrets set RAZORPAY_KEY_SECRET=your-secret
supabase secrets set RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
supabase secrets set RESEND_API_KEY=your-resend-key
supabase secrets set FRONTEND_URL=https://your-frontend.com
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | User registration |
| GET | `/auth/profile` | Get current user profile |
| PATCH | `/auth/profile` | Update profile |

### Sports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sports` | List all sports |
| GET | `/sports/:id` | Get sport details |
| POST | `/sports` | Create sport (admin) |
| PATCH | `/sports/:id` | Update sport (admin) |
| POST | `/sports/:id/toggle-registration` | Toggle registration (admin) |
| POST | `/sports/:id/duplicate` | Duplicate sport (admin) |
| POST | `/sports/:id/archive` | Archive sport (admin) |

### Registrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/registrations/check/:sport_id` | Check eligibility |
| POST | `/registrations` | Register for sport |
| GET | `/registrations/me` | Get my registrations |
| GET | `/registrations/:id` | Get registration details |
| PATCH | `/registrations/:id/team` | Update team members |
| POST | `/registrations/:id/cancel` | Cancel registration |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/create-order` | Create Razorpay order |
| POST | `/payments/verify` | Verify payment |
| POST | `/payments/webhook` | Razorpay webhook |
| GET | `/payments/me` | Get my payments |
| GET | `/payments/:id/receipt` | Get payment receipt |
| POST | `/payments/verify-offline` | Verify offline payment (admin) |
| POST | `/payments/:id/refund` | Process refund (admin) |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get notifications |
| GET | `/notifications/unread-count` | Get unread count |
| POST | `/notifications/mark-read` | Mark as read |
| POST | `/notifications/broadcast` | Broadcast (admin) |

### Analytics (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/dashboard` | Dashboard stats |
| GET | `/analytics/sports` | Sport-wise analytics |
| GET | `/analytics/colleges` | College-wise analytics |
| GET | `/analytics/revenue` | Revenue analytics |
| GET | `/analytics/trends` | Registration trends |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/audit-logs` | Get audit logs |
| GET/POST/PATCH/DELETE | `/admin/colleges` | Manage colleges |
| GET/PATCH | `/admin/settings` | Manage settings |
| GET | `/admin/registrations` | List all registrations |
| PATCH | `/admin/registrations/:id` | Update registration |
| POST | `/admin/registrations/bulk-update` | Bulk update |
| GET | `/admin/registrations/export` | Export to CSV |

## Database Schema

### Tables
- **profiles** - User profiles (extends auth.users)
- **sports** - Sports/events
- **registrations** - User registrations
- **team_members** - Team member details
- **payments** - Payment records
- **notifications** - User notifications
- **audit_logs** - Audit trail
- **colleges** - College list
- **settings** - System settings

### Key Features
- Row Level Security (RLS) on all tables
- Automatic timestamp updates
- Registration number generation
- Payment status sync
- Waitlist management
- Participant count tracking

## Scheduled Jobs (pg_cron)

- Auto-close expired registrations (every 15 min)
- Auto-open registrations at start time (every 15 min)
- Expire pending payments after 24 hours (hourly)
- Cleanup expired notifications (daily)
- Send event reminders (daily at 9 AM)

## Frontend Integration

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: { name: 'John', phone: '9876543210', college: 'ABC College' }
  }
})

// Get sports
const { data: sports } = await supabase
  .from('sports')
  .select('*')
  .eq('is_registration_open', true)

// Register for sport
const { data } = await supabase.functions.invoke('registrations', {
  body: { sport_id: 'uuid' }
})

// Subscribe to notifications
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `recipient_id=eq.${userId}`
  }, handler)
  .subscribe()
```

## License

MIT
