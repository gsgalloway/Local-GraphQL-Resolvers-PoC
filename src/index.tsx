import { ApolloClient, InMemoryCache } from '@apollo/client'
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { render } from 'react-dom';
import Web3 from 'web3';

import App from './App';

const GRAPHQL_API_URL = 'http://localhost:8080/graphql';

const client = new ApolloClient({
  cache: new InMemoryCache(),
  resolvers: {
    Query: {
      localHello(obj: any, { subject }: { subject: string }, context) {
        console.log(context);
        return `Hello, ${subject}! from Web UI (${context})`;
      }
    },
    Mutation: {
      async metamaskSign(rootValue: any, { msg }: { msg: string }) {
        console.log(`Signing ${msg}...`)
        if (window.ethereum === undefined) {
          alert('Metamask not connected');
          return;
        }
        await window.ethereum.request({method: 'eth_requestAccounts'});
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        const msgParams = [
          {
            type: 'string',
            name: 'Message',
            value: msg,
          }
        ]
        const signature = await web3.currentProvider.sendAsync({
          method: 'eth_signTypedData',
          params: [msgParams, accounts[0]],
          from: accounts[0],
        }, (err, result) => {
          if (err) alert(err);
          else if (result.error) alert(result.error.message);
          else alert(`Signature: ${result.result}`)
        })
      }
    },
  },
  uri: GRAPHQL_API_URL
});

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
