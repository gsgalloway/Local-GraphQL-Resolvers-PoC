import { createClient, gql } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';
import { buildASTSchema, GraphQLError, GraphQLScalarType, introspectionFromSchema, Kind } from 'graphql';
import { getAddress } from '@ethersproject/address';
import customScalarsExchange from 'urql-custom-scalars-exchange';

// constructs the schema as a `TypedDocumentNode`
const schema = gql`
    schema {
        query: Query
    }
    type Query {
        printEthAddress: Address!
    }
    scalar Address
`

// generates an `IntrospectionQuery` from the schema above.
// `IntrospectionQuery` appears to be what URQL uses predominantly
const astSchema = buildASTSchema(schema);
const introspectionResult = introspectionFromSchema(astSchema);

// Standard use of GraphQLScalarType to implement custom Scalar
const ethAddressResolver = new GraphQLScalarType<string, string>({
    name: "Address",
    serialize(addr): string {
      if (typeof addr !== "string") {
        throw new TypeError(`Address is not string: ${typeof addr}`);
      }
      return getAddress(addr);
    },
    parseValue(value): string {
      if (typeof value !== "string") {
        throw new TypeError(`Address is not string: ${typeof value}`);
      }
      return getAddress(value);
    },
    parseLiteral(ast): string {
      if (ast.kind !== Kind.STRING) {
        throw new GraphQLError(
          `Can only validate strings as STRING but got a: ${ast.kind}`
        );
      }
      return getAddress(ast.value);
    },
});

// definition of resolvers as generated by `typescript-resolvers` codegen plugin, and
// as expected by Apollo. Note that the custom scalar is included as its own "resolver"
const resolvers = {
    Address: ethAddressResolver,
    Query: {
        printEthAddress: () => '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    }
}

// scalarsExchange will parse responses from the resolvers and map them from raw strings
// to the rich types. The keys in `scalars` must match the names of each custom scalar
const scalarsExchange = customScalarsExchange({
  schema: introspectionResult,
  scalars: {
      Address: ethAddressResolver.parseValue,
  },
});

// create a subtype of the resolvers that omits al the scalar definitions,
// so we can pass them to URQL without complaint
type ResolversWithoutScalars = Omit<typeof resolvers, 'Address'>;

// wire up the local resolvers into URQL. Note that it will ignore the Address resolver
const _cacheExchange = cacheExchange({
    resolvers: resolvers as ResolversWithoutScalars,
})

// URQL client uses the both exchanges. `scalarsExchange` must come first, and will parse
// raw string values into rich types
export const client = createClient({
  url: "http://localhost:8080/graphql",
  exchanges: [scalarsExchange, _cacheExchange],
});