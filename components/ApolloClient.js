// import fetch from "node-fetch";
// import { ApolloClient } from "apollo-client";
// import { InMemoryCache } from "apollo-cache-inmemory";
// import { createHttpLink } from "apollo-link-http";
// import { ApolloLink, fromPromise } from "apollo-link";
// import { IntrospectionFragmentMatcher } from "apollo-cache-inmemory";
// import introspectionQueryResultData from "../fragmentTypes";
// import clientConfig from "./../clientConfig";
// import { onError } from "apollo-link-error";

// // Fragment matcher.
// const fragmentMatcher = new IntrospectionFragmentMatcher({
//   introspectionQueryResultData,
// });

// /**
//  * Middleware operation
//  * If we have a session token in localStorage, add it to the GraphQL request as a Session header.
//  */
// export const middleware = new ApolloLink((operation, forward) => {
//   /**
//    * If session data exist in local storage, set value as session header.
//    */
//   const session = process.browser ? localStorage.getItem("woo-session") : null;

//   if (session) {
//     operation.setContext(({ headers = {} }) => ({
//       headers: {
//         "woocommerce-session": `Session ${session}`,
//       },
//     }));
//   }

//   return forward(operation);
// });

// /**
//  * Afterware operation.
//  *
//  * This catches the incoming session token and stores it in localStorage, for future GraphQL requests.
//  */
// export const afterware = new ApolloLink((operation, forward) => {
//   return forward(operation).map((response) => {
//     /**
//      * Check for session header and update session in local storage accordingly.
//      */
//     const context = operation.getContext();
//     const {
//       response: { headers },
//     } = context;
//     const session = headers.get("woocommerce-session");

//     if (session) {
//       // Remove session data if session destroyed.
//       if ("false" === session) {
//         localStorage.removeItem("woo-session");

//         // Update session new data if changed.
//       } else if (localStorage.getItem("woo-session") !== session) {
//         localStorage.setItem("woo-session", headers.get("woocommerce-session"));
//       }
//     }

//     return response;
//   });
// });

// const getNewToken = () => {
//   return client.query({ query: GET_TOKEN_QUERY }).then((response) => {
//     // extract your accessToken from your response data and return it
//     const { accessToken } = response.data;
//     return accessToken;
//   });
// };

// const errorLink = new onError(
//   ({ graphQLErrors, networkError, operation, forward }) => {
//     if (networkError) {
//       console.log(networkError);
//     }

//     if (graphQLErrors) {
//       for (let err of graphQLErrors) {
//         switch (err.extensions.code) {
//           case "UNAUTHENTICATED":
//             return fromPromise(
//               getNewToken().catch((error) => {
//                 // Handle token refresh errors e.g clear stored tokens, redirect to login
//                 return;
//               })
//             )
//               .filter((value) => Boolean(value))
//               .flatMap((accessToken) => {
//                 const oldHeaders = operation.getContext().headers;
//                 // modify the operation context with a new token
//                 operation.setContext({
//                   headers: {
//                     ...oldHeaders,
//                     authorization: `Bearer ${accessToken}`,
//                   },
//                 });

//                 // retry the request, returning the new observable
//                 console.log(accessToken);
//                 console.log(forward(operation));

//                 return forward(operation);
//               });
//         }
//       }
//     }
//   }
// );

// // Apollo GraphQL client.
// const client = new ApolloClient({
//   link: middleware.concat(
//     afterware.concat(
//       errorLink.concat(
//         createHttpLink({
//           uri: clientConfig.graphqlUrl,
//           fetch: fetch,
//         })
//       )
//     )
//   ),
//   cache: new InMemoryCache({ fragmentMatcher }),
// });

// export default client;

/* begin new version */

import { onError } from "apollo-link-error";
import { ApolloLink,fromPromise, concat } from "apollo-link";
import fetch from "node-fetch";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { IntrospectionFragmentMatcher } from "apollo-cache-inmemory";
import introspectionQueryResultData from "../fragmentTypes";
import clientConfig from "./../clientConfig";

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
  const session = process.browser ? localStorage.getItem("woo-session") : null;

  if (session) {
    operation.setContext(({ headers = {} }) => ({
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
      // Remove session data if session destroyed.
      if ("false" === session) {
        localStorage.removeItem("woo-session");

        // Update session new data if changed.
      } else if (localStorage.getItem("woo-session") !== session) {
        localStorage.setItem("woo-session", headers.get("woocommerce-session"));
      }
    }

    return response;
  });
});


const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        switch (err.extensions.code) {
          case "UNAUTHENTICATED":
            // error code is set to UNAUTHENTICATED
            // when AuthenticationError thrown in resolver

            return fromPromise(
              getNewToken()
                .then(({ accessToken, refreshToken }) => {
                  // Store the new tokens for your auth link
                  return accessToken;
                })
                .catch((error) => {
                  // Handle token refresh errors e.g clear stored tokens, redirect to login, ...
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

const apolloLink = concat(
  errorLink,
  concat(
    middleware.concat(
      afterware.concat(
        concat(
          createHttpLink({
            uri: clientConfig.graphqlUrl,
            fetch: fetch,
          })
        )
      )
    )
  )
);

// Apollo GraphQL client.
const client = new ApolloClient({
  link: apolloLink,
  cache: new InMemoryCache({ fragmentMatcher }),
});

export default client;
