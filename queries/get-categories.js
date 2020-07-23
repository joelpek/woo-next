import gql from "graphql-tag";

/**
 * GraphQL categories query.
 */
const GET_CATEGORIES_QUERY = gql`
  query {
    productCategories {
      nodes {
        id
        name
        slug
        image {
          sourceUrl
          srcSet
        }
      }
    }
  }
`;

export default GET_CATEGORIES_QUERY;
