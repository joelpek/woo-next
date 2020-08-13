import Layout from "../components/Layout";
import React from "react";
import client from "../components/ApolloClient";
import GET_ACCOUNT from "../queries/get-account";

const Account = (props) => {
  const { account } = props;
  
  return (
    <Layout>
      <div className="container mt-5">
        <h2 className="mt-5 mb-4">My Account</h2>
        <hr />
        <ul className="account-links">
          <li>
            <a aria-hidden href="">Dashboard</a>
          </li>
          <li>
            <a aria-hidden href="">Orders</a>
          </li>
          <li>
            <a aria-hidden href="">Downloads</a>
          </li>
          <li>
            <a aria-hidden href="">Addresses</a>
          </li>
          <li>
            <a aria-hidden href="">Account details</a>
          </li>
          <li>
            <a aria-hidden href="">Logout</a>
          </li>
        </ul>
        <div className="container mt-5 mb-4">
          {/* {signedIn && <p>
            Hello {account.name} (not {account.name})? <a aria-hidden href="#">Log out</a>
            <br /> <br /> */}
            From your account dashboard you can view your recent orders, manage
            your shipping and billing addresses, and edit your password and
            account details.
          {/* </p>} */}
        </div>
        <form
          /* onSubmit={handleFormSubmit} */ className="woo-next-checkout-form"
        >
          <input value="input1" />
        </form>
      </div>
      <div className="container mt-5 mb-4">
        <p>{JSON.stringify(account, null, 4)}</p>
      </div>
    </Layout>
  );
};

Account.getInitialProps = async () => {
  const result = await client.query({
    query: GET_ACCOUNT,
  });
  return {
    account: result.data.customer,
  };
};

export default Account;
