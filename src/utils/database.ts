import mongoose from 'mongoose'

import { DATABASE_URL, NODE_ENV } from './env'

const connect = async () => {
  try {
    await mongoose.connect(DATABASE_URL, {
      dbName: 'db-event',
    })

    // Sync Index
    if (NODE_ENV !== 'production') {
      await mongoose.syncIndexes()
    }

    return Promise.resolve('Database connected!')
  } catch (error) {
    return Promise.reject(error)
  }
}

export default connect
