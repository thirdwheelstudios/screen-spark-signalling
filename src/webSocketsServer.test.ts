import { Server } from 'socket.io'
import { createWebSocketsServer } from './webSocketsServer'

jest.mock('socket.io')

const onConnectMock = jest.spyOn(Server.prototype, 'on')

describe('web sockets server', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creates a http server instance', () => {
    const server = createWebSocketsServer()

    expect(server).not.toBeNull()
  })

  test('creates a socket.io Server instance', () => {
    createWebSocketsServer()

    expect(Server).toBeCalledTimes(1)
  })

  test('configures CORS origins', () => {
    createWebSocketsServer()

    expect(Server).toBeCalledWith(expect.anything(), {
      cors: {
        origin: [
          'https://screenspark.co.uk',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
        ],
      },
    })
  })

  test('connects to socket.io', () => {
    createWebSocketsServer()

    expect(onConnectMock).toBeCalledWith('connect', expect.anything())
  })
})
