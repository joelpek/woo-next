import React from "react";
import Head from "next/head";
import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import fetch from "isomorphic-unfetch";
import jwtDecode from "jwt-decode";
import { graphqlUrl } from "../wooConfig";
import { getAccessToken, setAccessToken } from "./accessToken";
import { v4 } from "uuid";
import cookie from "cookie";
import { useMemo } from "react";

const isServer = () => typeof window === "undefined";
let tokens = {};

let jwtRefreshToken =
  isServer() || !localStorage
    ? ""
    :
  JSON.stringify(localStorage.getItem("refresh"));

// TODO: implement server-side in-memory ONLY storage of authtoken (client should only get access to refreshtoken stored in localstorage under key "jwtRefreshToken")
let getNewAuthToken = async () => {
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let graphql = JSON.stringify({
    query: `
      mutation {
        refreshJwtAuthToken(input: {
          clientMutationId: ${JSON.stringify(v4())}, 
          jwtRefreshToken: ${jwtRefreshToken}
        }) {
          authToken
        }
      }
    `,
  });

  const fetchResult = await fetch(graphqlUrl, {
    method: "POST",
    headers: myHeaders,
    body: graphql,
  });

  // Your response to manipulate
  const refreshResponse = await fetchResult.json();
  // TODO: RMVINPROD
  // console.log("getNewAuthTokenResponse", refreshResponse);
  setAccessToken(refreshResponse.data.refreshJwtAuthToken.authToken);
  return getAccessToken();
};

