import { gql } from '@apollo/client';
import { PROFILE_FRAGMENT } from '../fragments';

export const GET_PROFILE = gql`
  ${PROFILE_FRAGMENT}
  query GetProfile($id: UUID!) {
    profilesCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          ...ProfileFields
        }
      }
    }
  }
`;

export const GET_PROFILES = gql`
  ${PROFILE_FRAGMENT}
  query GetProfiles($first: Int) {
    profilesCollection(first: $first) {
      edges {
        node {
          ...ProfileFields
        }
      }
    }
  }
`;