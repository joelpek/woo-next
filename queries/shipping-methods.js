import { gql } from "@apollo/client";

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
