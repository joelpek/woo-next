import App from "next/app";
import React from "react";
import { AppProvider } from "../components/context/AppContext";
import { ApolloProvider } from "@apollo/client";
import { initializeApollo, withApollo } from "../components/ApolloClient";
import "../styles/Style.css";

class MyApp extends App<any> {
  render() {
    const { Component, pageProps } = this.props;
    const apolloClient = initializeApollo(pageProps.initialApolloState);
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

export async function getStaticProps(appContext) {
  const appProps = await App.getInitialProps(appContext);
  // console.log("appProps", { ...appProps });
  return { ...appProps };
}

export default withApollo(MyApp);
