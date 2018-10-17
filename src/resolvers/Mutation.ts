import album from './album'
import artist from './artist'
import user from './user'

const Mutation = {
  ...album.mutation,
  ...artist.mutation,
  ...user.mutation,
}

export default Mutation
