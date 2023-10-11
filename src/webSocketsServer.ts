import { createServer } from 'http'
import { Server } from 'socket.io'
import { apiKeyMiddleware } from './apiKeyMiddleware'

const createWebSocketsServer = () => {
  const corsOrigins =
    process.env.CORS_ORIGINS ??
    'https://screenspark.co.uk,http://localhost:5173,http://127.0.0.1:5173'

  const httpServer = createServer()
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins.split(','),
    },
  })

  io.use(apiKeyMiddleware)

  io.on('connect', (socket) => {
    console.log(`connect ${socket.id}`)

    const roomName = (shareId: string, isBroadcasting: boolean) => {
      return `${shareId}-${isBroadcasting ? 'broadcaster' : 'viewer'}`
    }

    socket.on(
      'connectToShareId',
      (shareId: string, isBroadcasting: boolean) => {
        socket.join(roomName(shareId, isBroadcasting))
      }
    )

    socket.on(
      'iceCandidate',
      (
        shareId: string,
        isBroadcasting: boolean,
        candidate: RTCIceCandidate
      ) => {
        io.to(roomName(shareId, isBroadcasting)).emit('iceCandidate', candidate)
      }
    )

    socket.on(
      'sdp',
      (
        shareId: string,
        isBroadcasting: boolean,
        sdp: RTCSessionDescription | null
      ) => {
        io.to(roomName(shareId, isBroadcasting)).emit('sdp', sdp)
      }
    )

    socket.on('disconnect', () => {
      console.log(`disconnect ${socket.id}`)
    })
  })

  return httpServer
}

export { createWebSocketsServer }
