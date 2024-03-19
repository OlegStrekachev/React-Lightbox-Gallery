# React-Redux-Vite Lightbox Modal Gallery Window

Built using Vite as the build tool and Redux Toolkit for state management, this gallery enhances user experience with its robust and centralized control over modal operations, which is particularly useful for applications that require a singular, active modal window at any given time. However, its design is flexible enough to be adapted for use without Redux, should your project's architecture demand it.

Follow this link to see a live example of how it looks like [[Live version]](https://strekachev.com/react-lightbox/ "Live working version")

## Technology used 🔧

- **React**
- **Vite**
- **Redux-toolkit**
- **Typescript**

## Key Features ⭐

### Interactive Navigation

- Users can seamlessly navigate through the gallery using a variety of inputs. This includes intuitive pointer and touch gestures for scrolling through images, as well as convenient button and keyboard controls for those who prefer traditional navigation methods.

### Dynamic Mini-Gallery

- A mini-gallery complements the main display by providing a visual thumbnail track of all images. It's smartly engineered to automatically center on the currently viewed image and dynamically responds to user interactions, ensuring a smooth and engaging browsing experience.

### Enhanced Zoom and Pan Capabilities

- The gallery introduces an advanced zoom feature for the main image view. Once zoomed in, users can enjoy a fullscreen zoom experience, complete with pointer and touch-enabled panning. This functionality invites users to explore details of images with ease and precision, enhancing engagement and interaction with the content.

### Responsive and Modular Design

- Designed with responsiveness in mind, the gallery ensures an optimal viewing experience across a variety of devices and screen orientations. Its modular construction not only facilitates ease of maintenance and scalability but also allows for straightforward customization to fit the specific needs of your project.

### Centralized State Management with Redux

- By leveraging Redux Toolkit, the gallery benefits from a unified state management system. This setup is ideal for managing modal states within complex applications, ensuring that the gallery operates seamlessly within the broader application context. Although designed with Redux in mind, the architecture is flexible enough to be modified for use without Redux, catering to a wide range of application needs.

## Potential issues

- The modal window currently employs a timeout function (line 85-ish) as a workaround to address challenges with executing layout functions upon component mounting. This approach aims to give the DOM time to stabilize before manipulation. However, a more robust solution is likely available that can enhance efficiency and reliability.

- My Typescript types might be a bit wacky since I am still learning typescript.

## Room for improvement

- There is a need for a pinch zoom functionality for mobile devices. Soon™

## Boilerplate configurations I have to write down to remember 🤯

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
    "strict": true
    // ... other options ...
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- **Purpose**: Configures TypeScript for absolute imports using the `@` alias for the `src` directory.
- **Key Options**:
  - `baseUrl` and `paths` establish the base directory and path aliases.
  - `types`: Includes Node.js types for Node-specific globals like `__dirname`.
  - `strict`: Enables strict type-checking options.

### Vite Setup (`vite.config.ts`):

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
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
