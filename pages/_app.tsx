import App, { Container } from 'next/app'
import React from 'react' 
import { ApolloProvider } from 'react-apollo'
import withAppolo from '../lib/withAppolo'

/* 
*  This will be added to every single page, 
*  Wrapping whatever parent '<Component /> passed to it 
* (whatevver the page is)
*/ 
class MyApp extends App<any> {
  render () {
    const { Component, pageProps, apolloClient } = this.props 
    return (
      <Container>
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} /> 
        </ApolloProvider>
      </Container>
    )
  }
}

export default withAppolo(MyApp)