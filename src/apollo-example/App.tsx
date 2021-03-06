import { gql } from '@apollo/client';
import * as React from 'react';
import { ApolloProvider, Query, useMutation } from 'react-apollo';
import { client } from './apollo-client';

const LOCAL_HELLO = gql`
  query localHello($subject: String) {
    localHello(subject: $subject) @client
  }
`;

const SERVER_HELLO = gql`
  query serverHello($subject: String) {
    hello(subject: $subject)
  }
`;

const LOCAL_METAMASK_MUTATION = gql`
  mutation metamaskSign($msg: String) {
    metamaskSign(msg: $msg) @client
  }
`

const LocalHello = () => (
  <Query query={LOCAL_HELLO} variables={{ subject: 'Worlds' }}>
    {({ loading, error, data }) => {
      if (loading) {
        return <p>'Loading...'</p>;
      }

      return <h2>This is a graphql query resolved locally: {error ? error.message : data.localHello}</h2>;
    }}
  </Query>
);

const ServerHello = () => (
  <Query query={SERVER_HELLO} variables={{ subject: 'World' }}>
    {({ loading, error, data }) => {
      if (loading) {
        return <p>'Loading...'</p>;
      }

      return (
        <h2>
          Server Salutation:&nbsp;
          {error
            ? error.message + '. You probably don`t have GraphQL Server running at the moment - thats okay'
            : data.hello}
        </h2>
      );
    }}
  </Query>
);

const LocalMetamaskMutation = () => {
  let input;
  const [metamaskSign, resp] = useMutation(LOCAL_METAMASK_MUTATION);
  return (
    <div>
      <h2>Graphql mutation to sign a message with Metamask</h2>
      <form
        onSubmit={e => {
          console.log('onSubmit!')
          e.preventDefault();
          metamaskSign({variables: {msg: input.value}})
        }}>
        <input
          ref={node => {
            input = node;
          }}
        />
        <button type="submit">Metamask Sign</button>
      </form>
    </div>
  )
}

const App = () => (
  <ApolloProvider client={client}>
    <div>
      <h1>
        Welcome to your own <a href="http://localhost:8080/graphiql">GraphQL</a> web front end!
      </h1>
      <h2>You can start editing source code and see results immediately</h2>
      <LocalHello />
      {/* <ServerHello /> */}
      <LocalMetamaskMutation />
    </div>
  </ApolloProvider>
);

export default App;
