import mongoose from 'mongoose'
import { encrypt } from '../utils/encryption'
import { renderMailHtml, sendMail } from '../utils/mail/mail'
import { CLIENT_HOST, EMAIL_SMTP_USER } from '../utils/env'

export interface User {
  fullname: string
  username: string
  email: string
  password: string
  role: string
  profilePicture: string
  isActive: boolean
  activationCode: string
  createdAt?: string
}

const Schema = mongoose.Schema

const UserSchema = new Schema<User>(
  {
    fullname: {
      type: Schema.Types.String,
      required: true,
    },
    username: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
    },
    role: {
      type: Schema.Types.String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    profilePicture: {
      type: Schema.Types.String,
      default: 'user.jpg',
    },
    isActive: {
      type: Schema.Types.Boolean,
      default: false,
    },
    activationCode: {
      type: Schema.Types.String,
    },
  },
  {
    timestamps: true,
  },
)

UserSchema.pre('save', async function () {
  const user = this

  if (!user.isModified('password')) return

  user.password = await encrypt(user.password)
  user.activationCode = await encrypt(user.id)
})

UserSchema.post('save', async function (doc) {
  try {
    const user = doc

    const contentMail = await renderMailHtml('registration-success.ejs', {
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      createdAt: user.createdAt,
      activationLink: `${CLIENT_HOST}/auth/activation?code=${user.activationCode}`,
    })

    await sendMail({
      from: `Account Activation <${EMAIL_SMTP_USER}>`,
      to: user.email,
      subject: 'Aktivasi Akun Anda',
      html: contentMail,
    })
  } catch (error) {
    console.log('error:', error)
  }
})

// remove password field when request user data
UserSchema.set('toJSON', {
  transform: (_, user) => {
    const { password, activationCode, ...rest } = user
    return {
      ...rest,
    }
  },
})

const UserModel = mongoose.model('User', UserSchema)

export default UserModel
