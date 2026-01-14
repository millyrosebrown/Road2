# Data Integrity & User Isolation

## Context
Road2 is a multi-user physiotherapy tracking app. User data MUST be isolated at all times.

## Rules
- **Rule 1**: Every database operation (List, Create, Update, Delete) MUST include a user context.
- **Rule 2**: Usage of `useAuth()` in components is mandatory to retrieve the `user.$id`.
- **Rule 3**: In `src/lib/services.js`, never list documents without a `Query.equal('userId', userId)` filter.
- **Rule 4**: Use the `profile` document from `AuthContext` for high-level user settings (like `ultimateGoal`).
- **Rule 5**: For time-sensitive logs (Exercises, Goals), ensure the `date` string is consistently formatted as `YYYY-MM-DD`.

## Verification Step
Before finalizing any code change that writes to the database, double-check that the `userId` is being passed into the service and stored in the document.
