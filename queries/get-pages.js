import gql from "graphql-tag";

const GET_PAGES = gql`
  query GET_PAGES {
    pages {
      nodes {
        id
        content
        pageId
        slug
        title
      }
    }
  }
`;

export default GET_PAGES;
