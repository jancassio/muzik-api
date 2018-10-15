import { Context } from "../helpers/types";
import { Artist } from "../../generated/prisma/bindings";
import { authorizedUser, ensureUserCouldWrite } from "../helpers/session";

const query = {
  async artist(root: {}, { id }: Artist, context: Context) {
    return context.db.query.artist({ where: { id } });
  },

  async artists(root: any, args: Artist, context: Context, info) {
    return context.db.query.artists({}, info);
  }
};

const mutation = {
  async createArtist(root: {}, { name }: Artist, context: Context) {
    const { userId } = authorizedUser(context);
    ensureUserCouldWrite(userId, context);

    return context.db.mutation.createArtist({
      data: {
        name,
        createdBy: {
          connect: {
            id: userId
          }
        }
      }
    });
  },

  async updateArtist(root: {}, { id, name }: Artist, context: Context) {
    const { userId } = authorizedUser(context);
    ensureUserCouldWrite(userId, context);

    return context.db.mutation.updateArtist({ where: { id }, data: { name } });
  },

  async deleteArtist(root: {}, { id }: Artist, context: Context) {
    const { userId } = authorizedUser(context);
    ensureUserCouldWrite(userId, context);

    return context.db.mutation.deleteArtist({ where: { id } });
  }
};

const subscription = {
  createArtist: {
    async subscribe(root: {}, args: Artist, context: Context, info) {
      return context.db.subscription.artist(
        { where: { mutation_in: ["CREATED"] } },
        info
      );
    }
  },

  updateArtist: {
    async subscribe(root: {}, args: Artist, context: Context, info) {
      return context.db.subscription.artist(
        { where: { mutation_in: ["UPDATED"] } },
        info
      );
    }
  },

  deleteArtist: {
    async subscribe(root: {}, args: Artist, context: Context, info) {
      return context.db.subscription.artist(
        { where: { mutation_in: ["DELETED"] } },
        info
      );
    }
  }
};

export default {
  query,
  mutation,
  subscription
};
