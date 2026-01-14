# Road2 Rehabilitation 🏥

Road2 is a premium, mobile-first recovery companion designed for physiotherapy patients. It tracks daily goals, exercise logs, and provides a 12-week visualized "Journey" to recovery.

## 🏗 Architecture Overview

The app follows a modern serverless architecture:
- **Frontend**: React + Vite
- **Backend**: Appwrite (BaaS)
- **Styling**: Vanilla CSS with a custom Design System
- **State Management**: React Context API (`AuthContext`)

## 🔐 Multi-User Data Integrity

Data security and user isolation are built into the core of the application. 

### 1. User Authentication
We use Appwrite Accounts for secure authentication. Every user has a unique `$id`.

### 2. Data Association
Every document stored in Appwrite is associated with a specific user via a `userId` attribute.
- **Profiles**: Stored in the `users` collection. The Document ID is the same as the User's unique ID (`$id`).
- **Goals/Exercises/Journeys**: Every record includes a `userId` field.

### 3. Service Layer Enforcement
All data operations go through `src/lib/services.js`. These functions **require** a `userId` as the first argument, ensuring that the calling components explicitly provide the authenticated user's context.

### 4. Appwrite Permissions
We use Appwrite's **Document Level Security**. For every collection (`goals`, `exercises`, etc.), permissions are configured as:
- **Role: Users** -> Read/Write/Update/Delete (Access is limited to "Own Record" by Appwrite's row-level security logic).

---

## 🛠 Project Structure

- `src/lib/appwrite.js`: SDK Initialization and configuration.
- `src/lib/AuthContext.jsx`: Global state for the authenticated user and their profile.
- `src/lib/services.js`: CRUD functions for all features.
- `src/pages/`: Individual view components.
- `src/index.css`: The "Source of Truth" for the app's visual design.
