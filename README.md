## Configuring Absolute Imports in TypeScript and Vite

### TypeScript Setup (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    // Additional compiler options...
    "types": ["node"],
    "strict": true,
    // ... other options ...
  },
  "include": ["src"],
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
```

- **Purpose**: Configures TypeScript for absolute imports using the `@` alias for the `src` directory.
- **Key Options**:
  - `baseUrl` and `paths` establish the base directory and path aliases.
  - `types`: Includes Node.js types for Node-specific globals like `__dirname`.
  - `strict`: Enables strict type-checking options.

### Vite Setup (`vite.config.ts`):

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

- **Purpose**: Aligns Vite's module resolution with TypeScript's, allowing the use of the `@` alias for absolute imports.
- **Configuration**:
  - `resolve.alias`: Maps `@` to the `src` directory.
  - Includes the React plugin for React-specific optimizations.

### Overview:

- Both TypeScript and Vite require separate configurations for absolute imports to work consistently across the development environment.
- `tsconfig.json` configures TypeScript's compiler to understand the `@` alias during type checking and compilation.
- `vite.config.ts` ensures Vite resolves the `@` alias correctly during module bundling and development server operations.
- This setup provides a seamless development experience with improved import path clarity and consistency.
