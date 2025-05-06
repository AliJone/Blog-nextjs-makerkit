import { gql } from '@apollo/client';
import { PROFILE_FRAGMENT } from '../fragments';

export const UPDATE_PROFILE = gql`
  ${PROFILE_FRAGMENT}
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
`;

export const DELETE_PROFILE = gql`
  mutation DeleteProfile($profile_id: UUID!) {
    deleteFromprofilesCollection(filter: { profile_id: { eq: $profile_id } }) {
      affectedCount
      records {
        id
      }
    }
  }
`;