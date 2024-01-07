## Using `index.ts` as a Public API in Feature-Based Architecture

In feature-based architecture, `index.ts` files serve as the public API for each feature module. This approach simplifies imports and maintains clear boundaries between features.

### Structure

Each feature folder contains an `index.ts` file, which re-exports the necessary components, hooks, utilities, etc., from that feature.

#### Example

Consider a feature named `UserProfile`. The folder structure and `index.ts` might look like this:

```plaintext
/UserProfile
  /components
    UserProfileForm.tsx
    Avatar.tsx
  /hooks
    useUserProfile.ts
  /utils
    userProfileHelpers.ts
  UserProfile.tsx
  index.ts
```

In `UserProfile/index.ts`:

#### Re-exporting Default Exports:

```typescript
export { default as UserProfile } from './UserProfile';
export { default as UserProfileForm } from './components/UserProfileForm';
export { default as Avatar } from './components/Avatar';
export { useUserProfile } from './hooks/useUserProfile';
export * from './utils/userProfileHelpers';
```

#### Re-exporting Named Exports:

```typescript
// Re-exporting from individual files
export { UserProfile } from './UserProfile';
export { UserProfileForm } from './components/UserProfileForm';
export { Avatar } from './components/Avatar';
export { useUserProfile } from './hooks/useUserProfile';
export * from './utils/userProfileHelpers';
```

### Importing from the Feature

With the above setup, importing in other parts of the application becomes straightforward:

```typescript
import { UserProfile, UserProfileForm, useUserProfile } from '@/features/UserProfile';
```

### Best Practices

- **Only Expose Necessary Parts:** Only re-export elements intended for use outside the feature.
- **Consistent Naming:** Maintain consistency between file names and export names.
- **Documentation:** Document the `index.ts` file, especially for large features.
