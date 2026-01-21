# Hanumat-Fest Sports Registration System - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Database Schema](#database-schema)
3. [Database Functions](#database-functions)
4. [Database Triggers](#database-triggers)
5. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
6. [Scheduled Jobs (pg_cron)](#scheduled-jobs-pg_cron)
7. [Storage Buckets](#storage-buckets)
8. [Edge Functions API](#edge-functions-api)
9. [Shared Utilities](#shared-utilities)
10. [Configuration](#configuration)
11. [Seed Data](#seed-data)

---

## Project Overview

**Project:** Hanumat-Fest Sports Registration System  
**Stack:** Supabase (PostgreSQL 15, Edge Functions, Auth, Storage, Realtime) + Razorpay Payments + Resend Emails  
**Location:** `/Users/void/Desktop/Hanumat-fest/supabase/`

### Directory Structure

```
supabase/
├── config.toml                    # Supabase project configuration
├── seed.sql                       # Sample data for development
├── migrations/                    # Database migrations (001-013)
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
│   ├── 011_storage_buckets.sql
│   ├── 012_security_fixes.sql
│   └── 013_race_condition_fixes.sql
└── functions/                     # Edge Functions
    ├── _shared/                   # Shared utilities
    │   ├── utils.ts
    │   ├── razorpay.ts
    │   └── email.ts
    ├── _tests/                    # Test suite
    ├── auth/index.ts
    ├── sports/index.ts
    ├── registrations/index.ts
    ├── payments/index.ts
    ├── notifications/index.ts
    ├── analytics/index.ts
    └── admin/index.ts
```

---

## Database Schema

### Extensions Enabled

| Extension | Purpose |
|-----------|---------|
| `uuid-ossp` | UUID generation functions |
| `pg_cron` | Scheduled job execution |
| `pgcrypto` | Cryptographic functions |

---

### Table: `profiles`

**Description:** User profiles extending `auth.users`  
**File:** `002_profiles_table.sql`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, FK -> auth.users(id) ON DELETE CASCADE | User ID from auth.users |
| `email` | TEXT | NOT NULL | User email address |
| `name` | TEXT | NOT NULL | Full name |
| `phone` | TEXT | NOT NULL | Phone number |
| `college` | TEXT | NOT NULL | College/institution name |
| `role` | TEXT | DEFAULT 'participant', CHECK (role IN ('participant', 'admin', 'coordinator')) | User role |
| `avatar_url` | TEXT | | Profile picture URL |
| `email_verified` | BOOLEAN | DEFAULT false | Email verification status |
| `is_active` | BOOLEAN | DEFAULT true | Account active status |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_profiles_email` - UNIQUE on email
- `idx_profiles_role` - On role
- `idx_profiles_college` - On college
- `idx_profiles_is_active` - On is_active

---

### Table: `sports`

**Description:** Sports/events available for registration  
**File:** `003_sports_table.sql`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Sport ID |
| `name` | TEXT | NOT NULL | Sport name |
| `slug` | TEXT | NOT NULL, UNIQUE | URL-friendly slug (auto-generated) |
| `sport_code` | CHAR(3) | NOT NULL, CHECK (sport_code ~ '^[A-Z]{3}$') | 3-letter sport code for registration numbers |
| `category` | TEXT | NOT NULL, CHECK (category IN ('indoor', 'outdoor', 'esports', 'athletics')) | Sport category |
| `description` | TEXT | | Sport description |
| `rules` | TEXT | | Rules and regulations |
| `image_url` | TEXT | | Sport image URL |
| `is_team_event` | BOOLEAN | DEFAULT false | Whether team registration required |
| `team_size_min` | INTEGER | NOT NULL, DEFAULT 1 | Minimum team size |
| `team_size_max` | INTEGER | NOT NULL, DEFAULT 1 | Maximum team size |
| `fees` | DECIMAL(10,2) | NOT NULL | Registration fee |
| `early_bird_fees` | DECIMAL(10,2) | | Discounted early bird fee |
| `early_bird_deadline` | TIMESTAMPTZ | | Early bird deadline |
| `schedule_start` | TIMESTAMPTZ | | Event start time |
| `schedule_end` | TIMESTAMPTZ | | Event end time |
| `venue` | TEXT | | Event venue |
| `registration_start` | TIMESTAMPTZ | NOT NULL | Registration opens |
| `registration_deadline` | TIMESTAMPTZ | NOT NULL | Registration closes |
| `is_registration_open` | BOOLEAN | DEFAULT false | Manual registration toggle |
| `max_participants` | INTEGER | | Maximum registrations allowed |
| `current_participants` | INTEGER | DEFAULT 0 | Current confirmed count |
| `waitlist_enabled` | BOOLEAN | DEFAULT true | Enable waitlist when full |
| `max_waitlist` | INTEGER | DEFAULT 10 | Maximum waitlist size |
| `created_by` | UUID | FK -> profiles(id) | Creator admin |
| `is_archived` | BOOLEAN | DEFAULT false | Soft delete flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Constraints:**
- `valid_team_size` - team_size_max >= team_size_min
- `valid_registration_period` - registration_deadline > registration_start
- `valid_schedule` - schedule_end IS NULL OR schedule_end > schedule_start
- `valid_capacity` - current_participants >= 0 AND (max_participants IS NULL OR current_participants <= max_participants)

**Indexes:**
- `idx_sports_slug` - On slug
- `idx_sports_category` - On category
- `idx_sports_is_registration_open` - On is_registration_open
- `idx_sports_registration_deadline` - On registration_deadline
- `idx_sports_is_archived` - On is_archived
- `idx_sports_registration_period` - On (registration_start, registration_deadline)

---

### Table: `registrations`

**Description:** User registrations for sports  
**File:** `004_registrations_table.sql`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Registration ID |
| `registration_number` | TEXT | UNIQUE | Auto-generated (REG-XXX-0001) |
| `participant_id` | UUID | NOT NULL, FK -> profiles(id) | Registering user |
| `sport_id` | UUID | NOT NULL, FK -> sports(id) | Sport being registered for |
| `status` | TEXT | DEFAULT 'pending', CHECK IN ('pending', 'payment_pending', 'confirmed', 'waitlist', 'cancelled', 'withdrawn') | Registration status |
| `is_team` | BOOLEAN | DEFAULT false | Is team registration |
| `team_name` | TEXT | | Team name for team events |
| `payment_status` | TEXT | DEFAULT 'pending', CHECK IN ('pending', 'processing', 'completed', 'failed', 'refunded') | Payment status |
| `amount_paid` | DECIMAL(10,2) | DEFAULT 0 | Amount paid |
| `waitlist_position` | INTEGER | | Position in waitlist |
| `confirmed_at` | TIMESTAMPTZ | | Confirmation timestamp |
| `withdrawal_reason` | TEXT | | Reason for cancellation |
| `cancelled_at` | TIMESTAMPTZ | | Cancellation timestamp |
| `cancelled_by` | UUID | FK -> profiles(id) | Who cancelled |
| `registered_at` | TIMESTAMPTZ | DEFAULT now() | Registration timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Constraints:**
- `unique_participant_sport` - UNIQUE (participant_id, sport_id)

**Indexes:**
- `idx_registrations_participant_id` - On participant_id
- `idx_registrations_sport_id` - On sport_id
- `idx_registrations_status` - On status
- `idx_registrations_payment_status` - On payment_status
- `idx_registrations_registration_number` - On registration_number
- `idx_registrations_waitlist` - On (sport_id, waitlist_position) WHERE status = 'waitlist'

---

### Table: `team_members`

**Description:** Team members for team event registrations  
**File:** `005_team_members_table.sql`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Team member ID |
| `registration_id` | UUID | NOT NULL, FK -> registrations(id) ON DELETE CASCADE | Parent registration |
| `member_order` | INTEGER | NOT NULL | Order in team roster |
| `name` | TEXT | NOT NULL | Member name |
| `email` | TEXT | | Member email |
| `phone` | TEXT | | Member phone |
| `is_captain` | BOOLEAN | DEFAULT false | Is team captain |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |

**Constraints:**
- `unique_member_order` - UNIQUE (registration_id, member_order)
- `unique_member_email` - UNIQUE (registration_id, email)

**Indexes:**
- `idx_team_members_registration_id` - On registration_id
- `idx_team_members_email` - On email

---

### Table: `payments`

**Description:** Payment records for registrations  
**File:** `006_payments_table.sql`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Payment ID |
| `registration_id` | UUID | NOT NULL, FK -> registrations(id) | Associated registration |
| `user_id` | UUID | NOT NULL, FK -> profiles(id) | Paying user |
| `amount` | DECIMAL(10,2) | NOT NULL | Base amount |
| `currency` | TEXT | DEFAULT 'INR' | Currency code |
| `convenience_fee` | DECIMAL(10,2) | DEFAULT 0 | Additional fees |
| `total_amount` | DECIMAL(10,2) | NOT NULL | Total charged |
| `method` | TEXT | NOT NULL, CHECK IN ('online', 'offline', 'free') | Payment method |
| `status` | TEXT | DEFAULT 'pending', CHECK IN ('pending', 'processing', 'success', 'failed', 'refunded', 'partially_refunded') | Payment status |
| `razorpay_order_id` | TEXT | | Razorpay order ID |
| `razorpay_payment_id` | TEXT | | Razorpay payment ID |
| `razorpay_signature` | TEXT | | Razorpay signature |
| `gateway_response` | JSONB | | Raw gateway response |
| `receipt_number` | TEXT | | Auto-generated receipt (RCP-YY-000001) |
| `receipt_url` | TEXT | | Receipt PDF URL |
| `offline_verified_by` | UUID | FK -> profiles(id) | Admin who verified offline payment |
| `offline_verification_note` | TEXT | | Verification notes |
| `offline_verified_at` | TIMESTAMPTZ | | Verification timestamp |
| `refund_amount` | DECIMAL(10,2) | | Refund amount |
| `refund_reason` | TEXT | | Refund reason |
| `refund_id` | TEXT | | Razorpay refund ID |
| `refund_processed_by` | UUID | FK -> profiles(id) | Admin who processed refund |
| `refund_processed_at` | TIMESTAMPTZ | | Refund timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `completed_at` | TIMESTAMPTZ | | Payment completion timestamp |

**Constraints:**
- `valid_refund` - refund_amount IS NULL OR refund_amount <= total_amount

**Indexes:**
- `idx_payments_user_id` - On user_id
- `idx_payments_registration_id` - On registration_id
- `idx_payments_status` - On status
- `idx_payments_razorpay_order_id` - UNIQUE on razorpay_order_id WHERE NOT NULL
- `idx_payments_razorpay_payment_id` - UNIQUE on razorpay_payment_id WHERE NOT NULL
- `idx_payments_receipt_number` - UNIQUE on receipt_number WHERE NOT NULL
- `idx_payments_pending_registration` - UNIQUE on registration_id WHERE status = 'pending' (race condition prevention)
- `idx_payments_refund_id` - On refund_id WHERE NOT NULL

---

### Table: `receipt_sequences`

**Description:** Sequence tracking for receipt number generation  
**File:** `006_payments_table.sql`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `year_suffix` | TEXT | PRIMARY KEY | Year suffix (e.g., '24') |
| `last_seq` | INTEGER | NOT NULL, DEFAULT 0 | Last used sequence number |

---

### Table: `notifications`

**Description:** In-app and email notifications  
**File:** `007_notifications_table.sql`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Notification ID |
| `recipient_id` | UUID | NOT NULL, FK -> profiles(id) ON DELETE CASCADE | Recipient user |
| `type` | TEXT | NOT NULL, CHECK IN ('registration', 'payment', 'announcement', 'reminder', 'waitlist', 'cancellation') | Notification type |
| `priority` | TEXT | DEFAULT 'normal', CHECK IN ('low', 'normal', 'high', 'urgent') | Priority level |
| `title` | TEXT | NOT NULL | Notification title |
| `message` | TEXT | NOT NULL | Notification body |
| `action_url` | TEXT | | Link for action |
| `is_read` | BOOLEAN | DEFAULT false | Read status |
| `read_at` | TIMESTAMPTZ | | Read timestamp |
| `email_sent` | BOOLEAN | DEFAULT false | Email sent status |
| `email_sent_at` | TIMESTAMPTZ | | Email sent timestamp |
| `related_sport_id` | UUID | FK -> sports(id) ON DELETE SET NULL | Related sport |
| `related_registration_id` | UUID | FK -> registrations(id) ON DELETE SET NULL | Related registration |
| `metadata` | JSONB | | Additional data |
| `expires_at` | TIMESTAMPTZ | | Expiration timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |

**Indexes:**
- `idx_notifications_recipient_read` - On (recipient_id, is_read)
- `idx_notifications_recipient_created` - On (recipient_id, created_at DESC)
- `idx_notifications_type` - On type
- `idx_notifications_expires` - On expires_at WHERE NOT NULL

**Realtime:** Enabled via `supabase_realtime` publication

---

### Table: `audit_logs`

**Description:** Audit trail for admin actions  
**File:** `008_audit_and_support_tables.sql`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Log ID |
| `user_id` | UUID | FK -> profiles(id) | Acting user |
| `action` | TEXT | NOT NULL | Action performed |
| `entity_type` | TEXT | NOT NULL | Entity type (table name) |
| `entity_id` | UUID | | Affected entity ID |
| `old_values` | JSONB | | Previous values |
| `new_values` | JSONB | | New values |
| `ip_address` | INET | | Client IP address |
| `user_agent` | TEXT | | Client user agent |
| `request_id` | TEXT | | Request tracking ID |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Log timestamp |

**Indexes:**
- `idx_audit_logs_user_id` - On user_id
- `idx_audit_logs_entity` - On (entity_type, entity_id)
- `idx_audit_logs_action` - On action
- `idx_audit_logs_created_at` - On created_at

---

### Table: `colleges`

**Description:** College/institution master list  
**File:** `008_audit_and_support_tables.sql`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | College ID |
| `name` | TEXT | NOT NULL, UNIQUE | Full college name |
| `short_name` | TEXT | | Abbreviation |
| `city` | TEXT | | City location |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |

**Indexes:**
- `idx_colleges_name` - On name
- `idx_colleges_is_active` - On is_active

---

### Table: `settings`

**Description:** Application configuration settings  
**File:** `008_audit_and_support_tables.sql`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `key` | TEXT | PRIMARY KEY | Setting key |
| `value` | JSONB | NOT NULL | Setting value |
| `description` | TEXT | | Setting description |
| `updated_by` | UUID | FK -> profiles(id) | Last updater |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Default Settings:**
- `registration_enabled` - Master registration switch
- `payment_methods` - Enabled payment methods
- `contact_email` - Support email
- `contact_phone` - Support phone
- `event_name` - Event display name
- `event_dates` - Event start/end dates

---

## Database Functions

### Utility Functions

| Function | Returns | Description | Security |
|----------|---------|-------------|----------|
| `handle_updated_at()` | TRIGGER | Auto-updates `updated_at` timestamp | - |
| `is_admin()` | BOOLEAN | Checks if current user is admin | SECURITY DEFINER, SET search_path |
| `is_coordinator()` | BOOLEAN | Checks if current user is admin or coordinator | SECURITY DEFINER, SET search_path |

### Sport Functions

| Function | Returns | Description | Security |
|----------|---------|-------------|----------|
| `generate_sport_slug()` | TRIGGER | Auto-generates unique URL slug from name | - |
| `check_registration_capacity()` | TRIGGER | Auto-closes registration when full | - |
| `get_applicable_fees(sport_id UUID)` | DECIMAL | Returns current applicable fee (early bird or regular) | STABLE |

### Registration Functions

| Function | Returns | Description | Security |
|----------|---------|-------------|----------|
| `generate_registration_number()` | TRIGGER | Generates REG-XXX-0001 format number | SECURITY DEFINER, SET search_path, Advisory Lock |
| `sync_sport_participant_count()` | TRIGGER | Updates sport's current_participants count | SECURITY DEFINER, SET search_path |
| `handle_registration_status_change()` | TRIGGER | Sets confirmed_at/cancelled_at timestamps | - |
| `can_register_for_sport(p_sport_id, p_user_id)` | TABLE(can_register, reason, waitlist_available) | Checks registration eligibility | SECURITY DEFINER, SET search_path |
| `promote_from_waitlist(p_sport_id)` | UUID | Promotes next waitlist entry | SECURITY DEFINER, SET search_path |
| `assign_waitlist_position(p_sport_id)` | INTEGER | Atomically assigns waitlist position | SECURITY DEFINER, SET search_path, Advisory Lock |
| `create_registration_with_team(...)` | JSONB | Atomic registration with team members | SECURITY DEFINER, SET search_path |
| `release_waitlist_position(p_sport_id, p_position)` | BOOLEAN | Releases waitlist position on failure | SECURITY DEFINER, SET search_path |

### Payment Functions

| Function | Returns | Description | Security |
|----------|---------|-------------|----------|
| `generate_receipt_number()` | TRIGGER | Generates RCP-YY-000001 format receipt | SECURITY DEFINER, SET search_path, Advisory Lock |
| `sync_registration_payment_status()` | TRIGGER | Syncs payment status to registration | SECURITY DEFINER, SET search_path |

### Notification Functions

| Function | Returns | Description | Security |
|----------|---------|-------------|----------|
| `create_notification(...)` | UUID | Secure notification creation | SECURITY DEFINER, SET search_path |

### Audit Functions

| Function | Returns | Description | Security |
|----------|---------|-------------|----------|
| `insert_audit_log(...)` | UUID | Secure audit log insertion | SECURITY DEFINER, SET search_path |

### Profile Functions

| Function | Returns | Description | Security |
|----------|---------|-------------|----------|
| `handle_new_user()` | TRIGGER | Auto-creates profile on auth.users insert | SECURITY DEFINER |
| `prevent_role_self_change()` | TRIGGER | Prevents users from changing their own role | SECURITY DEFINER, SET search_path |
| `update_team_members(p_registration_id, p_team_members)` | BOOLEAN | Atomic team member replacement | SECURITY INVOKER, SET search_path |

### Analytics Functions

| Function | Returns | Description | Security |
|----------|---------|-------------|----------|
| `get_dashboard_stats()` | JSON | Dashboard statistics | SECURITY DEFINER, SET search_path |
| `get_sport_analytics(p_sport_id)` | JSON | Single sport analytics | SECURITY DEFINER, SET search_path |
| `get_all_sports_analytics()` | JSON | All sports analytics | SECURITY DEFINER, SET search_path |
| `get_college_analytics()` | JSON | College-wise analytics | SECURITY DEFINER, SET search_path |
| `get_revenue_analytics(p_period)` | JSON | Revenue analytics (daily/weekly/monthly) | SECURITY DEFINER, SET search_path |
| `get_registration_trends()` | JSON | Registration trends (30 days) | SECURITY DEFINER, SET search_path |

---

## Database Triggers

| Table | Trigger | Timing | Events | Function |
|-------|---------|--------|--------|----------|
| profiles | `set_profiles_updated_at` | BEFORE UPDATE | UPDATE | `handle_updated_at()` |
| profiles | `on_auth_user_created` | AFTER INSERT | INSERT (on auth.users) | `handle_new_user()` |
| profiles | `prevent_role_change` | BEFORE UPDATE OF role | UPDATE | `prevent_role_self_change()` |
| sports | `set_sports_updated_at` | BEFORE UPDATE | UPDATE | `handle_updated_at()` |
| sports | `generate_sports_slug` | BEFORE INSERT/UPDATE OF name | INSERT, UPDATE | `generate_sport_slug()` |
| sports | `check_sports_capacity` | BEFORE INSERT/UPDATE OF current_participants | INSERT, UPDATE | `check_registration_capacity()` |
| registrations | `set_registrations_updated_at` | BEFORE UPDATE | UPDATE | `handle_updated_at()` |
| registrations | `generate_reg_number` | BEFORE INSERT | INSERT | `generate_registration_number()` |
| registrations | `sync_participant_count` | AFTER INSERT/UPDATE OF status/DELETE | INSERT, UPDATE, DELETE | `sync_sport_participant_count()` |
| registrations | `handle_reg_status_change` | BEFORE UPDATE OF status | UPDATE | `handle_registration_status_change()` |
| payments | `set_payments_updated_at` | BEFORE UPDATE | UPDATE | `handle_updated_at()` |
| payments | `generate_payment_receipt_number` | BEFORE INSERT/UPDATE OF status | INSERT, UPDATE | `generate_receipt_number()` |
| payments | `sync_reg_payment_status` | AFTER INSERT/UPDATE OF status | INSERT, UPDATE | `sync_registration_payment_status()` |

---

## Row Level Security (RLS) Policies

### profiles

| Policy | Operation | Using | With Check |
|--------|-----------|-------|------------|
| Users can view own profile | SELECT | auth.uid() = id | - |
| Users can update own profile | UPDATE | auth.uid() = id | role = (SELECT role FROM profiles WHERE id = auth.uid()) |
| Admins can view all profiles | SELECT | is_admin() | - |
| Admins can update any profile | UPDATE | is_admin() | - |
| Enable insert for authenticated users | INSERT | - | auth.uid() = id |

### sports

| Policy | Operation | Using | With Check |
|--------|-----------|-------|------------|
| Anyone can view active sports | SELECT | is_archived = false | - |
| Admins can view all sports | SELECT | is_admin() | - |
| Admins can insert sports | INSERT | - | is_admin() |
| Admins can update sports | UPDATE | is_admin() | - |
| Admins can delete sports | DELETE | is_admin() | - |

### registrations

| Policy | Operation | Using | With Check |
|--------|-----------|-------|------------|
| Users can view own registrations | SELECT | participant_id = auth.uid() | - |
| Users can create registrations | INSERT | - | participant_id = auth.uid() AND status = 'pending' AND payment_status = 'pending' |
| Users can update own pending registrations | UPDATE | participant_id = auth.uid() AND status IN ('pending', 'payment_pending') | participant_id = auth.uid() AND status IN ('pending', 'payment_pending') |
| Admins can view all registrations | SELECT | is_admin() | - |
| Admins can update any registration | UPDATE | is_admin() | - |

### team_members

| Policy | Operation | Using | With Check |
|--------|-----------|-------|------------|
| Users can view own team members | SELECT | EXISTS (registration owned by user) | - |
| Users can insert own team members | INSERT | - | EXISTS (registration owned by user, pending status) |
| Users can update own team members | UPDATE | EXISTS (registration owned by user, pending status) | EXISTS (registration owned by user, pending status) |
| Users can delete own team members | DELETE | EXISTS (registration owned by user, pending status) | - |
| Admins can view all team members | SELECT | is_admin() | - |
| Admins can manage all team members | ALL | is_admin() | - |

### payments

| Policy | Operation | Using | With Check |
|--------|-----------|-------|------------|
| Users can view own payments | SELECT | user_id = auth.uid() | - |
| Users can create payments | INSERT | - | user_id = auth.uid() AND registration owned by user |
| Admins can view all payments | SELECT | is_admin() | - |
| Admins can update payments | UPDATE | is_admin() | - |

### notifications

| Policy | Operation | Using | With Check |
|--------|-----------|-------|------------|
| Users can view own notifications | SELECT | recipient_id = auth.uid() | - |
| Users can update own notifications | UPDATE | recipient_id = auth.uid() | recipient_id = auth.uid() |
| System can insert notifications | INSERT | - | auth.role() = 'service_role' |
| Admins can manage all notifications | ALL | is_admin() | - |

### audit_logs

| Policy | Operation | Using | With Check |
|--------|-----------|-------|------------|
| Admins can view audit logs | SELECT | is_admin() | - |
| System can insert audit logs | INSERT | - | auth.role() = 'service_role' |

### colleges

| Policy | Operation | Using | With Check |
|--------|-----------|-------|------------|
| Anyone can view active colleges | SELECT | is_active = true | - |
| Admins can manage colleges | ALL | is_admin() | - |

### settings

| Policy | Operation | Using | With Check |
|--------|-----------|-------|------------|
| Anyone can view settings | SELECT | true | - |
| Admins can update settings | UPDATE | is_admin() | - |
| Admins can insert settings | INSERT | - | is_admin() |

### storage.objects

| Bucket | Policy | Operation | Condition |
|--------|--------|-----------|-----------|
| sport-images | Anyone can view | SELECT | bucket_id = 'sport-images' |
| sport-images | Admins can upload | INSERT | bucket_id = 'sport-images' AND is_admin() |
| sport-images | Admins can update | UPDATE | bucket_id = 'sport-images' AND is_admin() |
| sport-images | Admins can delete | DELETE | bucket_id = 'sport-images' AND is_admin() |
| avatars | Anyone can view | SELECT | bucket_id = 'avatars' |
| avatars | Users can upload own | INSERT | bucket_id = 'avatars' AND user owns folder |
| avatars | Users can update own | UPDATE | bucket_id = 'avatars' AND user owns folder |
| avatars | Users can delete own | DELETE | bucket_id = 'avatars' AND user owns folder |
| receipts | Users can view own | SELECT | bucket_id = 'receipts' AND user owns folder |
| receipts | System can upload | INSERT | bucket_id = 'receipts' AND auth.role() = 'service_role' |
| receipts | Admins can view all | SELECT | bucket_id = 'receipts' AND is_admin() |

---

## Scheduled Jobs (pg_cron)

| Job Name | Schedule | Description |
|----------|----------|-------------|
| `auto-close-expired-registrations` | */15 * * * * (every 15 min) | Closes registration when deadline passes |
| `auto-open-registrations` | */15 * * * * (every 15 min) | Opens registration when start time arrives |
| `expire-pending-payments` | 0 * * * * (every hour) | Cancels registrations with pending payments > 24 hours |
| `cleanup-expired-notifications` | 0 0 * * * (daily midnight) | Deletes expired notifications |
| `send-registration-reminders` | 0 9 * * * (daily 9 AM) | Sends reminders for events starting next day |

---

## Storage Buckets

| Bucket | Public | Max Size | Allowed Types |
|--------|--------|----------|---------------|
| `sport-images` | Yes | 5 MB | image/jpeg, image/png, image/webp |
| `avatars` | Yes | 2 MB | image/jpeg, image/png, image/webp |
| `receipts` | No | 1 MB | application/pdf |

---

## Edge Functions API

### Auth Endpoints (`/auth`)

**File:** `functions/auth/index.ts`

#### POST /auth/signup

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "phone": "9876543210",
  "college": "IIT Delhi"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", ... },
    "profile": { "id": "uuid", "name": "John Doe", ... }
  },
  "message": "Account created successfully"
}
```

**Validation:**
- Email must be valid format
- Password must be 8+ characters
- Phone must be valid 10-digit Indian mobile
- All fields required

---

#### GET /auth/profile

Get current user's profile with summary stats.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": { "id": "uuid", "name": "John Doe", ... },
    "registrations_count": 5,
    "unread_notifications": 3
  }
}
```

---

#### PATCH /auth/profile

Update current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "9876543211",
  "college": "IIT Bombay",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "John Smith", ... },
  "message": "Profile updated successfully"
}
```

---

### Sports Endpoints (`/sports`)

**File:** `functions/sports/index.ts`

#### GET /sports

List all active sports with filtering and pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `category` - Filter by category (indoor/outdoor/esports/athletics)
- `is_open` - Filter by registration status (true/false)
- `search` - Search by name
- `sort` - Sort column (registration_deadline, name, category, created_at, fees)

**Response:**
```json
{
  "success": true,
  "data": {
    "sports": [...],
    "total": 50,
    "page": 1,
    "limit": 20,
    "has_more": true
  }
}
```

---

#### GET /sports/:id

Get sport details by ID or slug.

**Response:**
```json
{
  "success": true,
  "data": {
    "sport": { ... },
    "applicable_fees": 150.00,
    "can_register": true,
    "register_reason": "OK",
    "waitlist_available": false,
    "spots_remaining": 10
  }
}
```

---

#### POST /sports (Admin)

Create a new sport.

**Request Body:**
```json
{
  "name": "Table Tennis",
  "category": "indoor",
  "fees": 100.00,
  "registration_start": "2024-01-01T00:00:00Z",
  "registration_deadline": "2024-02-01T00:00:00Z",
  "description": "Singles tournament",
  "max_participants": 32
}
```

---

#### PATCH /sports/:id (Admin)

Update sport details.

---

#### POST /sports/:id/toggle-registration (Admin)

Toggle registration open/closed status.

---

#### POST /sports/:id/duplicate (Admin)

Create a copy of an existing sport.

---

#### POST /sports/:id/archive (Admin)

Soft-delete a sport.

---

### Registrations Endpoints (`/registrations`)

**File:** `functions/registrations/index.ts`

#### GET /registrations/check/:sport_id

Check registration eligibility for a sport.

**Response:**
```json
{
  "success": true,
  "data": {
    "can_register": true,
    "reason": "OK",
    "waitlist_available": false,
    "applicable_fees": 150.00,
    "spots_remaining": 10
  }
}
```

---

#### GET /registrations/me

Get current user's registrations.

**Query Parameters:**
- `status` - Filter by status
- `include_past` - Include cancelled/withdrawn (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "registrations": [
      {
        "id": "uuid",
        "registration_number": "REG-CRI-0001",
        "sport": { ... },
        "team_members": [...],
        "payments": [...]
      }
    ]
  }
}
```

---

#### GET /registrations/:id

Get a single registration with details.

---

#### POST /registrations

Create a new registration.

**Request Body:**
```json
{
  "sport_id": "uuid",
  "is_team": true,
  "team_name": "Team Alpha",
  "team_members": [
    { "name": "John Doe", "email": "john@example.com", "is_captain": true },
    { "name": "Jane Doe", "email": "jane@example.com" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "registration": { ... },
    "status": "payment_pending",
    "amount": 150.00,
    "waitlist_position": null
  },
  "message": "Registration created. Please complete payment."
}
```

---

#### PATCH /registrations/:id/team

Update team members for a registration.

**Request Body:**
```json
{
  "team_name": "Team Beta",
  "team_members": [...]
}
```

---

#### POST /registrations/:id/cancel

Cancel a registration.

**Request Body:**
```json
{
  "reason": "Unable to attend"
}
```

---

### Payments Endpoints (`/payments`)

**File:** `functions/payments/index.ts`

#### POST /payments/create-order

Create a Razorpay order for a registration.

**Request Body:**
```json
{
  "registration_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "order_xxx",
    "amount": 15000,
    "currency": "INR",
    "key_id": "rzp_xxx",
    "registration": { ... },
    "prefill": {
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "9876543210"
    }
  }
}
```

---

#### POST /payments/verify

Verify a Razorpay payment after completion.

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "registration": { ... },
    "payment": { ... },
    "receipt_url": "https://..."
  }
}
```

---

#### POST /payments/webhook

Handle Razorpay webhook events.

**Events Handled:**
- `payment.captured` - Mark payment as successful
- `payment.failed` - Mark payment as failed
- `refund.created` / `refund.processed` - Process refunds

---

#### POST /payments/verify-offline (Admin)

Verify an offline payment.

**Request Body:**
```json
{
  "registration_id": "uuid",
  "amount": 150.00,
  "verification_note": "Cash received at counter"
}
```

---

#### POST /payments/:id/refund (Admin)

Process a refund.

**Request Body:**
```json
{
  "amount": 100.00,
  "reason": "Event cancelled"
}
```

---

#### GET /payments/me

Get current user's payment history.

---

#### GET /payments/:id/receipt

Get payment receipt.

---

### Notifications Endpoints (`/notifications`)

**File:** `functions/notifications/index.ts`

#### GET /notifications

Get user's notifications with cursor-based pagination.

**Query Parameters:**
- `unread_only` - Only unread notifications (true/false)
- `limit` (default: 20, max: 50)
- `cursor` - Pagination cursor (created_at of last item)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "next_cursor": "2024-01-15T10:30:00Z"
  }
}
```

---

#### GET /notifications/unread-count

Get unread notification count.

**Response:**
```json
{
  "success": true,
  "data": { "unread_count": 5 }
}
```

---

#### POST /notifications/mark-read

Mark notifications as read.

**Request Body:**
```json
{
  "notification_ids": ["uuid1", "uuid2"]
}
```

---

#### POST /notifications/broadcast (Admin)

Send broadcast notification to multiple users.

**Request Body:**
```json
{
  "title": "Important Announcement",
  "message": "The event has been rescheduled.",
  "priority": "high",
  "target": {
    "type": "sport",
    "value": "sport_uuid"
  },
  "send_email": true
}
```

**Target Types:**
- `all` - All users
- `sport` - Users registered for specific sport
- `college` - Users from specific college

---

### Analytics Endpoints (`/analytics`)

**File:** `functions/analytics/index.ts`

All endpoints require admin access.

#### GET /analytics/dashboard

Get dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_registrations": 150,
      "confirmed_registrations": 120,
      "pending_payments": 20,
      "waitlisted": 10,
      "total_revenue": 50000.00,
      "todays_revenue": 5000.00,
      "active_sports": 10,
      "total_participants": 100,
      "colleges_count": 15
    },
    "recent_registrations": [...],
    "recent_payments": [...]
  }
}
```

---

#### GET /analytics/sports

Get all sports analytics.

---

#### GET /analytics/sport/:id

Get single sport analytics.

---

#### GET /analytics/colleges

Get college-wise analytics.

---

#### GET /analytics/revenue

Get revenue analytics.

**Query Parameters:**
- `period` - daily/weekly/monthly (default: daily)

---

#### GET /analytics/trends

Get registration trends (30 days).

---

### Admin Endpoints (`/admin`)

**File:** `functions/admin/index.ts`

All endpoints require admin access.

#### GET /admin/audit-logs

Get audit logs with filtering.

**Query Parameters:**
- `page`, `limit`
- `user_id` - Filter by user
- `entity_type` - Filter by entity type
- `action` - Filter by action
- `from`, `to` - Date range

---

#### GET /admin/colleges

Get all colleges.

**Query Parameters:**
- `include_inactive` - Include inactive colleges (default: false)

---

#### POST /admin/colleges

Create a new college.

**Request Body:**
```json
{
  "name": "New College",
  "short_name": "NC",
  "city": "Mumbai"
}
```

---

#### PATCH /admin/colleges/:id

Update a college.

---

#### DELETE /admin/colleges/:id

Soft-delete a college (sets is_active = false).

---

#### GET /admin/settings

Get all application settings.

---

#### PATCH /admin/settings

Update settings.

**Request Body:**
```json
{
  "registration_enabled": true,
  "event_name": "Sports Fest 2025"
}
```

---

#### GET /admin/registrations

Get all registrations with filtering.

**Query Parameters:**
- `page`, `limit`
- `sport_id` - Filter by sport
- `status` - Filter by status
- `payment_status` - Filter by payment status
- `college` - Filter by college
- `search` - Search by name/email/registration number
- `date_from`, `date_to` - Date range

---

#### PATCH /admin/registrations/:id

Update a registration.

---

#### POST /admin/registrations/bulk-update

Bulk update registrations.

**Request Body:**
```json
{
  "registration_ids": ["uuid1", "uuid2"],
  "status": "confirmed",
  "reason": "Manual verification completed"
}
```

---

#### GET /admin/registrations/export

Export registrations as CSV.

**Query Parameters:**
- `sport_id` - Filter by sport
- `status` - Filter by status
- `format` - csv (default)

**Response:** CSV file download

---

## Shared Utilities

### utils.ts

**Environment Variables:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay key secret
- `RAZORPAY_WEBHOOK_SECRET` - Razorpay webhook secret
- `RESEND_API_KEY` - Resend API key
- `FRONTEND_URL` - Frontend URL (default: http://localhost:3000)

**Functions:**
- `createUserClient(req)` - Create Supabase client with user JWT
- `createAdminClient()` - Create Supabase admin client (bypasses RLS)
- `getCurrentUser(req)` - Get current user profile
- `isAdmin(req)` - Check if user is admin
- `isCoordinator(req)` - Check if user is admin or coordinator
- `jsonResponse(data, status)` - Create JSON response
- `success(data, message)` - Success response helper
- `error(message, status)` - Error response helper
- `corsResponse()` - CORS preflight response
- `validateRequired(body, fields)` - Validate required fields
- `isValidEmail(email)` - Email validation
- `isValidPhone(phone)` - Indian phone validation
- `createAuditLog(...)` - Create audit log entry
- `parseBody(req)` - Safe JSON body parsing
- `getQueryParams(req)` - Get URL query params
- `getPagination(params)` - Get pagination params with NaN protection

---

### razorpay.ts

**Functions:**
- `createRazorpayOrder(params)` - Create Razorpay order
- `verifyPaymentSignature(orderId, paymentId, signature)` - Verify payment signature (timing-safe)
- `verifyWebhookSignature(body, signature)` - Verify webhook signature (timing-safe)
- `fetchPayment(paymentId)` - Fetch payment details
- `createRefund(params)` - Create refund

**Security Features:**
- Timing-safe signature verification using `timingSafeEqual`
- Request timeout (30 seconds)
- Amount validation

---

### email.ts

**Functions:**
- `sendEmail(params)` - Send email via Resend API
- `getWelcomeEmailHtml(name)` - Welcome email template
- `getRegistrationConfirmationHtml(name, sportName, registrationNumber, isWaitlist)` - Registration email
- `getPaymentConfirmationHtml(name, sportName, registrationNumber, amount, receiptNumber)` - Payment email
- `getWaitlistPromotionHtml(name, sportName)` - Waitlist promotion email
- `getReminderEmailHtml(name, sportName, eventDate, venue)` - Event reminder email

**Security Features:**
- HTML escaping for all user inputs (XSS prevention)
- Dynamic year in templates
- Safe amount formatting

---

## Configuration

### config.toml

**API Configuration:**
- Port: 54321
- Schemas: public, storage, graphql_public
- Max rows: 1000

**Database Configuration:**
- Port: 54322
- PostgreSQL version: 15

**Studio Configuration:**
- Port: 54323
- API URL: http://localhost:54321

**Inbucket (Email Testing):**
- Web UI Port: 54324
- SMTP Port: 54325
- POP3 Port: 54326

**Storage:**
- Max file size: 50 MiB

**Auth:**
- Site URL: http://localhost:3000
- JWT expiry: 3600 seconds (1 hour)
- Email signup: enabled
- Email confirmation: required
- Double confirm changes: enabled
- SMS signup: disabled

**Realtime:**
- Enabled: true

---

## Seed Data

### Sample Colleges (10)

- IIT Delhi, IIT Bombay, IIT Madras
- Delhi University, JNU
- BITS Pilani
- NITK, VIT, SRM, MIT Manipal

### Sample Sports (10)

| Sport | Category | Team | Fee | Max Participants |
|-------|----------|------|-----|------------------|
| Cricket | outdoor | Yes (11-15) | ₹500 | 16 teams |
| Football | outdoor | Yes (5-7) | ₹300 | 20 teams |
| Badminton Singles | indoor | No | ₹150 | 32 |
| Badminton Doubles | indoor | Yes (2) | ₹200 | 24 teams |
| Table Tennis | indoor | No | ₹100 | 48 |
| Chess | indoor | No | ₹50 | 64 |
| Valorant | esports | Yes (5-6) | ₹400 | 16 teams |
| 100m Sprint | athletics | No | ₹75 | 50 |
| Long Jump | athletics | No | ₹75 | 40 |
| Basketball 3x3 | outdoor | Yes (3-4) | ₹250 | 20 teams |

---

## Security Features Summary

1. **SQL Injection Prevention:**
   - SET search_path on all SECURITY DEFINER functions
   - LIKE pattern escaping in search queries

2. **Race Condition Prevention:**
   - Advisory locks for sequence generation
   - Unique partial indexes on payments
   - FOR UPDATE SKIP LOCKED for waitlist promotion

3. **XSS Prevention:**
   - HTML escaping in all email templates
   - CSV value escaping in exports

4. **Timing Attack Prevention:**
   - Timing-safe signature verification for Razorpay

5. **Access Control:**
   - Comprehensive RLS policies
   - Role-based function access
   - WITH CHECK clauses on UPDATE policies
   - Service role restrictions for sensitive inserts

6. **Input Validation:**
   - Email, phone, UUID format validation
   - Parameter whitelist validation
   - NaN protection in pagination

7. **Audit Trail:**
   - Comprehensive audit logging
   - IP address and user agent tracking

---

## Deployment Commands

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase migration up

# Deploy Edge Functions
supabase functions deploy

# Run seed data
supabase db seed

# Run tests
./supabase/functions/_tests/run_tests.sh
```
