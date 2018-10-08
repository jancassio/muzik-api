import * as dotenv from 'dotenv'
import { GraphQLServer } from 'graphql-yoga'

import { Prisma } from './generated/prisma/bindings'
import resolvers from './resolvers'

dotenv.config()

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: (req) => ({
    ...req,
    db: new Prisma({
      endpoint: process.env.PRISMA_ENDPOINT,
      secret: process.env.PRISMA_SECRET,
      debug: process.env.NODE_ENV !== 'production'
    }),
  }),
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
})

server.start(() => console.log('Server is running on http://localhost:4000'))