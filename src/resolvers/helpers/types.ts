import { Prisma } from '../../generated/prisma/bindings'
import { GraphQLResolveInfo } from 'graphql';

export interface Context {
  db: Prisma
  request: any
}
