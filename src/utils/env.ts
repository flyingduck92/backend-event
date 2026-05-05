import dotenv from 'dotenv'
dotenv.config()

export const DATABASE_URL: string = process.env.DATABASE_URL || ''
export const SECRET: string = process.env.SECRET || ''
export const NODE_ENV: string = process.env.NODE_ENV || ''
