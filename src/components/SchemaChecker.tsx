import { useQuery } from '@apollo/client/react';
import { INTROSPECTION_QUERY } from '@/lib/graphql/introspection';

export const SchemaChecker = () => {
  const { data, loading, error } = useQuery(INTROSPECTION_QUERY);

  if (loading) return <div>Loading schema...</div>;
  if (error) {
    console.error('Schema error:', error);
    return <div>Error: {error.message}</div>;
  }

  console.log('Available tables:', data?.__schema?.queryType?.fields);

  return (
    <div>
      <h3>Available GraphQL Tables:</h3>
      <pre>{JSON.stringify(data?.__schema?.queryType?.fields, null, 2)}</pre>
    </div>
  );
};
