import { Request, Response, NextFunction } from 'express'

const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key']
  const apiKeyIsValid = !apiKey ? null : apiKey === process.env.API_KEY

  if (apiKeyIsValid) {
    next()
  } else {
    res.status(401)
    res.send(
      `${apiKeyIsValid === null ? 'No' : 'Invalid'} x-api-key header supplied`
    )
  }
}

export { apiKeyMiddleware }
