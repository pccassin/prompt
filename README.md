# Prompt - Teleprompter Web App

A modern, feature-rich teleprompter web application built with Next.js and TypeScript.

## Features

- Adjustable scroll speed and font size
- Picture-in-Picture mode with opacity control
- Draggable floating window
- Mirror text display
- Modern UI with smooth animations
- Infinite scroll mode
- Line spacing control

## Development Workflow

This project uses a staging-to-production deployment workflow for safe and controlled releases.

### Environments

- **Staging**: https://pccassin.github.io/prompt-staging
- **Production**: https://pccassin.github.io/prompt

### Branch Structure

- `develop` - Development branch, deploys to staging
- `main` - Production branch, deploys to production
- Feature branches should be created from `develop`

### Development Process

1. Create a feature branch from `develop`:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:

   ```bash
   git add .
   git commit -m "Description of your changes"
   git push origin feature/your-feature-name
   ```

3. Create a Pull Request to merge into `develop`
4. After review and approval, merge into `develop`
5. Changes will automatically deploy to staging

### Promoting to Production

There are two ways to deploy to production:

1. **Direct Push to Main**:

   - For urgent hotfixes only
   - Will trigger automatic production deployment

2. **Promote Staging to Production**:
   - Recommended approach for regular releases
   - Steps:
     1. Go to GitHub Actions
     2. Select "Deploy to Production" workflow
     3. Click "Run workflow"
     4. Select "main" branch
     5. Check "Promote staging build to production"
     6. Click "Run workflow"

### Environment Configuration

The app uses different base paths for staging and production:

- Staging: `/prompt-staging`
- Production: `/prompt`

Configuration is handled automatically by the deployment workflows.

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Submit a Pull Request to `develop`
4. After testing in staging, promote to production

## License

MIT License - See LICENSE file for details
