import { createServer } from 'http'
import { Server } from 'socket.io'
import { apiKeyMiddleware } from './apiKeyMiddleware'

const createWebSocketsServer = () => {
  const corsOrigins =
    process.env.corsOrigins ??
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

    socket.on('connectToShareId', (shareId: string) => {
      socket.join(shareId)
    })

    socket.on('iceCandidate', (shareId: string, candidate: RTCIceCandidate) => {
      io.to(shareId).emit('iceCandidate', candidate)
    })

    socket.on('sdp', (shareId: string, sdp: RTCSessionDescription | null) => {
      io.to(shareId).emit('sdp', sdp)
    })

    socket.on('disconnect', () => {
      console.log(`disconnect ${socket.id}`)
    })
  })

  return httpServer
}

export { createWebSocketsServer }
