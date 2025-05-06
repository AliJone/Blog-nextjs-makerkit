import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment UserFields on profiles {
    id
    username
    display_name
    avatar_url
  }
`;

export const PROFILE_FRAGMENT = gql`
  fragment ProfileFields on profiles {
    id
    username
    display_name
    avatar_url
    bio
    website
    created_at
  }
`;

export const POST_FRAGMENT = gql`
  fragment PostFields on posts {
    id
    title
    body
    created_at
    updated_at
    published
    user_id
    profile_id
    user {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;