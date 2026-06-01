import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'

import router from './routes/api'
import db from './utils/database'
import docs from './docs/route'

async function init() {
  try {
    const result = await db()

    console.log('Database status:', result)

    const app = express()
    const PORT = process.env.PORT || 3000

    app.use(express.json())
    app.use(cors())
    app.use(express.urlencoded({ extended: true }))
    app.use('/api', router)
    docs(app)

    app.get('/', (req, res) => {
      return res.status(200).json({
        message: 'Server is running',
        data: null,
      })
    })

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.log(error)
  }
}

init()
