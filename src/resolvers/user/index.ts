import { hash, compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { Context } from "../helpers/types";
import { User } from "../../generated/prisma/bindings";
import { authorizedUser } from '../helpers/session';

const signId = (userId) => sign({ userId }, process.env.MUSIK_APP_SECRET)
const encrypt = (string) => hash(string, 10);

const ensureIsSamePassword = async (password: string, hash: string) => {
  const valid = await compare(password, hash)

  if (!valid) {
    throw new Error('Invalid password.')
  }

  return true
}

interface PasswordChange {
  oldPassword?: string
  newPassword?: string
}

const ensureCouldUpdateUser = (id: string, context: Context) => {
  const authUser = authorizedUser(context)
  const couldUpdateUser = authUser.userId === id
    
  if (!couldUpdateUser) {
    throw new Error('You are not allowed to do this action')
  }

  return true
}

const query = {} 

const mutation = {
  async signup (root: {}, { name, email, password }: User, context: Context) {
    const cryptPassword = await encrypt(password)

    const user = await context.db.mutation.createUser({
      data: {
        name,
        email,
        password: cryptPassword
      }
    }, '{ id }')

    const token = signId(user.id)

    return {
      token,
      user,
    }
  },

  async signin (root: {}, { email, password }: User, context: Context) {
    const user: User = await context.db.query.user({ where: { email } }, '{ id password }')

    if (!user) {
      throw new Error('Such user not found.')
    }

    ensureIsSamePassword(password, user.password)

    const token = signId(user.id)

    return {
      user,
      token,
    }
  },

  async updateUser (root: {}, { id, name, oldPassword, newPassword }: User & PasswordChange, context: Context) {
    ensureCouldUpdateUser(id, context)

    let cryptPassword

    if (oldPassword && newPassword) {
      const user: User = await context.db.query.user({ where: { id } }, '{ password }')
      ensureIsSamePassword(oldPassword, user.password)
      cryptPassword = encrypt(newPassword);
    }

    return context.db.mutation.updateUser({
      data: { name, password: cryptPassword },
      where: { id },
    })
  },

  async deleteUser (root: {}, { id, password }: User, context: Context) {
    ensureCouldUpdateUser(id, context);
    const user: User = await context.db.query.user({ where: { id } }, '{ password }')
    ensureIsSamePassword(password, user.password)

    return context.db.mutation.deleteUser({ where: { id }})
  },
}

const subscription = {}

export default {
  query,
  mutation,
  subscription,
}