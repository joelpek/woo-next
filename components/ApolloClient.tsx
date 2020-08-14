import React from "react";
import Head from "next/head";
import { ApolloClient } from "apollo-client";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import fetch from "isomorphic-unfetch";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import jwtDecode from "jwt-decode";
import wooConfig from "../wooConfig";
import { getAccessToken, setAccessToken } from "./accessToken";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
import cookie from "cookie";
import { v4 } from "uuid";
import GET_RTOKEN_QUERY from "../queries/get-refresh-token";

import { IntrospectionFragmentMatcher } from "apollo-cache-inmemory";

import introspectionQueryResultData from "../fragmentTypes.json";


// Fragment matcher.
const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
});

const isServer = () => typeof window === "undefined";

let getRefreshToken = async () => {
  // headers.get("X-JWT-Refresh");
  await fetch("", {
    method: "POST",
    body: JSON.stringify({
      query: GET_RTOKEN_QUERY,
    }),
    // credentials: "include",
    // headers: {
    //   cookie: ``,
    // },
  });
};

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 * @param {Function|Class} PageComponent
 * @param {Object} [config]
 * @param {Boolean} [config.ssr=true]
 */
export function withApollo(PageComponent: any, { ssr = true } = {}) {
  const WithApollo = ({
    apolloClient,
    serverAccessToken,
    apolloState,
    ...pageProps
  }: any) => {
    if (!isServer() && !getAccessToken()) {
      setAccessToken(serverAccessToken);
    }
    const client = apolloClient || initApolloClient(apolloState);
    return <PageComponent {...pageProps} apolloClient={client} />;
  };

  if (process.env.NODE_ENV !== "production") {
    // Find correct display name
    const displayName =
      PageComponent.displayName || PageComponent.name || "Component";

    // Warn if old way of installing apollo is used
    if (displayName === "App") {
      console.warn("This withApollo HOC only works with PageComponents.");
    }

    // Set correct display name for devtools
    WithApollo.displayName = `withApollo(${displayName})`;
  }

  if (ssr || PageComponent.getInitialProps) {
    WithApollo.getInitialProps = async (ctx: any) => {
      const {
        AppTree,
        ctx: { req, res },
      } = ctx;

      let serverAccessToken = "";

      if (isServer()) {
        console.log("hi from server");

        // const cookies = cookie.parse(req.headers.cookie);
        // console.log(req);

        // if (cookies.authentication) {
        //   // const response = await fetch("http://localhost:4000/refresh_token", {
        //   //   method: "POST",
        //   //   credentials: "include",
        //   //   headers: {
        //   //     cookie: "jid=" + cookies.jid,
        //   //   },
        //   // });

        //   const response = await fetch("URL", {
        //     method: "POST",
        //     credentials: "include",
        //     headers: {
        //       cookie: `Bearer ${getRefreshToken()}`,
        //     },
        //   });
        //   const data = await response.json();
        //   serverAccessToken = data.accessToken;
        // }
      }

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      const apolloClient = (ctx.ctx.apolloClient = initApolloClient(
        {},
        serverAccessToken
      ));

      const pageProps = PageComponent.getInitialProps
        ? await PageComponent.getInitialProps(ctx)
        : {};

      // Only on the server
      if (typeof window === "undefined") {
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (res && res.finished) {
          return {};
        }

        if (ssr) {
          try {
            // Run all GraphQL queries
            const { getDataFromTree } = await import("@apollo/react-ssr");
            await getDataFromTree(
              <AppTree
                pageProps={{
                  ...pageProps,
                  apolloClient,
                }}
                apolloClient={apolloClient}
              />
            );
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error("Error while running `getDataFromTree`", error);
          }
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();
      }

      // Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract();

      return {
        ...pageProps,
        apolloState,
        serverAccessToken,
      };
    };
  }

  return WithApollo;
}

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 */
function initApolloClient(initState: any, serverAccessToken?: string) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (isServer()) {
    return createApolloClient(initState, serverAccessToken);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    // setAccessToken(cookie.parse(document.cookie).test);
    apolloClient = createApolloClient(initState);
  }

  return apolloClient;
}

/**
 * Creates and configures the ApolloClient
 * @param  {Object} [initialState={}]
 * @param  {Object} config
 */
export function createApolloClient(
  initialState = {},
  serverAccessToken?: string
) {
  const httpLink = new HttpLink({
    uri: wooConfig.graphqlUrl,
    // credentials: "include",
    fetch,
  });

  const refreshLink = new TokenRefreshLink({
    accessTokenField: "accessToken",
    isTokenValidOrUndefined: () => {
      const token = getAccessToken();

      if (!token) {
        return true;
      }

      try {
        const { exp } = jwtDecode(token);
        if (Date.now() >= exp * 1000) {
          return false;
        } else {
          return true;
        }
      } catch {
        return false;
      }
    },
    fetchAccessToken: async () => {
      // TODO: fix
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Access-Control-Allow-Origin", "null");
      myHeaders.append("Authorization", "wp_woocommerce_session_f2cd03fd35f7b44f3a9e8109f5055d3a=6e1478153ee13b985181f532d7fdd0b6%7C%7C1597511573%7C%7C1597507973%7C%7C8b79092fedc38caca49be9873f85030a");
      
      var graphql = JSON.stringify({
        query: `mutation MyMutation {
          __typename
          refreshJwtAuthToken(input: {clientMutationId: ${v4()}, jwtRefreshToken: ${refreshToken}}) { 
            authToken
          }
        }`,
        variables: {}
      })

      let fetchResult = await fetch("https://store.epro.dev/graphql", {
        method: 'POST',
        headers: myHeaders,
        body: graphql,
        redirect: 'follow'
      })
      
        // .then(response => response.text())
        // .then(result => console.log(result))
        // .catch(error => console.log('error', error));



      // let refreshToken = getRefreshToken();
      // const fetchResult = await fetch(wooConfig.graphqlUrl, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     query: `
      //       mutation MyMutation {
      //         __typename
      //         refreshJwtAuthToken(input: {clientMutationId: ${v4()}, jwtRefreshToken: ${refreshToken}}) { 
      //           authToken
      //         }
      //       }
      //     `,
      //   }),
      // });
      const refreshResponse = await fetchResult.json();
      console.log("refRes1", refreshResponse);
      return refreshResponse["data"]["authToken"];
    },
    handleFetch: (accessToken) => {
      setAccessToken(accessToken);
    },
    handleError: (err) => {
      console.warn("Your refresh token is invalid. Try to relogin");
      // console.error(err);
    },
  });

  const authLink = setContext((_request, { headers }) => {
    const token = isServer() ? serverAccessToken : getAccessToken();
    return {
      headers: {
        ...headers,
        authorization: token ? `bearer ${token}` : "",
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    // console.log(graphQLErrors);
    // console.log(networkError);
  });

  return new ApolloClient({
    ssrMode: typeof window === "undefined", // Disables forceFetch on the server (so queries are only run once)
    link: ApolloLink.from([refreshLink, authLink, errorLink, httpLink]),
    cache: new InMemoryCache({ fragmentMatcher }).restore(initialState)
  });
}

export default createApolloClient();
