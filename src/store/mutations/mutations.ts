import { gql } from '@apollo/client';

// Profile mutations
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($userId: uuid!, $updates: profilesUpdateInput!) {
    updateprofilesCollection(filter: { id: { eq: $userId } }, set: $updates) {
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

// Dev Account mutations
export const CREATE_DEV_ACCOUNT = gql`
  mutation CreateDevAccount($devAccount: dev_accountsInsertInput!) {
    insertIntodev_accountsCollection(objects: [$devAccount]) {
      records {
        id
        user_id
        org_name
        slug
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

// App Translations mutations
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
    updateapp_translationsCollection(filter: { app_id: { eq: $appId }, lang: { eq: $language } }, set: $updates) {
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

// App mutations
export const CREATE_APP = gql`
  mutation CreateApp($app: appsInsertInput!) {
    insertIntoappsCollection(objects: [$app]) {
      records {
        id
        slug
        name
        icon_url
        categories
        screenshots
        url
        install_url
        verified
        dev_account_id
        created_at
      }
    }
  }
`;

export const UPDATE_APP = gql`
  mutation UpdateApp($appId: uuid!, $updates: appsUpdateInput!) {
    updateappsCollection(filter: { id: { eq: $appId } }, set: $updates) {
      affectedCount
      records {
        id
        slug
        name
        icon_url
        categories
        screenshots
        url
        install_url
        verified
      }
    }
  }
`;

export const DELETE_APP = gql`
  mutation DeleteApp($appId: uuid!) {
    deleteFromappsCollection(filter: { id: { eq: $appId } }) {
      affectedCount
    }
  }
`;

export const CHECK_APP_SLUG = gql`
  query CheckAppSlug($slug: String!) {
    appsCollection(filter: { slug: { eq: $slug } }, first: 1) {
      edges {
        node {
          id
        }
      }
    }
  }
`;
