# Environment Configuration

This project uses Angular environment files for configuration management across different deployment stages.

## Environment Files

- `src/environments/environment.ts` - Development (default)
- `src/environments/environment.prod.ts` - Production  
- `src/environments/environment.staging.ts` - Staging

## Configuration Structure

```typescript
export const environment = {
  production: boolean,
  apiUrl: string,
  apiEndpoints: {
    auth: {
      login: string,
      refresh: string,
      logout: string
    }
  },
  app: {
    name: string,
    version: string
  },
  features: {
    devTools: boolean,
    persistence: boolean,
    logging: boolean
  }
};
```

## Available Scripts

```bash
# Development
npm start                 # Run dev server with development config
npm run build             # Build with development config

# Staging  
npm run start:staging     # Run dev server with staging config
npm run build:staging     # Build with staging config

# Production
npm run start:prod        # Run dev server with production config  
npm run build:prod        # Build with production config
```

## Usage in Code

### Direct Import
```typescript
import { environment } from '../environments/environment';

// Use environment variables
const apiUrl = environment.apiUrl;
const isProduction = environment.production;
```

### Environment Service
```typescript
import { EnvironmentService } from './core/services/environment.service';

constructor(private env: EnvironmentService) {}

// Use service methods
const apiUrl = this.env.getApiUrl('/api/users');
const isDevToolsEnabled = this.env.isFeatureEnabled('devTools');
```

## Environment Variables

### Development
- API URL: `http://localhost:8000`
- DevTools: Enabled
- Logging: Enabled
- Persistence: Enabled

### Staging  
- API URL: `https://staging-api.your-domain.com`
- DevTools: Enabled
- Logging: Enabled
- Persistence: Enabled

### Production
- API URL: `https://your-api-domain.com`
- DevTools: Disabled
- Logging: Disabled  
- Persistence: Enabled

## Customization

1. Update the API URLs in each environment file to match your backend
2. Add new configuration properties as needed
3. Use the EnvironmentService for type-safe access to environment variables
4. Environment-specific features (logging, devTools) are automatically configured

## Security Notes

- Never commit sensitive data like API keys to environment files
- Use server-side environment variables for secrets in production
- Environment files are bundled into the application and visible to users