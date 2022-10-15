import { createServer } from 'http'
import express from 'express'
import { Server } from 'socket.io'
import { apiKeyMiddleware } from './apiKeyMiddleware'

const createWebSocketsServer = () => {
  const corsOrigins =
    process.env.corsOrigins ??
    'https://screenspark.co.uk,http://localhost:5173,http://127.0.0.1:5173'

  const app: express.Application = express()

  app.use(apiKeyMiddleware)

  app.get('/*', (req, res) => {
    res.sendStatus(400)
  })

  const httpServer = createServer(app)
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins.split(','),
    },
  })

  io.on('connect', (socket) => {
    console.log(`connect ${socket.id}`)

    socket.on('connectToReceiver', (receiverId: string) => {
      io.to(receiverId).emit('senderConnected', socket.id)
    })

    socket.on(
      'iceCandidate',
      (receiverId: string, candidate: RTCIceCandidate) => {
        io.to(receiverId).emit('iceCandidate', candidate)
      }
    )

    socket.on(
      'sdp',
      (receiverId: string, sdp: RTCSessionDescription | null) => {
        io.to(receiverId).emit('sdp', sdp)
      }
    )

    socket.on('disconnect', () => {
      console.log(`disconnect ${socket.id}`)
    })
  })

  return httpServer
}

export { createWebSocketsServer }
