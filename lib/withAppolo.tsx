import cookie from "cookie";
import PropTypes from "prop-types";
import React from "react";
import { getDataFromTree } from "react-apollo";
import initApollo from "./initApollo";
import { isBrowser } from "./isBrowser";

function parseCookies(req?: any, options = {}) {
  return cookie.parse(
    req ? req.headers.cookie || "" : document.cookie,
    options
  );
}

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
        { getToken: () => parseCookies(req).token }
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
        // extract query data from the Apollo store
        const apolloState = apollo.cache.extract();

        return {
          ...appProps,
          apolloState,
        };
      }
    }
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
      return <App {...this.props} apolloClient={this.apolloClient}
    }
  };
};
