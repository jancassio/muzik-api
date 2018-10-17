import { about } from './about'
import artist from './artist'
import album from './album';
import track from './track'

const Query = {
  about,
  ...artist.query,
  ...album.query,
  ...track.query,
}

export default Query
