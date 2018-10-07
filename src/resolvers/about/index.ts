import { Context } from "graphql-yoga/dist/types";
import { GraphQLFieldResolver } from "graphql";

interface About {
  name: string
  version: string
  author: string
  info: string
}

const about = () => ({
  name: 'Muzik',
  version: '1.0',
  author: 'Jan Cássio',
  info: 'Muzik loves music lovers',
})

export { about }