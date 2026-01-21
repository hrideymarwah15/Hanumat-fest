# Edge Function Tests

Comprehensive test suite for all Sports Registration System Edge Functions.

## Test Structure

```
_tests/
  test_utils.ts        # Shared utilities and helpers
  auth_test.ts         # Authentication tests (15 tests)
  sports_test.ts       # Sports CRUD tests (25 tests)
  registrations_test.ts # Registration tests (25 tests)
  payments_test.ts     # Payment tests (20 tests)
  notifications_test.ts # Notification tests (15 tests)
  analytics_test.ts    # Analytics tests (15 tests)
  admin_test.ts        # Admin panel tests (25 tests)
  run_tests.sh         # Test runner script
```

## Prerequisites

1. **Deno** installed (https://deno.land)
2. **Supabase project** running (local or hosted)
3. **Environment variables** configured

## Setup

### 1. Set Environment Variables

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

Or create a `.env.test` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> [!CAUTION]
> **Security Warning:**
> - **Never commit `.env.test` or any credential file to version control**
> - Ensure `.env.test` is listed in `.gitignore`
> - `SUPABASE_SERVICE_ROLE_KEY` has **full database access** and must be kept secret
> - Use separate credentials for local development vs CI/CD (use environment variables/secrets in CI)

Then source it:
```bash
source .env.test
```

### 2. Start Supabase (if running locally)

```bash
npx supabase start
```

### 3. Deploy Edge Functions (if testing locally)

```bash
npx supabase functions serve
```

## Running Tests

### Run All Tests

```bash
./run_tests.sh
```

Or directly with Deno:

```bash
deno test --allow-net --allow-env --allow-read --unstable ./
```

### Run Specific Test File

```bash
./run_tests.sh auth           # Run auth tests
./run_tests.sh sports         # Run sports tests
./run_tests.sh registrations  # Run registration tests
./run_tests.sh payments       # Run payment tests
./run_tests.sh notifications  # Run notification tests
./run_tests.sh analytics      # Run analytics tests
./run_tests.sh admin          # Run admin tests
```

### Run Tests with Filter

```bash
./run_tests.sh --filter "signup"       # Tests containing "signup"
./run_tests.sh auth --filter "profile" # Auth profile tests only
```

### List Available Tests

```bash
./run_tests.sh --list
```

## Test Categories

### Auth Tests (`auth_test.ts`)
- User signup with validation
- Profile retrieval
- Profile updates
- Email/phone validation
- Duplicate email handling
- CORS handling

### Sports Tests (`sports_test.ts`)
- List sports with filters
- Get sport by ID/slug
- Create sport (admin)
- Update sport (admin)
- Toggle registration (admin)
- Duplicate sport (admin)
- Archive sport (admin)

### Registration Tests (`registrations_test.ts`)
- Check eligibility
- Create individual registration
- Create team registration
- Get user's registrations
- Update team members
- Cancel registration
- Waitlist functionality

### Payment Tests (`payments_test.ts`)
- Create Razorpay order
- Verify payment signature
- Verify offline payment (admin)
- Process refund (admin)
- Get payment history
- Get receipt

### Notification Tests (`notifications_test.ts`)
- List notifications
- Get unread count
- Mark as read
- Broadcast notification (admin)
- Pagination

### Analytics Tests (`analytics_test.ts`)
- Dashboard stats
- Sport-wise analytics
- College-wise analytics
- Revenue analytics
- Registration trends
- Single sport analytics

### Admin Tests (`admin_test.ts`)
- Audit logs
- College CRUD
- Settings management
- Registration management
- Bulk update registrations
- Export registrations (CSV/JSON)

## Test Utilities

The `test_utils.ts` file provides:

### Configuration
- `getTestConfig()` - Get test configuration from env vars

### User Management
- `createTestUser()` - Create a test user
- `loginTestUser()` - Login an existing user
- `deleteTestUser()` - Cleanup test user
- `setupTestUser()` - Quick setup for test context
- `setupAdminUser()` - Setup admin user for context

### Request Helpers
- `request()` - Make authenticated API request
- `adminRequest()` - Make admin request with service role

### Mock Data Generators
- `generateTestEmail()` - Unique test email
- `generateTestPhone()` - Valid Indian phone number
- `generateMockUserData()` - Complete user data
- `generateMockSportData()` - Sport data with valid dates
- `generateMockTeamSportData()` - Team sport data
- `generateMockTeamMembers()` - Team member array

### Assertion Helpers
- `assertSuccess()` - Assert 200 with success: true
- `assertError()` - Assert error response
- `assertUnauthorized()` - Assert 401
- `assertForbidden()` - Assert 403
- `assertNotFound()` - Assert 404

### Database Helpers
- `dbQuery()` - Query database directly
- `dbInsert()` - Insert test data
- `dbDelete()` - Cleanup test data

### Context Management
- `createTestContext()` - Create fresh test context
- `cleanupTestContext()` - Cleanup all created resources
- `withTestContext()` - Wrapper for automatic cleanup

## Writing New Tests

### Basic Test Structure

```typescript
import {
  assertEquals,
  request,
  assertSuccess,
  createTestContext,
  cleanupTestContext,
  setupTestUser,
} from "./test_utils.ts";

Deno.test({
  name: "MyFunction: should do something",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "my-function", "endpoint", {
        method: "POST",
        accessToken: user.accessToken,
        body: { key: "value" },
      });

      assertSuccess(response);
      assertEquals(response.data.data?.result, "expected");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  // Resource sanitization disabled for async Supabase Edge Function tests
  // WARNING: This can mask unclosed connections, timers, or file handles
  // Best practices:
  // - Explicitly close connections and clear timers in tests
  // - Enable these checks where possible for better test reliability
  // - Consider restricting these flags to specific tests that need them
  sanitizeOps: false,
  sanitizeResources: false,
});
```

### Testing Admin Endpoints

```typescript
Deno.test({
  name: "Admin: should require admin role",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx); // Regular user

      const response = await request(ctx.config, "admin", "endpoint", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertForbidden(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
```

## Troubleshooting

### Tests Failing with "Missing environment variables"
Make sure all required environment variables are set and exported.

### Tests Failing with Connection Errors
1. Check if Supabase is running
2. Verify the `SUPABASE_URL` is correct
3. For local development, ensure `supabase functions serve` is running

### Tests Failing with Auth Errors
1. Verify `SUPABASE_ANON_KEY` is correct
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Check if the keys match the running Supabase instance

### Cleanup Issues
If tests leave orphaned data:
1. Check `cleanupTestContext()` is called in finally block
2. Manually clean test data from database
3. Run `supabase db reset` for local development

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Edge Function Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      
      - name: Start Supabase
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - run: supabase start
      
      - name: Run Tests
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: |
          cd supabase/functions/_tests
          ./run_tests.sh
```

## Coverage

The test suite covers:
- All API endpoints defined in `devbackend.xml`
- Authentication and authorization flows
- Input validation and error handling
- Admin-only access control
- CORS preflight handling
- Edge cases and error conditions

Total: ~140+ test cases
