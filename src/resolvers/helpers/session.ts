import { Context } from "../helpers/types";
import { verify } from "jsonwebtoken";

export interface Session {
  userId: string
}

export const authorizedUser = (context: Context): Session => {
  const header = context.request.get('Authorization') || ''
  if (!header) {
    throw new Error('Authenticated user is required to do this.')
  }

  const token = header.replace('MZK ', '')
  console.log('authorized user -> token', token)
  const { userId } = verify(token, process.env.MUSIK_APP_SECRET) as { userId }
  console.log('authorized user -> userId', userId)

  if (!userId) {
    throw new Error('User not authenticated.')
  }

  return { userId }
}

export const ensureUserCouldWrite = (id: string, context: Context) => {
  const { userId } = authorizedUser(context)
  const couldUpdateUser = userId === id
    
  if (!couldUpdateUser) {
    throw new Error('You are not allowed to do this action')
  }

  return true
}
