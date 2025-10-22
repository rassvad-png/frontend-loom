import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// HTTP link to Supabase GraphQL endpoint
const httpLink = createHttpLink({
  uri: 'https://fszhfeqijasvplmdihyj.supabase.co/graphql/v1',
});

// Auth link to add headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from localStorage if it exists
  const authData = localStorage.getItem('sb-fszhfeqijasvplmdihyj-auth-token');
  let token = '';
  
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      token = parsed.access_token || '';
    } catch (e) {
      console.error('Error parsing auth token:', e);
    }
  }
  
  return {
    headers: {
      ...headers,
      apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzemhmZXFpamFzdnBsbWRpaHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzA0OTcsImV4cCI6MjA3NTQwNjQ5N30.tQuCPZP4M4p3kVJk6YCT-oRDZf_ERvqWxun06fFnuOY',
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          profiles: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          app_translations: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
