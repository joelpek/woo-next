import Layout from "../components/Layout";
import CheckoutForm from "../components/checkout/CheckoutForm";

const Checkout = () => (
	<Layout>
		<div className="container mt-5">
			<h2 className="mt-5 mb-4">Checkout</h2>
			<hr/>
			<CheckoutForm/>
		</div>
	</Layout>
);

export default Checkout;
