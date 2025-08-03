export const environment = {
  production: false,
  apiUrl: 'https://staging-api.your-domain.com',
  apiEndpoints: {
    auth: {
      login: '/api/token/',
      refresh: '/api/token/refresh/',
      logout: '/api/auth/logout/'
    }
  },
  app: {
    name: 'Angular Boilerplate (Staging)',
    version: '1.0.0'
  },
  features: {
    devTools: true,
    persistence: true,
    logging: true
  }
};