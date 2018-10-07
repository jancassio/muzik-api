import { GraphQLServer } from 'graphql-yoga'
import resolvers from './resolvers'
import dotenv from 'dotenv'

dotenv.config()

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
})

server.start(() => console.log('Server is running on http://localhost:4000'))