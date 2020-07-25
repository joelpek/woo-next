const ShippingSuccess = ( props ) => {

	const { response } = props;

	if ( ! response ) {
		return null;
	}

	const responseData = response;

	// window.location.href = responseData;

	return (
		<div className="container">
			{ 'success' === responseData.result ? (
				<div>
					<h2>Shipping method: { responseData.chosenShippingMethod } </h2>
					<p>Status : { responseData.order.status }</p>
				</div>
			): ''}
		</div>
	)
};

export default ShippingSuccess;
