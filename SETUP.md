# React Migration Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup HTML Entry Point

Vite requires `index.html` in the root. You have two options:

**Option A: Backup and Replace (Recommended for React development)**
```bash
# Backup the original index.html
mv index.html index-vanilla.html

# Use the React version
mv index-react.html index.html
```

**Option B: Keep Both (For gradual migration)**
```bash
# Just rename the React version to index.html temporarily
cp index-react.html index.html
# When done testing, you can restore: mv index-vanilla.html index.html
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Current Status

✅ **Phase 1 Complete**: Foundation setup is done
- React project structure created
- Supabase services migrated
- Context providers (Theme, Auth) set up
- Common components created
- Routing infrastructure in place
- Splash screen migrated

⏳ **Next**: Phase 2 - Authentication Flow migration

## Development Workflow

1. **React Development**: Use `index.html` (React version)
2. **Vanilla JS Testing**: Use `index-vanilla.html` (original)

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Notes

- The old vanilla JS code is preserved and can still run independently
- All Supabase services are migrated and ready to use
- CSS files from the original app are still available
- The React app uses the same Supabase credentials
