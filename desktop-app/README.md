# Desktop App - Employee Time Tracker

This is the Electron-based desktop application for employees to track their time and capture screenshots.

## Environment Configuration

⚠️ **IMPORTANT**: The API URL you configure will be **bundled into the app** at build time.

### For Development/Testing

Copy the development environment file:

```bash
cd renderer
cp .env.development .env.local
```

This uses `http://localhost:3000/api` - perfect for local testing.

### For Production Builds

**Before building the production DMG**, update `.env.local` with your deployed backend URL:

```bash
cd renderer
cp .env.production.example .env.local
# Edit .env.local with your production API URL
```

Example production config:

```env
NEXT_PUBLIC_API_URL=https://api.yourcompany.com/api
NEXT_PUBLIC_SCREENSHOT_INTERVAL_SECONDS=600
```

### Configuration Options

- **`NEXT_PUBLIC_API_URL`** (required)
  - Backend API URL
  - **Development**: `http://localhost:3000/api`
  - **Production**: `https://your-deployed-api.com/api`
  
- **`NEXT_PUBLIC_SCREENSHOT_INTERVAL_SECONDS`** (optional)
  - Screenshot capture interval in seconds
  - **Development**: `20` (for quick testing)
  - **Production**: `600` (10 minutes recommended)
  - Examples:
    - `60` = 1 minute
    - `300` = 5 minutes
    - `600` = 10 minutes (recommended)
    - `1800` = 30 minutes

### AWS S3 Configuration

Screenshots are uploaded to AWS S3. Add these to `.env.local`:

```env
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-aws-key
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-aws-secret
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET=your-screenshots-bucket
```

⚠️ **Security Note**: Use read-only IAM credentials with minimal S3 permissions for production builds

## Development

```bash
cd desktop-app
npm install
npm run dev
```

## Building for Production

### Prerequisites

Before building, ensure you have:
- Node.js 18+ installed
- Platform-specific build tools installed
- AWS credentials configured in `.env.local`
- Production API URL configured

### Build Commands

```bash
# Clean previous builds
npm run clean

# Build for current platform
npm run build:mac     # macOS only
npm run build:win     # Windows only
npm run build:linux   # Linux only

# Build for all platforms (requires specific setup)
npm run build:all
```

### Output

Built installers will be in the `dist/` directory:

**macOS**:
- `Insightful Time Tracker-1.0.0.dmg` - Disk image
- `Insightful Time Tracker-1.0.0-mac.zip` - ZIP archive

**Windows**:
- `Insightful Time Tracker Setup 1.0.0.exe` - Installer
- `Insightful Time Tracker 1.0.0.exe` - Portable version

**Linux**:
- `Insightful Time Tracker-1.0.0.AppImage` - AppImage
- `insightful-time-tracker_1.0.0_amd64.deb` - Debian package

### Distribution

1. Upload installers to a hosting service (S3, GitHub Releases, etc.)
2. Update the download links in your web frontend
3. Share the download links with employees

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for detailed instructions.

## Features

- Employee-only login (admin accounts cannot use desktop app)
- Time tracking with start/stop
- Automatic screenshot capture at configurable intervals
- Active window tracking
- Project and task selection
- Shift management

## Project Structure

### Key Files

- **`renderer/lib/screenshotCapture.ts`** - Screenshot capture and upload logic
- **`renderer/lib/api.ts`** - API client for backend communication
- **`renderer/lib/storage.ts`** - AWS S3 upload utilities
- **`renderer/app/tracker/page.tsx`** - Main time tracking UI
- **`renderer/app/login/page.tsx`** - Employee login page
- **`main/index.js`** - Electron main process

### Screenshot Capture Flow

1. Capture screen using Electron API
2. Get active window information
3. Upload image to AWS S3
4. Create screenshot record in backend with metadata
5. Repeat at configured interval
