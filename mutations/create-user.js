import { gql } from "@apollo/client";

const CREATE_USER_MUTATION = gql`
  mutation ($input: RegisterUserInput!) {
    registerUser(input: $input) {
      user {
        jwtAuthToken
        jwtRefreshToken
      }
    }
  }
`;

export default CREATE_USER_MUTATION;
