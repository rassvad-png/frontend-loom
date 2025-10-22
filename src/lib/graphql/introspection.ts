import { gql } from '@apollo/client';

// Introspection query to check available tables
export const INTROSPECTION_QUERY = gql`
  query IntrospectionQuery {
    __schema {
      queryType {
        fields {
          name
          type {
            name
            kind
          }
        }
      }
    }
  }
`;

// Test query to check if we can access any table
export const TEST_QUERY = gql`
  query TestQuery {
    __typename
  }
`;
