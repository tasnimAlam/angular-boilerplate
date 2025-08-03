export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com',
  apiEndpoints: {
    auth: {
      login: '/api/token/',
      refresh: '/api/token/refresh/',
      logout: '/api/auth/logout/'
    }
  },
  app: {
    name: 'Angular Boilerplate',
    version: '1.0.0'
  },
  features: {
    devTools: false,
    persistence: true,
    logging: false
  }
};