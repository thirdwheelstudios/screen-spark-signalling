import { createWebSocketsServer } from './webSocketsServer'

const port = process.env.port ?? '8080'

const server = createWebSocketsServer()

server.listen(Number(port))
