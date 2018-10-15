import { hash, compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { Context } from "../helpers/types";
import { User, FileUpdateOneInput } from "../../generated/prisma/bindings";
import { authorizedUser, ensureUserCouldWrite } from '../helpers/session';
import { performUpload, Upload } from '../helpers/file';

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

    await ensureIsSamePassword(password, user.password)

    const token = signId(user.id)

    return {
      user,
      token,
    }
  },

  async updateUser (root: {}, { id, name, oldPassword, newPassword, file }: User & PasswordChange & { file: Upload }, context: Context) {
    ensureUserCouldWrite(id, context)

    let cryptPassword
    let thumb: FileUpdateOneInput
    
    if (oldPassword && newPassword) {
      const user: User = await context.db.query.user({ where: { id } }, '{ password }')
      ensureIsSamePassword(oldPassword, user.password)
      cryptPassword = encrypt(newPassword);
    }
    
    if (file) {
      const upload = await performUpload(file)

      upload.encoding = file.encoding
      upload.mimetype = file.mimetype
      thumb = {
        update: {
          name: upload.name,
          encoding: upload.encoding,
          mimetype: upload.mimetype
        }
      }
    }

    return context.db.mutation.updateUser({
      data: { name, password: cryptPassword, thumb },
      where: { id },
    })
  },

  async deleteUser (root: {}, { id, password }: User, context: Context) {
    ensureUserCouldWrite(id, context);
    const user: User = await context.db.query.user({ where: { id } }, '{ password }')
    
    await ensureIsSamePassword(password, user.password)

    return context.db.mutation.deleteUser({ where: { id }})
  },
}

const subscription = {}

export default {
  query,
  mutation,
  subscription,
}