let createTempUser = async () => {
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let cMId = JSON.stringify(v4());
  let usernm = JSON.stringify(v4()).substr(0, 9);
  let passwd = JSON.stringify(v4()).substr(0, 9);
  let email = JSON.stringify(v4().substr(0, 9) + "@eprodevusers.aa");
  let graphql = JSON.stringify({
    query: `
      mutation RegisterUser {
        registerUser(
          input: {
            clientMutationId: ${cMId},
            username: ${usernm},
            password: ${passwd},
            email: ${email}
          }
        )
        {
          user {
            jwtAuthToken
            jwtRefreshToken
          }
        }
      }
    `,
  });

  const fetchResult = await fetch(graphqlUrl, {
    method: "POST",
    headers: myHeaders,
    body: graphql,
  });
  const refreshResponse = await fetchResult.json();
  // TODO: RMVINPROD
  // console.log("ctuResponse", refreshResponse);
  isServer()
    ? (document.cookie = `refresh=${refreshResponse.data.registerUser.user.jwtRefreshToken}; Secure; HttpOnly`)
    :
  localStorage.setItem(
    "refresh",
    refreshResponse.data.registerUser.user.jwtRefreshToken
  );
  return refreshResponse.data.registerUser.user.jwtAuthToken;
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

  if (ssr || PageComponent.getStaticProps) {
    WithApollo.getStaticProps = async (ctx: any) => {
      const {
        AppTree,
        ctx: { req, res },
      } = ctx;

      if (isServer()) {
        // console.log("hi from server");

        const cookies = cookie.parse(req.headers.cookie);
        // console.log("req", req);

        if (cookies.authentication) {
          serverAccessToken = await getNewAuthToken();
        }
      }

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      const apolloClient = (ctx.ctx.apolloClient = initApolloClient(
        {},
        serverAccessToken
      ));

      const pageProps = PageComponent.getStaticProps
        ? await PageComponent.getStaticProps(ctx)
        : {};

      // Only on the server
      if (typeof window === "undefined") {
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (res && res.finished) {
          return {};
        }

        if (ssr) {
          // console.log(ssr);

          try {
            // Run all GraphQL queries
            const { getDataFromTree } = await import(
              "@apollo/client/react/ssr"
            );
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

        // // getDataFromTree does not call componentWillUnmount
        // // head side effect therefore need to be cleared manually
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
export function initApolloClient(initState: any, serverAccessToken?: string) {
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
  const refreshLink = new TokenRefreshLink<{ token; refreshToken }>({
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
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      // let refreshToken = getRefreshToken();
      let refreshToken = ""
      // console.log(refreshToken);

      // let fetchResult = await fetch(graphqlUrl, {
      //   method: "POST",
      //   headers: myHeaders,
      //   body: graphql,
      //   redirect: "follow",
      // });

      let graphql = JSON.stringify({
        query: `
            mutation MyMutation {
              __typename
              refreshJwtAuthToken(input: {clientMutationId: ${v4()}, jwtRefreshToken: ${refreshToken}}) { 
                authToken
              }
            }`,
        variables: {},
      });

      const fetchResult = await fetch(graphqlUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: graphql,
        }),
      });
      const refreshResponse = await fetchResult.json();
      // console.log("refRes1", refreshResponse);
      return refreshResponse["data"]["authToken"];
    },
    handleFetch: (serverAccessToken) => {
      setAccessToken(tokens);
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

  let session = "";
  let refreshToken = "";
  /**
   * Middleware operation
   * If we have a session token in localStorage, add it to the GraphQL request as a Session header.
   */
  const middleware = new ApolloLink((operation, forward) => {
    /**
     * If session data exist in local storage, set value as session header.
     */
    session = process.browser ? localStorage.getItem("woo-session") : null;
    refreshToken = process.browser ? localStorage.getItem("woo-refresh") : null;
    // console.log(session);
    // TODO: ensure the new token is set as the header
    if (session) {
      operation.setContext(() => ({
        headers: {
          "woocommerce-session": `Session ${session}`,
        },
      }));
    }

    return forward(operation);
  });

  const afterware = new ApolloLink((operation, forward) => {
    return forward(operation).map((response) => {
      /**
       * Check for session header and update session in local storage accordingly.
       */
      const context = operation.getContext();
      // console.log(context);

      const {
        response: { headers },
      } = context;
      const session = headers.get("woocommerce-session");

      if (session) {
        // Remove session data if session destroyed.
        if ("false" === session) {
          localStorage.removeItem("woo-session");

          // Update session new data if changed.
        } else if (localStorage.getItem("woo-session") !== session) {
          localStorage.setItem(
            "woo-session",
            headers.get("woocommerce-session")
          );
        }
      }

      return response;
    });
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    // console.log(graphQLErrors);
    console.log(networkError);
  });

  const httpLink = new HttpLink({
    uri: graphqlUrl,
    // credentials: "include",
    fetch: fetch,
  });

  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    // Disables forceFetch on the server (so queries are only run once)
    link: ApolloLink.from([
      refreshLink,
      // authLink,
      middleware,
      afterware,
      errorLink,
      httpLink,
    ]),
    cache: new InMemoryCache({
      possibleTypes: {
        Node: [
          "Coupon",
          "ContentType",
          "Taxonomy",
          "User",
          "Comment",
          "EnqueuedScript",
          "EnqueuedStylesheet",
          "MediaItem",
          "Page",
          "Post",
          "Category",
          "PostFormat",
          "Tag",
          "UserRole",
          "ProductCategory",
          "PaColor",
          "ProductVariation",
          "VariableProduct",
          "PaSize",
          "ProductTag",
          "ProductType",
          "ShippingClass",
          "VisibleProduct",
          "Customer",
          "Order",
          "TaxRate",
          "Refund",
          "ShippingMethod",
          "ExternalProduct",
          "GroupProduct",
          "Menu",
          "MenuItem",
          "Plugin",
          "SimpleProduct",
          "Theme",
        ],
        ContentNode: ["MediaItem", "Page", "Post"],
        UniformResourceIdentifiable: [
          "User",
          "MediaItem",
          "Page",
          "Post",
          "Category",
          "PostFormat",
          "Tag",
          "ProductCategory",
          "PaColor",
          "PaSize",
          "ProductTag",
          "ProductType",
          "ShippingClass",
          "VisibleProduct",
        ],
        Commenter: ["User"],
        EnqueuedAsset: ["EnqueuedScript", "EnqueuedStylesheet"],
        NodeWithTitle: ["MediaItem", "Page", "Post"],
        NodeWithAuthor: ["MediaItem", "Page", "Post"],
        NodeWithComments: ["MediaItem", "Page", "Post"],
        HierarchicalContentNode: ["MediaItem", "Page"],
        ContentTemplateUnion: [
          "DefaultTemplate",
          "FullWidthTemplate",
          "HomepageTemplate",
        ],
        ContentTemplate: [
          "DefaultTemplate",
          "FullWidthTemplate",
          "HomepageTemplate",
        ],
        TermNode: [
          "Category",
          "PostFormat",
          "Tag",
          "ProductCategory",
          "PaColor",
          "PaSize",
          "ProductTag",
          "ProductType",
          "ShippingClass",
          "VisibleProduct",
        ],
        NodeWithContentEditor: ["Page", "Post"],
        NodeWithFeaturedImage: ["Page", "Post"],
        NodeWithRevisions: ["Page", "Post"],
        NodeWithPageAttributes: ["Page"],
        MenuItemLinkable: [
          "Page",
          "Post",
          "Category",
          "Tag",
          "ProductCategory",
          "ProductTag",
        ],
        NodeWithExcerpt: ["Post"],
        NodeWithTrackbacks: ["Post"],
        HierarchicalTermNode: ["Category", "ProductCategory"],
        ContentRevisionUnion: ["Post", "Page"],
        Product: [
          "VariableProduct",
          "ExternalProduct",
          "GroupProduct",
          "SimpleProduct",
        ],
        ProductAttribute: ["GlobalProductAttribute", "LocalProductAttribute"],
        MenuItemObjectUnion: [
          "Post",
          "Page",
          "Category",
          "Tag",
          "ProductCategory",
          "ProductTag",
        ],
      },
    }).restore(initialState),
  });
}

export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();
    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(initialState) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}

export default createApolloClient();
