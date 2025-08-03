export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
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
    devTools: true,
    persistence: true,
    logging: true
  }
};