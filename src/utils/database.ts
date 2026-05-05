import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

import { DATABASE_URL } from './env'

const connect = async () => {
  try {
    await mongoose.connect(DATABASE_URL, {
      dbName: 'db-event',
    })

    // Sync Index
    if (process.env.NODE_ENV !== 'production') {
      await mongoose.syncIndexes()
    }

    return Promise.resolve('Database connected!')
  } catch (error) {
    return Promise.reject(error)
  }
}

export default connect
