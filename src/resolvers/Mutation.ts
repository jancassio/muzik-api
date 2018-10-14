import artist from './artist'
import user from './user'

const Mutation = {
  ...artist.mutation,
  ...user.mutation,
}

export default Mutation
