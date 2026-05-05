import dotenv from 'dotenv'
import express from 'express'
import router from './routes/api'
dotenv.config()

import db from './utils/database'

async function init() {
  try {
    const result = await db()

    console.log('Database status:', result)

    const app = express()
    const PORT = process.env.PORT || 3000

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use('/api', router)

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.log(error)
  }
}

init()
