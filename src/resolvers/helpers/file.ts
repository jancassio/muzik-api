import { createWriteStream } from 'fs'
import { generate } from 'shortid'
import { Stream } from 'stream';

export interface Upload {
  stream: Stream
  filename: string
  mimetype: string
  encoding: string
}

export interface UploadInfo {
  name: string
  mimetype?: string
  encoding?: string
}

export const performUpload = ({ stream, filename, encoding }: Upload): Promise<UploadInfo> => new Promise((resolve, reject) => {
  const id = generate()
  const name = `${id}-${filename}`
  const path = `${process.env.MUSIK_UPLOAD_PATH}/${name}`

  stream.pipe(createWriteStream(path, { encoding }))
    .on('finish', () => resolve({ name }))
    .on('error', reject)
})