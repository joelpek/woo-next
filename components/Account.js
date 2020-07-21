import Layout from "../components/Layout";
import client from '../components/ApolloClient';
// import ParentAccountBlock from "../components/category/category-block/ParentAccountBlock";
// import GET_CATEGORIES_QUERY from "../queries/get-categories";

const Account = ( props ) => {

	const { account } = props;

	return (
		<Layout>
			{/*Account*/}
			<div className="mt-5 text-center content-wrap">
				<h2>Account</h2>
				{/* <ParentAccountBlock account={ account }/> */}
			</div>
		</Layout>
	)
};

Account.getInitialProps = async () => {

	const result = await client.query({
		// query: GET_CATEGORIES_QUERY,
	});

	return {
		account: result.data.account,
	}

};

export default Account;
