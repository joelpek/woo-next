import { gql } from "@apollo/client";

const GET_TOKEN_MUTATION = gql`
mutation getNewToken($cMId: String!, $jRT: String!) {
  __typename
  refreshJwtAuthToken(input: {clientMutationId: $cMId, jwtRefreshToken: $jRT}) {
    authToken
    clientMutationId
  }
}
`;

export default GET_TOKEN_MUTATION;
