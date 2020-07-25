import Error from "./Error";

const PaymentModes = ( { input, handleOnChange } ) => {
	return (
		<div className="mt-3">
			<Error errors={ input.errors } fieldName={ 'paymentMethod' }/>
			{/*Direct bank transfers*/}
			<div className="form-check woo-next-payment-input-container mt-2">
				<label className="form-check-label">
					<input onChange={ handleOnChange } value="bacs" className="form-check-input" name="paymentMethod" type="radio"/>
					<span className="woo-next-payment-content">Direct Bank Transfer</span>
				</label>
			</div>
			{/*Pay with Paypal*/}
			<div className="form-check woo-next-payment-input-container mt-2">
				<label className="form-check-label">
					<input onChange={ handleOnChange } value="paypal" className="form-check-input" name="paymentMethod" type="radio"/>
					<span className="woo-next-payment-content">Pay with Paypal</span>
				</label>
			</div>
			{/*Pay with Stripe*/}
			<div className="form-check woo-next-payment-input-container mt-2">
				<label className="form-check-label">
					<input onChange={ handleOnChange } value="cod" className="form-check-input" name="paymentMethod" type="radio"/>
					<span className="woo-next-payment-content">Cash on Delivery</span>
				</label>
			</div>
		</div>
	);
};

export default PaymentModes;
