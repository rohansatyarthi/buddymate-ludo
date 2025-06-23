const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 5 * 60 * 1000, // 5 minutes for Render
    skipMiddlewares: true
  }
});
const port = process.env.PORT || 3000;

// Define paths
const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, 'public');
console.log(`Views directory path: ${viewsPath}`);
console.log(`Public directory path: ${publicPath}`);

// Check if directories exist
if (!fs.existsSync(viewsPath)) {
  console.error(`Views directory not found at ${viewsPath}`);
}
if (!fs.existsSync(publicPath)) {
  console.error(`Public directory not found at ${publicPath}`);
}

// Session middleware with hardcoded secret
const sessionMiddleware = session({
  secret: 'buddymate-ludo-2025',
  resave: false,
  saveUninitialized: false,
  store: new (require('express-session').MemoryStore)(),
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
});

// Use session middleware for Express
app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));

// Room management: Map<roomCode, { players: Map<sessionId, { id: number, socketId: string }>, idCounter: number, gameState: { positions: {}, chance: number, win: {} } }>
const rooms = new Map();

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Serve index.html
app.get('/', (req, res) => {
  const indexPath = path.join(viewsPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log(`Serving index.html from ${indexPath}`);
    res.sendFile(indexPath);
  } else {
    console.error(`index.html not found at ${indexPath}`);
    res.status(404).send('Error: index.html not found');
  }
});

// Handle room creation/joining
app.post('/', (req, res) => {
  const action = req.body.action_to_do;
  let roomCode = req.body.roomcode?.toUpperCase();

  if (action === 'create') {
    roomCode = generateRoomCode();
    while (rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }
    rooms.set(roomCode, {
      players: new Map(),
      idCounter: 0,
      gameState: { positions: {}, chance: -1, win: {} }
    });
    const playerId = 0;
    req.session.roomCode = roomCode;
    req.session.playerId = playerId;
    req.session.sessionId = req.sessionID;
    rooms.get(roomCode).players.set(req.sessionID, { id: playerId, socketId: null });
    rooms.get(roomCode).gameState.positions[playerId] = {};
    rooms.get(roomCode).gameState.win[playerId] = 0;
    console.log(`Created room ${roomCode} with player ID ${playerId}, session ${req.sessionID}`);
    res.redirect(`/${roomCode}`);
  } else if (action === 'join' && roomCode && rooms.has(roomCode)) {
    const room = rooms.get(roomCode);
    if (room.players.size < 4) {
      const playerId = room.idCounter + 1;
      room.players.set(req.sessionID, { id: playerId, socketId: null });
      room.idCounter = playerId;
      req.session.roomCode = roomCode;
      req.session.playerId = playerId;
      req.session.sessionId = req.sessionID;
      rooms.get(roomCode).gameState.positions[playerId] = {};
      rooms.get(roomCode).gameState.win[playerId] = 0;
      console.log(`Player ID ${playerId} joined room ${roomCode}, session ${req.sessionID}`);
      res.redirect(`/${roomCode}`);
    } else {
      res.redirect('/error-imposter');
    }
  } else {
    res.redirect('/error-imposter');
  }
});

// Serve ludo.html for room URLs
app.get('/:roomCode', (req, res) => {
  const roomCode = req.params.roomCode.toUpperCase();
  if (rooms.has(roomCode)) {
    const ludoPath = path.join(viewsPath, 'ludo.html');
    if (fs.existsSync(ludoPath)) {
      console.log(`Serving ludo.html from ${ludoPath}`);
      res.sendFile(ludoPath);
    } else {
      console.error(`ludo.html not found at ${ludoPath}`);
      res.status(404).send('Error: ludo.html not found');
    }
  } else {
    res.redirect('/error-imposter');
  }
});

