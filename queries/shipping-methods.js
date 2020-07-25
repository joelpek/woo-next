import gql from "graphql-tag";

const SHIPPING_QUERY = gql` query Product() {
	{
		shippingMethods {
		  edges {
			node {
			  id
			}
		  }
		}
	  }
`;

export default SHIPPING_QUERY;
