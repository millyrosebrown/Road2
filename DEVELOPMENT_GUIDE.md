# Development Standards & Data Integrity 🛡️

To maintain the quality and security of the Road2 application, all future modifications must adhere to these standards.

## 1. The "userId" Rule
**Every data-writing or data-reading feature must include the current user's ID.**
- Never fetch "all records". Always query by `Query.equal('userId', userId)`.
- The `userId` must be retrieved from the `useAuth()` hook within the React component before being passed to a service.

## 2. Service Layer Pattern
Do **not** call Appwrite SDK methods directly from within Page components. 
- Create a corresponding function in `src/lib/services.js`.
- This function must accept `userId` as its first parameter.
- Example: `export const featureService = { createItem: (userId, data) => { ... } }`

## 3. Data Validation
- Use ISO strings for dates (`new Date().toISOString()`) or standardized YYYY-MM-DD strings for daily logs.
- Ensure all collection IDs and attribute names match those defined in `src/lib/appwrite.js` and the Appwrite Console.

## 4. UI/UX Consistency
- Always use the design tokens (CSS variables) defined in `src/index.css`.
- Ensure mobile-first responsiveness (max-width 430px for the primary container).
- Use `lucide-react` for all icons to maintain a consistent visual language.

## 5. Branch & Deployment
- All major features should be committed with descriptive messages (following Conventional Commits, e.g., `feat:`, `fix:`, `chore:`).
- Pushes to `main` trigger automatic deployment to Vercel. Verify the build status after every push.

---

*Failure to follow these guidelines risks desynchronizing patient data or compromising user privacy.*
