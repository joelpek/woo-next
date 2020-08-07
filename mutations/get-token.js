import gql from "graphql-tag";

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
