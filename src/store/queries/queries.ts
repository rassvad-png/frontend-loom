import { gql } from '@apollo/client';

// Profile queries - single record by ID (most efficient for Supabase)
export const GET_PROFILE = gql`
  query GetProfile($userId: uuid!) {
    profilesCollection(filter: { id: { eq: $userId } }, first: 1) {
      edges {
        node {
          id
          first_name
          last_name
          birth_date
          display_name
          avatar
          favorite_categories
          country
          language
        }
      }
    }
  }
`;

// Dev Account queries - single record by user_id (most efficient for Supabase)
export const GET_DEV_ACCOUNT = gql`
  query GetDevAccount($userId: uuid!) {
    dev_accountsCollection(filter: { user_id: { eq: $userId } }, first: 1) {
      edges {
        node {
          id
          user_id
          org_name
          website
          contact_email
          github_url
          legal_address
          tax_identifier
          phone
          status
          created_at
        }
      }
    }
  }
`;

// Apps queries - for collections/lists
export const GET_APPS = gql`
  query GetApps($limit: Int) {
    appsCollection(first: $limit, orderBy: { created_at: DescNullsLast }) {
      edges {
        node {
          id
          slug
          name
          icon_url
          categories
          rating
          installs
          screenshots
          install_url
          verified
        }
      }
    }
  }
`;

// Single App query - optimized for one app
export const GET_APP = gql`
  query GetApp($slug: String!) {
    appsCollection(filter: { slug: { eq: $slug } }, first: 1) {
      edges {
        node {
          id
          slug
          name
          icon_url
          categories
          rating
          installs
          screenshots
          install_url
          verified
        }
      }
    }
  }
`;

// App Translations queries - for collections/lists
export const GET_APP_TRANSLATIONS = gql`
  query GetAppTranslations($appIds: [uuid!]!, $language: String!) {
    app_translationsCollection(filter: { app_id: { in: $appIds }, lang: { eq: $language } }) {
      edges {
        node {
          id
          app_id
          lang
          tagline
          description
          whats_new
          created_at
          updated_at
        }
      }
    }
  }
`;

// Categories query - for collections/lists
export const GET_CATEGORIES = gql`
  query GetCategories {
    categoriesCollection {
      edges {
        node {
          id
          slug
        }
      }
    }
  }
`;

// Developer Apps queries - optimized for specific dev account
export const GET_DEVELOPER_APPS = gql`
  query GetDeveloperApps($devAccountId: uuid!) {
    appsCollection(filter: { dev_account_id: { eq: $devAccountId } }, orderBy: { created_at: DescNullsLast }) {
      edges {
        node {
          id
          slug
          name
          icon_url
          rating
          installs
          categories
          verified
        }
      }
    }
  }
`;
