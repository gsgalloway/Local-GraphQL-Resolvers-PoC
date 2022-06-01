import * as React from 'react';
import { gql, Provider } from "urql";
import { client } from "./urql-client";
import { useQuery } from 'urql';

const PRINT_ETH_ADDRESS_QUERY = gql`
  query localPrintEthAddress {
    printEthAddress
  }
`;

const PrintEthAddress = () => {
    const [result] = useQuery({
        query: PRINT_ETH_ADDRESS_QUERY,
    });
    
    const { data, fetching, error } = result;
    if (fetching) {
        return <p>Loading...</p>
    }
    return <h2>This is a graphql query resolved locally: {error ? error.message : data.printEthAddress}</h2>;
  };

export const URQLApp = () => (
    <Provider value={client}>
      <div>
      <h1>
        Welcome to your own <a href="http://localhost:8080/graphiql">GraphQL</a> web front end!
      </h1>
      <h2>You can start editing source code and see results immediately</h2>
      <PrintEthAddress />
    </div>
    </Provider>
);
