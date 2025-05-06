import { gql } from '@apollo/client';
import { POST_FRAGMENT, PROFILE_FRAGMENT } from './queries';

// Mutation to create a post
export const CREATE_POST = gql`
  mutation CreatePost($title: String!, $body: String!, $published: Boolean = true, $user_id: UUID!) {
    insertIntopostsCollection(
      objects: [{ title: $title, body: $body, published: $published, user_id: $user_id }]
    ) {
      records {
        ...PostFields
      }
    }
  }
  ${POST_FRAGMENT}
`;

// Mutation to update a post
export const UPDATE_POST = gql`
  mutation UpdatePost($id: UUID!, $title: String!, $body: String!, $published: Boolean) {
    updatepostsCollection(
      set: { title: $title, body: $body, published: $published }
      filter: { id: { eq: $id } }
    ) {
      records {
        ...PostFields
      }
    }
  }
  ${POST_FRAGMENT}
`;

// Mutation to delete a post
export const DELETE_POST = gql`
  mutation DeletePost($id: UUID!) {
    deleteFrompostsCollection(filter: { id: { eq: $id } }) {
      records {
        id
      }
    }
  }
`;

// Mutation to update a profile
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $id: UUID!,
    $display_name: String,
    $username: String,
    $bio: String,
    $website: String,
    $avatar_url: String
  ) {
    updateprofilesCollection(
      set: {
        display_name: $display_name,
        username: $username,
        bio: $bio,
        website: $website,
        avatar_url: $avatar_url
      }
      filter: { id: { eq: $id } }
    ) {
      records {
        ...ProfileFields
      }
    }
  }
  ${PROFILE_FRAGMENT}
`;