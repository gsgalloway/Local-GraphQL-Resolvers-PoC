import { ApolloClient, InMemoryCache } from '@apollo/client'
import { AbstractProvider } from 'web3-core/types';
import Web3 from 'web3';

export const GRAPHQL_API_URL = 'http://localhost:8080/graphql';

declare global {
  interface Window {
    ethereum: AbstractProvider;
  }
}

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  resolvers: {
    Query: {
      localHello(obj: any, { subject }: { subject: string }, context) {
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
        if (typeof web3.currentProvider === "string" || !('sendAsync' in web3.currentProvider)) {
          throw new Error(`expected web3.currentProvider to not be a string`);
        }
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
