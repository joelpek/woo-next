import App from "next/app";
import React from "react";
import { AppProvider } from "../components/context/AppContext";
import { ApolloProvider } from "@apollo/react-hooks";
import { withApollo } from "../components/1ApolloClient";
import "../styles/Style.css";

class MyApp extends App<any> {
  render() {
    const { Component, pageProps, apolloClient } = this.props;
    // console.log(this.props);
    return (
      <ApolloProvider client={apolloClient}>
        <AppProvider>
          <Component {...pageProps} />
        </AppProvider>
      </ApolloProvider>
    );
  }
}

MyApp.getInitialProps = async (appContext) => {
  console.log(appContext);
  const appProps = await App.getInitialProps(appContext);
  console.log({ ...appProps });
  return { ...appProps };
};

export default withApollo(MyApp);
