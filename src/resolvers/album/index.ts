import { Context } from "../helpers/types";
import { Album, FileCreateOneInput, FileUpdateOneInput, ArtistWhereUniqueInput, Artist } from "../../generated/prisma/bindings";
import { authorizedUser, ensureUserCouldWrite } from "../helpers/session";
import { performUpload, Upload } from '../helpers/file';
import { difference } from "../../helpers/list";

const query = {
  async album (root: {}, { id }: Album, ctx: Context, info) {
    return ctx.db.query.album({ where: { id } }, info)
  },

  async albums (root: {}, args: Album, ctx: Context, info) {
    return await ctx.db.query.albums({}, info)
  }
}

const mutation = {
  async createAlbum (root: {}, { name, artists, file }: Album & { file: Upload }, ctx: Context, info) {
    const { userId } = authorizedUser(ctx);
    ensureUserCouldWrite(userId, ctx);

    let cover: FileCreateOneInput

    if (file) {
      const upload = await performUpload(file)

      upload.encoding = file.encoding
      upload.mimetype = file.mimetype
      cover = {
        create: {
          name: upload.name,
          encoding: upload.encoding,
          mimetype: upload.mimetype,
          createdBy: { connect: { id: userId } }
        }
      }
    }

    return ctx.db.mutation.createAlbum({
      data: {
        name,
        artists: { connect: artists },
        cover,
        createdBy: {
          connect: {
            id: userId
          }
        }
      }
    }, info)
  },

  async updateAlbum (root: {}, { id, name, artists, file }: Album & { file: Upload }, ctx: Context, info) {
    const { userId } = authorizedUser(ctx);
    ensureUserCouldWrite(userId, ctx);

    let cover: FileUpdateOneInput | null
    let disconnectArtists: ArtistWhereUniqueInput[] | null
    let connnectArtists: ArtistWhereUniqueInput[] | null

    if (file) {
      const upload = await performUpload(file)

      upload.encoding = file.encoding
      upload.mimetype = file.mimetype
      cover = {
        update: {
          name: upload.name,
          encoding: upload.encoding,
          mimetype: upload.mimetype,
          createdBy: { connect: { id: userId } }
        }
      }
    }

    if (artists.length) {
      const [ album ]: Album[] = await ctx.db.query.albums({ where: { id } }, '{ artists { id } }')
      
      const compare = (a: Artist, b: Artist) => a.id === b.id
      const diff = difference(compare)

      disconnectArtists = diff(album.artists, artists)
      connnectArtists = diff(artists, album.artists)
    }

    return ctx.db.mutation.updateAlbum({
      where: { id },
      data: {
        name,
        artists: {
          connect: [...connnectArtists],
          disconnect: [...disconnectArtists],
        },
        cover,
        createdBy: {
          connect: {
            id: userId
          }
        }
      }
    }, info)
  },

  async deleteAlbum (root: {}, { id }: Album, ctx: Context, info) {
    const { userId } = authorizedUser(ctx);
    ensureUserCouldWrite(userId, ctx);

    return ctx.db.mutation.deleteAlbum({ where: { id } }, info)
  }
}

const subscription = {}

export default {
  query,
  mutation,
  subscription,
}