import { gql } from "@apollo/client";

const SHIPPING_MUTATION = gql`
  mutation SHIPPING_MUTATION($input: UpdateShippingMethodInput!) {
    updateShippingMethod(input: $input) {
      cart {
        availableShippingMethods {
          packageDetails
          supportsShippingCalculator
          rates {
            id
            cost
            label
          }
        }
        chosenShippingMethod
        shippingTotal
        shippingTax
        subtotal
        subtotalTax
        total
      }
    }
  }
`;

export default SHIPPING_MUTATION;
