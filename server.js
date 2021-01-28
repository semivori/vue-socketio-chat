const httpServer = require('http').createServer()

const io = require('socket.io')(httpServer, {
    cors: {
        origin: 'http://localhost:8080',
        methods: ['GET', 'POST'],
    },
})

io.on('connection', (socket) => {
    const roomId = socket.handshake.query.roomId

    if (!roomId) {
        return
    }

    console.log(`join: \t ${roomId}`)
    socket.join(roomId)

    socket.onAny((event, data) => {
        console.log(`got: \t ${event}, \t room: ${roomId}`);
        console.log(`emit: \t ${event}, \t room ${roomId}`)

        io.to(roomId).emit(event, data.payload)
    });
})

httpServer.listen(2021)