import { createServer } from 'http'
import { Server } from 'socket.io'
import { apiKeyMiddleware } from './apiKeyMiddleware'

const createWebSocketsServer = () => {
  const corsOrigins =
    process.env.CORS_ORIGINS ??
    'https://screenspark.co.uk,http://localhost:5173,http://127.0.0.1:5173,https://screenspark.netlify.app,https://screen-spark-web.pages.dev'

  const httpServer = createServer()
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins.split(','),
    },
  })

  io.use(apiKeyMiddleware)

  io.on('connect', (socket) => {
    console.log(`connect ${socket.id}`)

    const getRoomName = (shareId: string, isBroadcasting: boolean) => {
      return `${shareId}-${isBroadcasting ? 'broadcaster' : 'viewer'}`
    }

    socket.on('connectToShareAsViewer', async (shareId: string) => {
      await socket.join(getRoomName(shareId, false))

      io.to(getRoomName(shareId, false)).emit('viewerConnected')
    })

    socket.on(
      'connectToShareAsBroadcaster',
      async (shareId: string, deviceName?: string, userAgent?: string) => {
        await socket.join(getRoomName(shareId, true))

        io.to(getRoomName(shareId, false)).emit('broadcasterConnected', {
          deviceName,
          userAgent,
        })
      }
    )

    socket.on('startBroadcasting', (shareId: string) => {
      io.to(getRoomName(shareId, true)).emit('startBroadcasting')
     })

    socket.on(
      'iceCandidate',
      (
        shareId: string,
        isBroadcasting: boolean,
        candidate: RTCIceCandidate
      ) => {
        io.to(getRoomName(shareId, isBroadcasting)).emit(
          'iceCandidate',
          candidate
        )
      }
    )

    socket.on(
      'sdp',
      (
        shareId: string,
        isBroadcasting: boolean,
        sdp: RTCSessionDescription | null
      ) => {
        io.to(getRoomName(shareId, isBroadcasting)).emit('sdp', sdp)
      }
    )

    socket.on('disconnect', () => {
      console.log(`disconnect ${socket.id}`)
    })
  })

  return httpServer
}

export { createWebSocketsServer }
