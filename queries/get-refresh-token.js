// import { gql } from "@apollo/client";

const GET_RTOKEN_QUERY = `
  {
    viewer {
      jwtRefreshToken
      id
      username
    }
  }
`;

export default GET_RTOKEN_QUERY;
