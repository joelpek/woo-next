import { gql } from "@apollo/client";

const GET_ACCOUNT = gql`
  {
    customer {
      id
      firstName
      displayName
      email
      downloadableItems {
        nodes {
          accessExpires
          downloadsRemaining
          name
          url
        }
      }
      username
      shipping {
        address1
        address2
        city
        company
        country
        email
        firstName
        lastName
        phone
        postcode
        state
      }
      orders {
        edges {
          node {
            id
          }
        }
      }
      orderCount
      lastName
    }
  }
`;

export default GET_ACCOUNT;
