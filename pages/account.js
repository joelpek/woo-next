import Layout from "../components/Layout";

import React from "react";
import client from "../components/ApolloClient";
import GET_ACCOUNT from "../queries/get-account";

const Account = (props) => {
  const { account } = props;
  return (
    <Layout>
      <div>
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
