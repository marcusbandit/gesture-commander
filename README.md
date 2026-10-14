# Gesture Commander

A hand gesture recognition project built with React, TypeScript, and Vite.

## Project Status
🟡 **On Hold**: The project is currently on hold. The initial goals have been accomplished, and development will resume when new features or improvements are planned.

## Development

### Prerequisites
- Node.js (v18 or higher)
- Modern browser with camera support (Chrome, Firefox, Safari, Edge)

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

4. Grant camera permissions when prompted by your browser

### Camera Access Requirements

- **Local Development**: Camera access works on `localhost` even with HTTP for development
- **Production**: HTTPS is required for camera access in production environments
- **Browser Permissions**: Allow camera access when prompted by your browser
- **No Other Camera Usage**: Ensure no other applications are using your camera
- **Modern Browser**: Use Chrome, Firefox, Safari, or Edge for best compatibility

### Troubleshooting Camera Issues

If you encounter "Failed to acquire camera feed" errors:

1. **Check URL**: Ensure you're accessing the app via `http://localhost:5173` for development
2. **Browser Permissions**: Check your browser's camera permissions for localhost
3. **Camera Availability**: Make sure no other apps are using the camera
4. **Browser Compatibility**: Try a different browser if issues persist
5. **SSL Issues**: If you see SSL errors, use the HTTP URL instead of HTTPS for local development

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
