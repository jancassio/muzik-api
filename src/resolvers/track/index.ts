import { Track, ArtistWhereUniqueInput, Album, Artist } from '../../generated/prisma/bindings'
import { Context } from "../helpers/types";
import { authorizedUser, ensureUserCouldWrite } from '../helpers/session';
import { difference } from '../../helpers/list';

const query = {
  async track (root: {}, { id }: Track, ctx: Context, info) {
    return ctx.db.query.track({ where: { id } }, info)
  },

  async tracks (root: {}, args: Track, ctx: Context, info) {
    return ctx.db.query.tracks({}, info)
  },
}

const mutation = {
  async createTrack (root: {}, { name, album, artists }: Track, ctx: Context, info) {
    const { userId } = authorizedUser(ctx);
    ensureUserCouldWrite(userId, ctx);

    return ctx.db.mutation.createTrack({
      data: {
        name,
        album: { connect: { id: album.id }},
        artists: { connect: artists },
        createdBy: {
          connect: {
            id: userId
          }
        }
      }
    }, info)
  },

  async updateTrack (root: {}, { id, name, album, artists }: Track, ctx: Context, info) {
    const { userId } = authorizedUser(ctx);
    ensureUserCouldWrite(userId, ctx);

    let disconnectArtists: ArtistWhereUniqueInput[] | null
    let connnectArtists: ArtistWhereUniqueInput[] | null

    if (artists.length) {
      const [ album ]: Album[] = await ctx.db.query.tracks({ where: { id } }, '{ artists { id } }')
      
      const compare = (a: Artist, b: Artist) => a.id === b.id
      const diff = difference(compare)

      disconnectArtists = diff(album.artists, artists)
      connnectArtists = diff(artists, album.artists)
    }

    return ctx.db.mutation.updateTrack({
      where: { id },
      data: {
        name,
        artists: {
          connect: connnectArtists,
          disconnect: disconnectArtists,
        },
        album: {
          connect: { id: album.id },
        },
      },
    }, info)
  },

  async deleteTrack (root: {}, { id }: Track, ctx: Context, info) {
    const { userId } = authorizedUser(ctx);
    ensureUserCouldWrite(userId, ctx);
    return ctx.db.mutation.deleteTrack({ where: { id } })
  },
}

const subscription = {

}

export default {
  query,
  mutation,
  subscription,
}