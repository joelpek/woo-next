import gql from "graphql-tag";

const GET_RTOKEN_QUERY = gql`
  {
    viewer {
      jwtRefreshToken
      id
      username
    }
  }
`;

export default GET_RTOKEN_QUERY;
