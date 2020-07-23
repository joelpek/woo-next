import Head from "next/head";
import { AppProvider } from "./context/AppContext";
import Header from "./Header";
import Footer from "./Footer";
import "../styles/Style.css";
import client from "./ApolloClient";
import { ApolloProvider } from "react-apollo";
import { ApolloProvider as ApolloHooksProvider } from "@apollo/react-hooks";

const Layout = (props) => {
  return (
    <AppProvider>
      <ApolloProvider client={client}>
        <ApolloHooksProvider client={client}>
          <div>
            <Head>
              <title>ePro Consulting - IT insight on demand</title>
              <link
                rel="stylesheet"
                href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
              />
              <link
                rel="stylesheet"
                href="https://bootswatch.com/4/slate/bootstrap.min.css"
              />
              <link
                rel="apple-touch-icon"
                sizes="180x180"
                href="/apple-touch-icon.png"
              />
              <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href="/favicon-32x32.png"
              />
              <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href="/favicon-16x16.png"
              />
              <link rel="manifest" href="/site.webmanifest" />
              <meta name="msapplication-config" content="/browserconfig.xml" />
              <meta name="msapplication-TileColor" content="#ffffff" />
              <meta name="theme-color" content="#ffffff" />
            </Head>
            <div id="page-container">
              <div id="content-wrap">
                <Header />
                {props.children}
                <Footer />
              </div>
            </div>
          </div>
        </ApolloHooksProvider>
      </ApolloProvider>
    </AppProvider>
  );
};

export default Layout;
