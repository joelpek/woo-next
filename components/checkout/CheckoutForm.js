import { useState, useContext, useEffect } from "react";
import { v4 } from "uuid";
import Billing from "./Billing";
import YourOrder from "./YourOrder";
import PaymentModes from "./PaymentModes";
import ShippingModes from "./ShippingModes";
import { AppContext } from "../context/AppContext";
import validateAndSanitizeCheckoutForm from "../../validator/checkout";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { getFormattedCart, createCheckoutData } from "../../functions";
import OrderSuccess from "./OrderSuccess";
import ShippingSuccess from "./ShippingSuccess";
import GET_CART from "../../queries/get-cart";
import CHECKOUT_MUTATION from "../../mutations/checkout";
import SHIPPING_MUTATION from "../../mutations/update-shipping";

const CheckoutForm = () => {
    const initialState = {
      firstName: "",
      lastName: "",
      company: "",
      country: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postcode: "",
      phone: "",
      email: "",
      createAccount: false,
      orderNotes: "",
      paymentMethod: "",
      shippingMethod: "",
      errors: null,
    };

  //   Use this for testing purposes, so you dont have to fill the checkout form over an over again.
  // const initialState = {
  //   firstName: "Imran",
  //   lastName: "Sayed",
  //   address1: "109 Hills Road Valley",
  //   address2: "Station Road",
  //   city: "Pune",
  //   state: "Maharastra",
  //   country: "ID",
  //   postcode: "400298",
  //   phone: "9959338989",
  //   email: "imran@gmail.com",
  //   company: "Tech",
  //   createAccount: false,
  //   orderNotes: "",
  //   paymentMethod: "",
  //   shippingMethod: "",
  //   errors: null,
  // };

  const [cart, setCart] = useContext(AppContext);
  const [input, setInput] = useState(initialState);
  const [orderData, setOrderData] = useState(null);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [requestError, setRequestError] = useState(null);

  // Get Cart Data.
  const { loading, error, data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      // console.warn( 'completed GET_CART' );

      // Update cart in the localStorage.
      const updatedCart = getFormattedCart(data);
      localStorage.setItem("woo-next-cart", JSON.stringify(updatedCart));
      //   console.log(updatedCart);
      // Update cart data in React Context.
      setCart(updatedCart);
    },
  });

  // Checkout or CreateOrder Mutation.
  const [
    checkout,
    { data: checkoutResponse, loading: checkoutLoading, error: checkoutError },
  ] = useMutation(CHECKOUT_MUTATION, {
    variables: {
      input: orderData,
    },
    onCompleted: () => {
      // console.warn( 'completed CHECKOUT_MUTATION' );
      refetch();
    },
    onError: (error) => {
      if (error) {
        setRequestError(error.graphQLErrors[0].message);
      }
    },
  });

  let shippingMethodsExist = false;

  //   Shipping Mutation.
  const [
    shipping,
    { data: shippingResponse, loading: shippingLoading, error: shippingError },
  ] = useMutation(SHIPPING_MUTATION, {
    variables: {
      input: {
        clientMutationId: v4(),
        shippingMethods: input.shippingMethod,
      },
    },
    onCompleted: () => {
      console.log("shippingResponse", data);
      if (data.cart.availableShippingMethods.length > 0) {
        let availableShippingMethods = data.cart.availableShippingMethods[0].rates.map(
          (x) => x.id
        );
        setShippingMethods(availableShippingMethods);
      }else {
        setShippingMethods([])
      }
      // refetch();
    },
    onError: (error) => {
      if (error) {
        console.log(error);
        debugger;
      }
    },
  });

  /*
   * Handle form submit.
   *
   * @param {Object} event Event Object.
   *
   * @return {void}
   */
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const result = validateAndSanitizeCheckoutForm(input);
    if (!result.isValid) {
      setInput({ ...input, errors: result.errors });
      return;
    }
    const checkOutData = createCheckoutData(input);
    setOrderData(checkOutData);
    setRequestError(null);
  };

  /*
   * Handle onchange input.
   *
   * @param {Object} event Event Object.
   *
   * @return {void}
   */
  const handleOnChange = (event) => {
    // console.log(event);
    if ("createAccount" === event.target.name) {
      const newState = { ...input, [event.target.name]: !input.createAccount };
      setInput(newState);
    } else if ("shippingMethods" === event.target.name) {
      console.log("shippingMethods", input.shippingMethod);
      const newState = { ...input, [event.target.name]: event.target.value };
      setInput(newState);
      console.log("STATE shippingMethods", newState.shippingMethods);
      shipping();
    } else {
      console.log(event.target.name, event.target.value);
      const newState = { ...input, [event.target.name]: event.target.value };
      setInput(newState);
    }
  };

  useEffect(() => {
    if (null !== orderData) {
      // Call the checkout mutation when the value for orderData changes/updates.
      checkout();
      //   console.log(checkoutResponse);
    }
  }, [orderData]);

  // on component mount: check if shipping available and display options
  useEffect(() => {
    shipping();
  }, []);

  return (
    <>
      {cart ? (
        <form onSubmit={handleFormSubmit} className="woo-next-checkout-form">
          <div className="row">
            {/*Billing Details*/}
            <div className="col-lg-6 col-md-12 p-0 pr-2">
              <h2 className="mb-4">Billing Details</h2>
              <Billing input={input} handleOnChange={handleOnChange} />
            </div>
            {/* Order & Payments*/}
            <div className="col-lg-6 col-md-12">
              {/*	Order*/}
              <h2 className="mb-4">Your Order</h2>
              <YourOrder cart={cart} />
              {/*Shipping*/}
              {shippingMethods.length > 0 && (
                <div className="shippingMethods">
                  <h2 className="mb-4">Shipping Method</h2>
                  <ShippingModes
                    id="shippingMethods"
                    input={input}
                    handleOnChange={handleOnChange}
                  />
                </div>
              )}
              <div className="paymentMethod">
                {/*Payment*/}
                <h2 className="mb-4">Payment Method</h2>
                <PaymentModes input={input} handleOnChange={handleOnChange} />
                <div className="woo-next-place-order-btn-wrap mt-5">
                  <button
                    className="btn woo-next-large-black-btn woo-next-place-order-btn btn-secondary"
                    type="submit"
                  >
                    Place Order
                  </button>
                </div>
              </div>

              {/* Checkout or Shipping Update Loading*/}
              {(checkoutLoading || shippingLoading) && (
                <p>Processing Order...</p>
              )}
              {requestError && (
                <p>
                  Error : {requestError} 😕 Please select another shipping
                  method.
                </p>
              )}
              {shippingError && (
                <p>Error : {shippingError} 😕 Please check the form.</p>
              )}
            </div>
          </div>
        </form>
      ) : (
        ""
      )}

      <div>
        {/*	Show message if Order Success*/}
        <ShippingSuccess response={shippingResponse} />
      </div>
      <div>
        <OrderSuccess response={checkoutResponse} />
      </div>
    </>
  );
};

export default CheckoutForm;
