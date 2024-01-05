## TypeScript and Vite Configuration for Absolute Imports

### TypeScript (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["node"],
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

This configuration sets up TypeScript for a project with a custom path alias (`@`) pointing to the `src` folder. It includes Node.js type definitions and various settings for strict type checking and JSX support.

### Vite (`vite.config.ts`):

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

The Vite configuration aligns with the TypeScript setup for path resolution. It includes the React plugin and sets up an alias for `@` to resolve to the `src` directory.

### Explanation:

- **TypeScript Configuration:**
  - Uses `baseUrl` and `paths` to set up the `@` alias.
  - Includes Node.js types for compatibility with Node-specific elements like `__dirname`.
  - Configures the compiler for modern JavaScript and JSX.

- **Vite Configuration:**
  - Uses `defineConfig` for better typing support.
  - Adds the React plugin for React-specific features.
  - Sets up an alias for `@` to resolve to the `src` directory, matching the TypeScript path configuration.

- **Project References:**
  - The `references` property in `tsconfig.json` points to `tsconfig.node.json`, indicating dependencies between multiple TypeScript projects, typically used in larger codebases or monorepos.
