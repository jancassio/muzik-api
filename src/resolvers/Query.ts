import { about } from './about'
import artist from './artist'
import album from './album';

const Query = {
  about,
  ...artist.query,
  ...album.query,
}

export default Query
