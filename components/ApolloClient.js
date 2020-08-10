import { setContext } from "apollo-link-context";
import { onError } from "apollo-link-error";
import { ApolloLink, fromPromise, concat } from "apollo-link";
import { getRefreshTokenLink } from "apollo-link-refresh-token";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import fetch from "node-fetch";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { IntrospectionFragmentMatcher } from "apollo-cache-inmemory";
import introspectionQueryResultData from "../fragmentTypes";
import clientConfig from "./../clientConfig";
// import { setContext } from "@apollo/client/link/context";
import GET_RTOKEN_QUERY from "../queries/get-refresh-token";
import GET_TOKEN_MUTATION from "../mutations/get-token";
import { v4 } from "uuid";
import cookie from "cookie";
import wooConfig from "../wooConfig";

const session = process.browser ? localStorage.getItem("woo-session") : null;
/*console.log(session);*/

// Fragment matcher.
const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
});

/**
 * Middleware operation
 * If we have a session token in localStorage, add it to the GraphQL request as a Session header.
 */
export const middleware = new ApolloLink((operation, forward) => {
  /**
   * If session data exist in local storage, set value as session header.
   */
  // session = process.browser ? localStorage.getItem("woo-session") : null;
  /*console.log(session);*/
  if (session) {
    operation.setContext(({ ctx = {} }) => ({
      headers: {
        "woocommerce-session": `Session ${session}`,
      },
    }));
  }

  return forward(operation);
});

/**
 * Afterware operation.
 *
 * This catches the incoming session token and stores it in localStorage, for future GraphQL requests.
 */
export const afterware = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    /**
     * Check for session header and update session in local storage accordingly.
     */
    const context = operation.getContext();
    const {
      response: { headers },
    } = context;
    const session = headers.get("woocommerce-session");

    if (session) {
      // /*console.log(session);*/

      // Remove session data if session destroyed. TODO: EXPIRED TOKEN HANDLING
      // if ("false" === session) {
      //   // localStorage.removeItem("woo-session");
      //   // localStorage.clear();
      //   // Update session new data if changed.
      // } else 
      if (localStorage.getItem("woo-session") !== session) {
        localStorage.setItem("woo-session", headers.get("woocommerce-session"));
      }
    }

    return response;
  });
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    localStorage.clear();
    alert("Sorry, we were forced to reset your session. We apologize for any inconvenience. 👷")
    location.reload();
    if (graphQLErrors) {
      // debugger;
      /*console.log("errorLink listing graphQLErrors:", graphQLErrors);*/
    }
    for (let err of graphQLErrors) {
      if (err.message === "Expired token") {
        
        // debugger;
        return fromPromise(
          fetchNewAccessToken()
            //   getNewToken()
            .then(() => {
              // Store the new tokens for your auth link
              /*console.log("fnat then");*/
            })
            .catch((error) => {
              // Handle token refresh errors e.g clear stored tokens, redirect to login, ...
              /*console.log(error);*/
              alert(
                "Something went wrong... Please let us know if the problem persists and we'll do our best to assist you."
              );
              return;
            })
        )
          .filter((value) => Boolean(value))
          .flatMap(() => {
            // retry the request, returning the new observable
            return forward(operation);
          });
      }
      switch (err.extensions.code) {
        case "UNAUTHENTICATED":
          // error code is set to UNAUTHENTICATED
          // when AuthenticationError thrown in resolver

          return fromPromise(
            getNewToken()
              .then(({ accessToken, refreshToken }) => {
                // Store the new tokens for your auth link
                /*console.log(refreshToken);*/

                return accessToken;
              })
              .catch((error) => {
                // Handle token refresh errors e.g clear stored tokens, redirect to login, ...
                /*console.log(error);*/
                alert(
                  "Something went wrong... Please let us know if the problem persists and we'll do our best to assist you."
                );
                return;
              })
          )
            .filter((value) => Boolean(value))
            .flatMap(() => {
              // retry the request, returning the new observable
              return forward(operation);
            });
      }
    }
    if (networkError) {
      /*console.log(`[Network error]: ${networkError}`);*/
      // if you would also like to retry automatically on
      // network errors, we recommend that you use
      // apollo-link-retry
    }
  }
);

