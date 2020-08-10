import { useMutation, useQuery } from "@apollo/react-hooks";
import SHIPPING_QUERY from "../../queries/shipping-methods";
// import { getShippingInfo, createCheckoutData } from "../../functions";

const [shipping, setShipping] = useContext(AppContext);

const { loading, error, data, refetch } = useQuery(SHIPPING_QUERY, {
  notifyOnNetworkStatusChange: true,
  onCompleted: () => {
    // Update shipping in the localStorage.
    /*console.log((data);*/
    //   const updatedShipping = getFormattedShipping(data);
    // localStorage.setItem("woo-next-shipping", JSON.stringify(updatedShipping));

    // Update shipping data in React Context.
    // setShipping(updatedShipping);
  },
});
