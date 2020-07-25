import Error from "./Error";

// free_shipping:5
// flat_rate:6
// local_pickup:7

const ShippingModes = ({ input, handleOnChange }) => {
  return (
    <div className="mt-3">
      <Error errors={input.errors} fieldName={"shippingMethods"} />
      {/*Free shipping*/}
      <div className="form-check woo-next-shipping-input-container mt-2">
        <label className="form-check-label">
          <input
            onChange={handleOnChange}
            value="free_shipping:5"
            className="form-check-input"
            name="shippingMethods"
            type="radio"
          />
          <span className="woo-next-shipping-content">Free shipping</span>
        </label>
      </div>
      {/*Flat rate*/}
      <div className="form-check woo-next-shipping-input-container mt-2">
        <label className="form-check-label">
          <input
            onChange={handleOnChange}
            value="flat_rate:6"
            className="form-check-input"
            name="shippingMethods"
            type="radio"
          />
          <span className="woo-next-shipping-content">Flat rate</span>
        </label>
      </div>
      {/*Pickup*/}
      <div className="form-check woo-next-shipping-input-container mt-2">
        <label className="form-check-label">
          <input
            onChange={handleOnChange}
            value="local_pickup:7"
            className="form-check-input"
            name="shippingMethods"
            type="radio"
          />
          <span className="woo-next-shipping-content">Local pickup</span>
        </label>
      </div>
    </div>
  );
};

export default ShippingModes;
