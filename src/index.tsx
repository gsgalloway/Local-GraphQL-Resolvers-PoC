import * as React from 'react';
import { render } from 'react-dom';

import ApolloApp from './apollo-example/App';
import { URQLApp } from './urql-example/App';

render(
  <>
    <>
      <h1>Apollo-Client Example</h1>
      <ApolloApp/>
    </>,
    <>
      <h1>URQL Example</h1>
      <URQLApp/>
    </>
  </>,
  document.getElementById('root')
);
