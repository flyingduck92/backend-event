import dotenv from 'dotenv'
import express from 'express'
import router from './routes/api'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', router)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
