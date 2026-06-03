let io = null;

function init(server, options = {}) {
  try {
    const { Server } = require('socket.io');
    io = new Server(server, Object.assign({
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'https://cosy-ten.vercel.app',
        ],
        credentials: true,
      }
    }, options));

    io.on('connection', (socket) => {
      try {
        socket.on('join', ({ userId }) => {
          if (userId) socket.join(`user:${userId}`);
        });

        socket.on('joinConversation', ({ conversationId }) => {
          if (conversationId) socket.join(`conversation:${conversationId}`);
        });

        socket.on('leaveConversation', ({ conversationId }) => {
          if (conversationId) socket.leave(`conversation:${conversationId}`);
        });

        socket.on('disconnect', () => {
          // noop for now
        });
      } catch (err) {
        // swallow
      }
    });
  } catch (err) {
    console.error('Failed to init socket.io', err?.message || err);
  }
}

function getIo() {
  return io;
}

module.exports = { init, getIo };