const getNewToken = () => {
  // /*console.log("getNewToken");*/
};

const authLink = setContext((_, { headers }) => {
  let a = async () => {
    return await client
      .query({
        query: GET_RTOKEN_QUERY,
      })
      .then((response) => /*console.log(response.data))*/response)
      .catch((err) => /* console.error(err) */ err);
  };
  /*console.log(a());*/

  let refreshToken = a();
  let authToken = null;

  let tokenMutationInput = {
    clientMutationId: v4,
    refreshToken: refreshToken,
  };
  // get the authentication token from cookie if it exists
  if (typeof window === "undefined") {
    // server side code
    // refreshToken = cookie.parse(req.headers.cookie.refreshToken); // TODO: get req object from ? || 20_08_07: REST API query via fetch in module "apollo-link-refresh-token"
    /*console.log(refreshToken);*/
  } else {
    // client side code
    refreshToken = localStorage.getItem("token");
  }
  cookie;

  /*console.log("test authlink");*/
  authToken = fetchNewAccessToken(); // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: authToken ? `Bearer ${authToken}` : "",
    },
  };
});

// begin gRTL boilerplate
const isTokenValid = (token) => {
  // debugger;
  const decodedToken = jwtDecode(token);

  if (!decodedToken) {
    return false;
  }

  const now = new Date();
  return now.getTime() < decodedToken.exp * 1000;
};

const fetchNewAccessToken = async () => {
  /*console.log("hi from fnat");*/
  if (!wooConfig.graphqlUrl) {
    throw new Error("graphqlUrl must be set to use refresh token link");
  }

  // TODO: FIX ONCE AND FOR ALL
  try {
    const fetchResult = await fetch(wooConfig.graphqlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
        mutation MyMutation {
          __typename
          refreshJwtAuthToken(input: {clientMutationId: "abc", jwtRefreshToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvc3RvcmUuZXByby5kZXYiLCJpYXQiOjE1OTY4MDgwNjUsIm5iZiI6MTU5NjgwODA2NSwiZXhwIjoxNTk2OTgwODY1LCJkYXRhIjp7ImN1c3RvbWVyX2lkIjoiYWFhOWYxOTIyOTUxNWQwOTAxYjgxMjJkYzFjYTRlMzUifX0.mhcLKZQqHCoBzu6gObXXqACq9QBRF--wGIE1omMVYzQ"}) { 
            authToken
          }
        }
        `,
      }),
    });

    const refreshResponse = await fetchResult.json();
    /*console.log(refreshResponse);*/
    // debugger;

    if (
      !refreshResponse ||
      !refreshResponse.data ||
      !refreshResponse.data.refreshTokens ||
      !refreshResponse.data.refreshTokens.accessToken
    ) {
      // debugger;
      return undefined;
    }

    return refreshResponse.data.refreshTokens.accessToken;
  } catch (e) {
    throw new Error("Failed to fetch fresh access token");
  }
};

const refreshTokenLink = getRefreshTokenLink({
  authorizationHeaderKey: "Authorization",
  fetchNewAccessToken,
  getAccessToken: () => localStorage.getItem("access_token"),
  getRefreshToken: () => session,
  isAccessTokenValid: (accessToken) => isTokenValid(accessToken),
  isUnauthenticatedError: (graphQLError) => {
    /*console.log("hi from rtl");*/
    const { extensions } = graphQLError;
    if (
      extensions &&
      extensions.code &&
      extensions.code === "UNAUTHENTICATED"
    ) {
      /*console.log("hi from rtl");*/
      return true;
    }
    /*console.log("bye from rtl");*/
    return false;
  },
});

const apolloLink = ApolloLink.from([
  errorLink,
  // authLink,
  refreshTokenLink,
  // TokenRefreshLink,
  middleware,
  afterware,
  createHttpLink({
    uri: clientConfig.graphqlUrl,
    fetch: fetch,
  }),
]);

// Apollo GraphQL client.
const client = new ApolloClient({
  link: apolloLink,
  cache: new InMemoryCache({ fragmentMatcher }),
});

export default client;
