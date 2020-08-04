import cookie from "cookie";
import PropTypes from "prop-types";
import React from "react";
import { getDataFromTree } from "react-apollo";
import initApollo from "./initApollo";
import { isBrowser } from "./isBrowser";
import { ApolloClient, NormalizedCacheObject } from 'apollo-boost'
import Head from 'next/head'


/** functionj to parse cookies recieved from the client-request */
function parseCookies(req?: any, options = {}) {
  return cookie.parse(
    req ? req.headers.cookie || "" : document.cookie,
    options
  );
}

/* 
* Higher Order Component 
*   - recieves `App:any` and returns the class passed to it, with some 
*     "stuff" inside of it 
*       - `App.getInitialProps` is a special method that is run by 
*          nextjs before a page is rendered. 
*   - initializes the apollo client 
*       - passes the apollo client to  
*   - `getDataFromTree()` - 
*     - runs query components placed anywhere within the application 
*       and stores the data in the cache, so that when the page first renders, 
*       it will have all the required data in the cache
*/ 
export default (App: any) => {
  return class WithData extends React.Component {
    static displayName = `WithData(${App.displayName})`;
    static propTypes = { apolloState: PropTypes.object.isRequired };
    static async getInitialProps(ctx: any) {
      const {
        Component,
        router,
        ctx: { req, res },
      } = ctx;
      const apollo = initApollo(
        {},
        { getToken: () => parseCookies(req).qid }
        );
        ctx.ctx.apolloClient = apollo;
        
        let appProps = {};
        if (App.getInitialProps) {
          appProps = await App.getInitialProps(ctx);
        }
        
        if (res && res.finished) {
          // when redirecting, the response is finished
          // no point in continuing to render
          return {};
        }
        
        if (!isBrowser) {
          // run all graphql queries in the component tree
          // and extract the resulting data
          try {
            // run all graphql queries
            await getDataFromTree(
              <App
              {...appProps}
              Component={Component}
              router={router}
              apolloClient={apollo}
              />
              );
            } catch (error) {
              // prevent Apollo Client GraphQL errors from crashing SSR
              // Handle them in components via the data.error prop:
              // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
              console.error("Error while running `getDataFromTree`", error);
            }
            
            // getDataFromTree does not call componentWillUnmount
            // head side effect will need to be cleared manually to 
            // prevent errors 
            Head.rewind(); 

            // extract query data from the Apollo store
            const apolloState = apollo.cache.extract();
            
            return {
              ...appProps,
              apolloState,
            };
          }
        }
        
        apolloClient: ApolloClient<NormalizedCacheObject> 
        
        constructor(props: any) {
          super(props);
      // `getDataFromTree` renders the component first, the client is passed off as
      // a property. After that rendering is done using Next's normal rendering pipeline 
      this.apolloClient = initApollo(props.apolloState, {
        getToken: () => {
          return parseCookies().token
        }
      })
    }
    
    render() {
      return <App {...this.props} apolloClient={this.apolloClient} /> 
    }
  };
};
