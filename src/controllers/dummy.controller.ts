import { Request, Response } from 'express'

export default {
  dummy(req: Request, res: Response) {
    res.status(200).json({
      message: 'Success hit endpoint dummy - updated using BASE_URL postman',
      data: 'OK!',
    })
  },
}