// Share session with Socket.IO
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// Socket.IO events
io.on('connection', (socket) => {
  const session = socket.request.session;
  const roomCode = session.roomCode;
  const playerId = session.playerId;
  const sessionId = session.sessionId;

  console.log(`Socket connected: ${socket.id}, Session: ${sessionId}, Room: ${roomCode}, Player ID: ${playerId}`);

  if (!roomCode || !rooms.has(roomCode) || playerId === undefined || !rooms.get(roomCode).players.has(sessionId)) {
    socket.emit('imposter');
    socket.disconnect();
    return;
  }

  rooms.get(roomCode).players.set(sessionId, { id: playerId, socketId: socket.id });
  socket.join(roomCode);

  socket.on('fetch', (room, callback) => {
    if (room === roomCode) {
      const roomData = rooms.get(roomCode);
      const playerIds = Array.from(roomData.players.values()).map(p => p.id).sort((a, b) => a - b);
      console.log(`Fetch for room ${roomCode}: ${playerIds}, returning myid: ${playerId}`);
      callback(playerIds, playerId);
    }
  });

  socket.on('sync-state', ({ room, positions, chance, win }, callback) => {
    if (room === roomCode) {
      const roomData = rooms.get(roomCode);
      if (positions) {
        roomData.gameState.positions = { ...roomData.gameState.positions, ...positions };
      }
      if (chance !== undefined) {
        roomData.gameState.chance = Number(chance);
      }
      if (win) {
        roomData.gameState.win = { ...roomData.gameState.win, ...win };
      }
      console.log(`Sync-state for room ${roomCode}: positions=${JSON.stringify(roomData.gameState.positions)}, chance=${roomData.gameState.chance}, win=${JSON.stringify(roomData.gameState.win)}`);
      callback(roomData.gameState);
      io.to(roomCode).emit('state-updated', roomData.gameState);
    }
  });

  socket.on('roll-dice', ({ room, id }, callback) => {
    if (room === roomCode && id === playerId) {
      const num = Math.floor(Math.random() * 6) + 1;
      io.to(roomCode).emit('rolled-dice', { id, num });
      console.log(`Player ${playerId} in room ${roomCode} rolled ${num}`);
      callback(num);
    }
  });

  socket.on('random', ({ room, id, pid, num }, callback) => {
    if (room === roomCode && id === playerId) {
      io.to(roomCode).emit('Thrown-dice', { id, pid, num, room });
      console.log(`Player ${playerId} moved piece ${pid} by ${num} in room ${roomCode}`);
      callback(true);
    }
  });

  socket.on('chance', ({ room, nxt_id }) => {
    if (room === roomCode) {
      rooms.get(roomCode).gameState.chance = Number(nxt_id);
      io.to(roomCode).emit('is-it-your-chance', nxt_id);
      console.log(`Chance passed to player ${nxt_id} in room ${roomCode}`);
    }
  });

  socket.on('WON', ({ room, id, player }) => {
    if (room === roomCode && id === playerId) {
      rooms.get(roomCode).gameState.win[id] = (rooms.get(roomCode).gameState.win[id] || 0) + 1;
      io.to(roomCode).emit('winner', id);
      console.log(`Player ${playerId} won in room ${roomCode}`);
    }
  });

  socket.on('resume', ({ room, id, click }, callback) => {
    if (room === roomCode && click === playerId) {
      io.to(roomCode).emit('resume', { id, click });
      console.log(`Player ${click} resumed game without ${id} in room ${roomCode}`);
      callback();
    }
  });

  socket.on('wait', ({ room, click }, callback) => {
    if (room === roomCode && click === playerId) {
      io.to(roomCode).emit('wait', { click });
      console.log(`Player ${click} chose to wait in room ${roomCode}`);
      callback();
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}, Player ID: ${playerId}, Room: ${roomCode}`);
    if (roomCode && rooms.has(roomCode)) {
      io.to(roomCode).emit('user-disconnected', playerId);
      setTimeout(() => {
        if (rooms.has(roomCode) && !Array.from(rooms.get(roomCode).players.values()).some(p => p.socketId)) {
          rooms.delete(roomCode);
          console.log(`Room ${roomCode} deleted due to inactivity`);
        }
      }, 10 * 60 * 1000);
    }
  });

  // Send initial game state on connect
  const roomData = rooms.get(roomCode);
  socket.emit('state-updated', roomData.gameState);
  io.to(roomCode).emit('new-user-joined', { id: playerId });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
