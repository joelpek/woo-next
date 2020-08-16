import { onError } from "@apollo/client/link/error";
import { getRefreshTokenLink } from "apollo-link-refresh-token";
import fetch from "node-fetch";
// import { ApolloClient } from "apollo-client";
import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  HttpLink,
  ApolloLink,
  fromPromise,
  IntrospectionFragmentMatcher,
  createHttpLink,
} from "@apollo/client";

import introspectionQueryResultData from "../fragmentTypes";
import clientConfig from "../clientConfig";
import { setContext } from "@apollo/client/link/context";
import { v4 } from "uuid";
import cookie from "cookie";
import wooConfig from "../wooConfig";
import GET_RTOKEN_QUERY from "../queries/get-refresh-token";
import GET_TOKEN_MUTATION from "../mutations/get-token";

let session = "";
let refreshToken = "";

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
  session = process.browser ? localStorage.getItem("woo-session") : null;
  refreshToken = process.browser ? localStorage.getItem("woo-refresh") : null;
  console.log(session);
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
    console.log("CONTEXT HEADERS1:", headers);
    const session = headers.get("woocommerce-session");

    if (session) {
      // console.log(session)

      // Remove session data if session destroyed.
      if ("false" === session) {
        alert("false === session");
        localStorage.removeItem("woo-session");
        // localStorage.clear();
        //   // Update session new data if changed.
      } else if (localStorage.getItem("woo-session") !== session) {
        localStorage.setItem("woo-session", headers.get("woocommerce-session"));
      }
    }
    return response;
  });
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    // TODO: case-specific error handling
    // localStorage.clear();
    // alert("Sorry, we were forced to reset your session. We apologize for any inconvenience. 👷")
    // location.reload();
    // TODO: Expired token error handling
    if (networkError)
      console.log("errorLink listing networkError:", networkError);
    if (graphQLErrors) {
      console.log("errorLink listing graphQLErrors:", graphQLErrors);
      for (let err of graphQLErrors) {
        if (err.message === "Expired token") {
          // debugger;
          debugger;
          return fromPromise(
            fetchNewAccessToken()
              // getNewToken()
              .then(() => {
                // Store the new tokens for your auth link
                console.log("fnat then");
              })
              .catch((error) => {
                // Handle token refresh errors e.g clear stored tokens, redirect to login, ...
                console.log(error);
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
              fetchNewAccessToken()
                .then(({ accessToken, refreshToken }) => {
                  // Store the new tokens for your auth link
                  console.log(refreshToken);

                  return accessToken;
                })
                .catch((error) => {
                  // Handle token refresh errors e.g clear stored tokens, redirect to login, ...
                  console.log(error);
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
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
      // if you would also like to retry automatically on
      // network errors, we recommend that you use
      // apollo-link-retry
    }
  }
);

const authLink = setContext((_, { headers }) => {
  if (typeof window === "undefined") {
    // server side code
    // get the authentication token from cookie if it exists
    console.log("server-side!");
  } else {
    // client side code
    session = localStorage.getItem("woo-session");
    console.log("client-side");
  }
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: session ? `Bearer ${session}` : "",
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
  if (!wooConfig.graphqlUrl) {
    throw new Error("graphqlUrl must be set to use refresh token link");
  }
  refreshToken = headers.get("X-JWT-Refresh");

  // TODO: fix
  try {
    const fetchResult = await fetch(wooConfig.graphqlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
        mutation MyMutation {
          __typename
          refreshJwtAuthToken(input: {clientMutationId: ${v4()}, jwtRefreshToken: ${refreshToken}}) { 
            authToken
          }
        }
        `,
      }),
    });

    const refreshResponse = await fetchResult.json();
    /*
    if (
      !refreshResponse ||
      !refreshResponse.data ||
      !refreshResponse.data.refreshTokens ||
      !refreshResponse.data.refreshTokens.accessToken
    ) {
      // debugger;
      return undefined;
    } */
    console.log("refRes", refreshResponse.substr(0, 10));
    return refreshResponse.data;
  } catch (e) {
    throw new Error("Failed to fetch fresh access token");
  }
};

// const fetchCurrentRefreshToken = async () => {
//   // TODO: fix
//   try {
//     const fetchResult = await fetch(wooConfig.graphqlUrl, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         query: `
//             {
//               viewer {
//                 jwtRefreshToken
//                 id
//                 username
//               }
//             }
//           `,
//       }),
//     });

//     const refreshResponse = await fetchResult.json();
//     /*
//     if (
//       !refreshResponse ||
//       !refreshResponse.data ||
//       !refreshResponse.data.refreshTokens ||
//       !refreshResponse.data.refreshTokens.accessToken
//     ) {
//       // debugger;
//       return undefined;
//     } */
//     console.log(refreshResponse);
//     return refreshResponse.data;
//   } catch (e) {
//     throw new Error("Failed to fetch fresh access token");
//   }
// };

const refreshTokenLink = getRefreshTokenLink({
  authorizationHeaderKey: "Authorization",
  fetchNewAccessToken,
  getAccessToken: () => localStorage.getItem("access_token"),
  getRefreshToken: () => session,
  isAccessTokenValid: (accessToken) => isTokenValid(accessToken),
  isUnauthenticatedError: (graphQLError) => {
    console.log("hi from rtl");
    const { extensions } = graphQLError;
    if (
      extensions &&
      extensions.code &&
      extensions.code === "UNAUTHENTICATED"
    ) {
      console.log("hi from rtl");
      return true;
    }
    console.log("bye from rtl");
    return false;
  },
});

const apolloLink = ApolloLink.from([
  errorLink,
  authLink,
  refreshTokenLink,
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
