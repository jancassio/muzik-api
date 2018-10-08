import { about } from './about'
import artist from './artist'

const Query = {
  about,
  ...artist.query
}

export default Query
