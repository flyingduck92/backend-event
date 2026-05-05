import { Request, Response } from 'express'
import * as yup from 'yup'

import UserModel from '../models/user.model'
import { encrypt } from '../utils/encryption'
import { generateToken } from '../utils/jwt'
import { IReqUser } from '../middlewares/auth.middleware'

const registerSchema = yup.object({
  fullname: yup
    .string()
    .trim()
    .min(1, 'Fullname is required')
    .max(100)
    .required('Fullname is required'),
  username: yup
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .matches(
      /^[A-Za-z0-9._]+$/,
      'We only accept uppercase letters, uppercase letters, numbers, period, and underscore.',
    )
    .required('Username is required'),
  email: yup
    .string()
    .trim()
    .email('Invalid email')
    .required('Email is required'),
  password: yup
    .string()
    .trim()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  passwordConfirm: yup
    .string()
    .trim()
    .required()
    .oneOf([yup.ref('password')], 'Password did not match'),
})

type registerType = yup.InferType<typeof registerSchema>

type loginType = {
  identifier: string
  password: string
}

export default {
  async register(req: Request, res: Response) {
    const { fullname, username, email, password, passwordConfirm } =
      req.body as unknown as registerType

    try {
      await registerSchema.validate(
        {
          fullname,
          username,
          email,
          password,
          passwordConfirm,
        },
        {
          abortEarly: false,
          stripUnknown: true,
        },
      )

      // Checking data duplication
      const userExist = await UserModel.findOne({
        $or: [{ email }, { username }],
      })

      if (userExist) {
        const errors: Record<string, string> = {}

        if (userExist.email === email) {
          errors.email = 'Email already exists'
        }
        if (userExist.username === username) {
          errors.username = 'Username already exists'
        }

        return res.status(400).json({
          message: 'Data Invalid',
          errors,
        })
      }

      // if ok, create one
      const result = await UserModel.create({
        fullname,
        email,
        username,
        password,
      })

      return res.status(200).json({
        message: 'Registration Success',
        data: result,
      })
    } catch (error) {
      //  fallback duplicate handler
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        return res.status(400).json({
          message: 'Data Invalid',
          errors: {
            general: 'Email or username already exists',
          },
        })
      }

      // yup validation
      if (error instanceof yup.ValidationError) {
        const errors = error.inner.reduce(
          (acc, curr) => {
            if (curr.path) acc[curr.path] = curr.message
            return acc
          },
          {} as Record<string, string>,
        )

        return res.status(400).json({
          message: 'Data Invalid',
          errors,
        })
      }

      return res.status(500).json({
        message: 'Internal Server Error',
      })
    }
  },

  async login(req: Request, res: Response) {
    const { identifier, password } = req.body as unknown as loginType

    try {
      // get user data based identifier (email/username)
      const userByIdentifier = await UserModel.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      })

      if (!userByIdentifier) {
        return res.status(403).json({
          message: 'User not found',
          data: null,
        })
      }

      // validate password
      const validatePassword: boolean =
        (await encrypt(password)) === userByIdentifier.password

      if (!validatePassword) {
        return res.status(403).json({
          message: 'Password Incorrect',
          data: null,
        })
      }

      // if Password valid, generate token
      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      })

      //  do login
      return res.status(200).json({
        message: 'Login Success',
        data: token,
      })
    } catch (error) {
      // yup validation
      if (error instanceof yup.ValidationError) {
        const errors = error.inner.reduce(
          (acc, curr) => {
            if (curr.path) acc[curr.path] = curr.message
            return acc
          },
          {} as Record<string, string>,
        )

        return res.status(400).json({
          message: 'Data Invalid',
          errors,
        })
      }

      return res.status(500).json({
        message: 'Internal Server Error',
      })
    }
  },

  async me(req: IReqUser, res: Response) {
    try {
      const user = req.user
      const result = await UserModel.findById(user?.id)

      return res.status(200).json({
        message: 'User Profile Fetched Succesfully ',
        data: result,
      })
    } catch (error) {
      // yup validation
      if (error instanceof yup.ValidationError) {
        const errors = error.inner.reduce(
          (acc, curr) => {
            if (curr.path) acc[curr.path] = curr.message
            return acc
          },
          {} as Record<string, string>,
        )

        return res.status(400).json({
          message: 'Data Invalid',
          errors,
        })
      }

      return res.status(500).json({
        message: 'Internal Server Error',
      })
    }
  },
}
