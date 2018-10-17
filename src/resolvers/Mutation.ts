import album from './album'
import artist from './artist'
import track from './track'
import user from './user'

const Mutation = {
  ...album.mutation,
  ...artist.mutation,
  ...track.mutation,
  ...user.mutation,
}

export default Mutation
