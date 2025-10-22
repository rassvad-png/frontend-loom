import { gql } from '@apollo/client';

// Profile queries
export const GET_PROFILE = gql`
  query GetProfile($userId: uuid!) {
    profilesCollection(filter: { id: { eq: $userId } }) {
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

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($userId: uuid!, $updates: profilesUpdateInput!) {
    updateProfilesCollection(where: { id: { _eq: $userId } }, set: $updates) {
      affectedCount
      records {
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
`;

// Dev Account queries
export const GET_DEV_ACCOUNT = gql`
  query GetDevAccount($userId: uuid!) {
    dev_accountsCollection(filter: { user_id: { eq: $userId } }) {
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

export const CREATE_DEV_ACCOUNT = gql`
  mutation CreateDevAccount($devAccount: dev_accountsInsertInput!) {
    insertIntodev_accountsCollection(objects: [$devAccount]) {
      records {
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
`;

// Apps queries
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

export const GET_APP = gql`
  query GetApp($slug: String!) {
    appsCollection(filter: { slug: { eq: $slug } }) {
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

// App Translations queries
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

export const CREATE_APP_TRANSLATION = gql`
  mutation CreateAppTranslation($translation: app_translationsInsertInput!) {
    insertIntoapp_translationsCollection(objects: [$translation]) {
      records {
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
`;

export const UPDATE_APP_TRANSLATIONS = gql`
  mutation UpdateAppTranslations($appId: uuid!, $language: String!, $updates: app_translationsUpdateInput!) {
    updateApp_translationsCollection(where: { app_id: { _eq: $appId }, lang: { _eq: $language } }, set: $updates) {
      affectedCount
      records {
        id
        app_id
        lang
        tagline
        description
        whats_new
      }
    }
  }
`;

// Categories query
export const GET_CATEGORIES = gql`
  query GetCategories {
    categoriesCollection {
      edges {
        node {
          id
          slug
          name
        }
      }
    }
  }
`;

// Developer Apps queries
export const GET_DEVELOPER_APPS = gql`
  query GetDeveloperApps($devAccountId: uuid!) {
    appsCollection(filter: { dev_account_id: { eq: $devAccountId } }) {
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

// Analytics mutations
export const INCREMENT_VIEWS = gql`
  mutation IncrementViews($appId: uuid!) {
    increment_views(app_id: $appId) {
      views
    }
  }
`;

export const INCREMENT_INSTALLS = gql`
  mutation IncrementInstalls($appId: uuid!) {
    increment_installs(app_id: $appId) {
      installs
    }
  }
`;
