import { useQuery } from "@apollo/client";
import SHIPPING_QUERY from "../../queries/shipping-methods";
// import { getShippingInfo, createCheckoutData } from "../../functions";

const [, setShipping] = useContext(AppContext);

const { loading, error, data } = useQuery(SHIPPING_QUERY, {
  notifyOnNetworkStatusChange: true,
  onCompleted: () => {
    // Update shipping in the localStorage.
    // console.log(data);
    const updatedShipping = getFormattedShipping(data);
    localStorage.setItem("woo-next-shipping", JSON.stringify(updatedShipping));

    // Update shipping data in React Context.
    setShipping(updatedShipping);
  },
});
