import { Context } from "../helpers/types";
import { verify } from "jsonwebtoken";

export const authorizedUser = (context: Context) => {
  const header = context.request.get('Authorization')
  const token = header.replace('MZK ', '')
  const { userId } = verify(token, process.env.MUSIK_APP_SECRET) as { userId }

  if (!userId) {
    throw new Error('User not authenticated.')
  }

  return userId
}