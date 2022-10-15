import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'

const apiKeyMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) => {
  const apiKey = socket.request.headers['x-api-key']
  const apiKeyIsValid = !apiKey ? null : apiKey === process.env.API_KEY

  if (apiKeyIsValid) {
    next()
  } else {
    next(
      new Error(
        `${apiKeyIsValid === null ? 'No' : 'Invalid'} x-api-key header supplied`
      )
    )
  }
}

export { apiKeyMiddleware }
