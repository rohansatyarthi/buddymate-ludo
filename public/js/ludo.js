let socket = io(window.location.href.substring(0, window.location.href.length - 7), {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000
});

const room_code = window.location.href.substring(window.location.href.length - 6);
const USERNAMES = ['Green Warrior', 'Red Fire', 'Blue Fox', 'Yellow Rhino'];
const PIECES = [];
const colors = ["green", "red", "blue", "yellow"];
let MYROOM = [];
let myid = -1;
let chance = Number(-1);
var PLAYERS = {};

var canvas = document.getElementById('theCanvas');
var ctx = canvas.getContext('2d');
canvas.height = 750;
canvas.width = 750;

let allPiecesePos = {
  0: [{ x: 50, y: 125 }, { x: 125, y: 50 }, { x: 200, y: 125 }, { x: 125, y: 200 }],
  1: [{ x: 500, y: 125 }, { x: 575, y: 50 }, { x: 650, y: 125 }, { x: 575, y: 200 }],
  2: [{ x: 500, y: 575 }, { x: 575, y: 500 }, { x: 650, y: 575 }, { x: 575, y: 650 }],
  3: [{ x: 50, y: 575 }, { x: 125, y: 500 }, { x: 200, y: 575 }, { x: 125, y: 650 }]
};

let homeTilePos = {
  0: { 0: { x: 50, y: 300 }, 1: { x: 300, y: 100 } },
  1: { 0: { x: 400, y: 50 }, 1: { x: 600, y: 300 } },
  2: { 0: { x: 650, y: 400 }, 1: { x: 400, y: 600 } },
  3: { 0: { x: 300, y: 650 }, 1: { x: 100, y: 400 } }
};

class Player {
  constructor(id) {
    this.id = String(id);
    this.myPieces = {};
    for (let i = 0; i < 4; i++) {
      this.myPieces[i] = new Piece(String(i), this.id);
    }
    this.won = 0;
  }
  draw() {
    for (let i in this.myPieces) {
      this.myPieces[i].draw();
    }
  }
  didIwin() {
    return this.won >= 4 ? 1 : 0;
  }
}

class Piece {
  constructor(i, id) {
    this.path = [];
    this.color_id = String(id);
    this.Pid = String(i);
    this.pos = -1;
    this.x = parseInt(allPiecesePos[this.color_id][this.Pid].x);
    this.y = parseInt(allPiecesePos[this.color_id][this.Pid].y);
    this.image = PIECES[this.color_id];
    switch (id) {
      case '0':
        for (let i = 0; i < 4; i++) { this.path.push(this.oneStepToRight); }
        this.path.push(this.oneStepTowards45);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop); }
        for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToRight); }
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom); }
        this.path.push(this.oneStepTowards315);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight); }
        for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToBottom); }
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft); }
        this.path.push(this.oneStepTowards225);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom); }
        for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToLeft); }
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop); }
        this.path.push(this.oneStepTowards135);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft); }
        this.path.push(this.oneStepToTop);
        for (let i = 0; i < 6; i++) { this.path.push(this.oneStepToRight); }
        break;
      case '1':
        for (let i = 0; i < 4; i++) { this.path.push(this.oneStepToBottom); }
        this.path.push(this.oneStepTowards315);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight); }
        for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToBottom); }
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft); }
        this.path.push(this.oneStepTowards225);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom); }
        for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToLeft); }
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop); }
        this.path.push(this.oneStepTowards135);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft); }
        for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToTop); }
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight); }
        this.path.push(this.oneStepTowards45);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop); }
        this.path.push(this.oneStepToRight);
        for (let i = 0; i < 6; i++) { this.path.push(this.oneStepToBottom); }
        break;
      case '2':
        for (let i = 0; i < 4; i++) { this.path.push(this.oneStepToLeft); }
        this.path.push(this.oneStepTowards225);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom); }
        for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToLeft); }
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop); }
        this.path.push(this.oneStepTowards135);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft); }
        for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToTop); }
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight); }
        this.path.push(this.oneStepTowards45);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop); }
        for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToRight); }
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom); }
        this.path.push(this.oneStepTowards315);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight); }
        this.path.push(this.oneStepToBottom);
        for (let i = 0; i < 6; i++) { this.path.push(this.oneStepToLeft); }
        break;
      case '3':
        for (let i = 0; i < 4; i++) { this.path.push(this.oneStepToTop); }
        this.path.push(this.oneStepTowards135);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft); }
        for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToTop); }
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight); }
        this.path.push(this.oneStepTowards45);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop); }
        for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToRight); }
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom); }
        this.path.push(this.oneStepTowards315);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight); }
        for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToBottom); }
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft); }
        this.path.push(this.oneStepTowards225);
        for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom); }
        this.path.push(this.oneStepToLeft);
        for (let i = 0; i < 6; i++) { this.path.push(this.oneStepToTop); }
        break;
    }
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y, 50, 50);
  }

  update(num) {
    if (this.pos !== -1 && this.pos + num <= 56) {
      for (let i = this.pos; i < this.pos + num; i++) {
        this.path[i](this.color_id, this.Pid);
        console.log('Moved piece:', this.color_id, this.Pid, this.x, this.y);
      }
      this.pos += num;
      if (this.pos === 56) {
        window.PLAYERS[this.color_id].won += 1;
      }
    } else if (num === 6 && this.pos === -1) {
      this.x = homeTilePos[this.color_id][0].x;
      this.y = homeTilePos[this.color_id][0].y;
      this.pos = 0;
    }
  }

  oneStepToRight(id, pid) {
    window.PLAYERS[id].myPieces[pid].x += 50;
    console.log('to r', this.x, this.y);
  }

  oneStepToLeft(id, pid) {
    window.PLAYERS[id].myPieces[pid].x -= 50;
    console.log('to l', this.x, this.y);
  }

  oneStepToTop(id, pid) {
    window.PLAYERS[id].myPieces[pid].y -= 50;
    console.log('to t', this.x, this.y);
  }

  oneStepToBottom(id, pid) {
    window.PLAYERS[id].myPieces[pid].y += 50;
    console.log('to b', this.x, this.y);
  }

  oneStepTowards45(id, pid) {
    window.PLAYERS[id].myPieces[pid].x += 50;
    window.PLAYERS[id].myPieces[pid].y -= 50;
    console.log('to 45', this.x, this.y);
  }

  oneStepTowards135(id, pid) {
    window.PLAYERS[id].myPieces[pid].x -= 50;
    window.PLAYERS[id].myPieces[pid].y -= 50;
    console.log('to 135', this.x, this.y);
  }

  oneStepTowards225(id, pid) {
    window.PLAYERS[id].myPieces[pid].x -= 50;
    window.PLAYERS[id].myPieces[pid].y += 50;
    console.log('to 225', this.x, this.y);
  }

  oneStepTowards315(id, pid) {
    window.PLAYERS[id].myPieces[pid].x += 50;
    window.PLAYERS[id].myPieces[pid].y += 50;
    console.log('to 315', this.x, this.y);
  }

  kill() {
    this.x = allPiecesePos[this.color_id][this.Pid].x;
    this.y = allPiecesePos[this.color_id][this.Pid].y;
    this.pos = -1;
  }
}

socket.on('connect', function() {
  console.log(`Connected with socket ID: ${socket.id}, myid: ${myid}`);
  console.log('localStorage on connect:', {
    room: window.localStorage.getItem('room'),
    started: window.localStorage.getItem('started'),
    chance: window.localStorage.getItem('chance'),
    positions: window.localStorage.getItem('positions'),
    win: window.localStorage.getItem('win')
  });
  socket.emit('fetch', room_code, function(data, id) {
    console.log(`Fetched room ${room_code}: ${data}, myid: ${id}`);
    MYROOM = data.sort((a, b) => a - b);
    for (let i = 0; i < MYROOM.length; i++) { MYROOM[i] = +MYROOM[i]; }
    myid = id;
    const localPositions = JSON.parse(window.localStorage.getItem('positions') || '{}');
    const localChance = Number(window.localStorage.getItem('chance') || -1);
    const localWin = JSON.parse(window.localStorage.getItem('win') || '{}');
    socket.emit('sync-state', {
      room: room_code,
      positions: localPositions,
      chance: localChance,
      win: localWin
    }, function(serverState) {
      console.log('Server state received:', serverState);
      if (!serverState || !serverState.positions || Object.keys(serverState.positions).length === 0) {
        console.log('Server state empty, using localStorage');
        serverState = { positions: localPositions, chance: localChance, win: localWin };
      }
      StartTheGame(serverState);
    });
  });

  if (chance === myid) {
    document.getElementById('randomButt').addEventListener('click', function(event) {
      event.preventDefault();
      console.log('randomButt clicked');
      styleButton(0);
      diceAction();
    });
  }
});

socket.on('state-updated', function(serverState) {
  console.log('State updated from server:', serverState);
  if (serverState && serverState.positions) {
    chance = Number(serverState.chance);
    window.localStorage.setItem('chance', chance.toString());
    window.localStorage.setItem('positions', JSON.stringify(serverState.positions));
    window.localStorage.setItem('win', JSON.stringify(serverState.win));
    for (let id in serverState.positions) {
      if (PLAYERS[id]) {
        for (let pid in serverState.positions[id]) {
          PLAYERS[id].myPieces[pid].x = Number(serverState.positions[id][pid].x);
          PLAYERS[id].myPieces[pid].y = Number(serverState.positions[id][pid].y);
          PLAYERS[id].myPieces[pid].pos = Number(serverState.positions[id][pid].pos);
        }
        PLAYERS[id].won = Number(serverState.win[id] || 0);
      }
    }
    allPlayerHandler();
  }
});

socket.on('imposter', () => { window.location.replace('/error-imposter'); });

socket.on('is-it-your-chance', function(data) {
  if (data === myid) {
    styleButton(1);
    outputMessage({ Name: 'your', id: data }, 4);
  } else {
    outputMessage({ Name: USERNAMES[data] + "'s", id: data }, 4);
  }
  chance = Number(data);
  window.localStorage.setItem('chance', chance.toString());
});

socket.on('new-user-joined', function(data) {
  MYROOM.push(data.id);
  MYROOM = [...new Set(MYROOM)].sort((a, b) => a - b);
  for (let i = 0; i < MYROOM.length; i++) { MYROOM[i] = +MYROOM[i]; }
  loadNewPiece(data.id);
  outputMessage({ Name: USERNAMES[data.id], id: data.id }, 0);
  document.getElementById("myModal-2").style.display = "none";
  let butt = document.getElementById('WAIT');
  butt.disabled = false;
  butt.style.opacity = 1;
  butt.style.cursor = "pointer";
  clearInterval(window.timer);
});

socket.on('user-disconnected', function(data) {
  outputMessage({ Name: USERNAMES[data], id: data }, 6);
  resumeHandler(data);
});

socket.on('resume', function(data) {
  resume(data.id);
  data.id === data.click
    ? outputMessage({ id: data.id, msg: `Resumed the game without ${USERNAMES[data.id]}` }, 5)
    : outputMessage({ id: data.click, msg: `${USERNAMES[data.click]} has resumed the game without ${USERNAMES[data.id]}` }, 5);
});

socket.on('wait', function(data) {
  wait();
  outputMessage({ id: data.click, msg: `${USERNAMES[data.click]} has decided to wait` }, 5);
});

socket.on('rolled-dice', function(data) {
  Number(data.id) !== myid
    ? outputMessage({ Name: USERNAMES[data.id], Num: data.num, id: data.id }, 1)
    : outputMessage({ Name: 'you', Num: data.num, id: data.id }, 1);
});

socket.on('Thrown-dice', async function(data) {
  console.log('Thrown-dice:', data);
  await PLAYERS[data.id].myPieces[data.pid].update(data.num);
  if (iKill(data.id, data.pid)) {
    outputMessage({ msg: 'Oops got killed', id: data.id }, 5);
    allPlayerHandler();
  } else {
    allPlayerHandler();
  }
  if (PLAYERS[data.id].didIwin()) {
    socket.emit('WON', {
      room: room_code,
      id: data.id,
      player: myid
    });
  }
});

socket.on('winner', function(data) {
  showModal(data);
});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

function outputMessage(anObject, k) {
  let msgBoard = document.querySelector('.msgBoard');
  if (k === 1 && !/[<>\\/]/.test(anObject.Name)) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p><strong>★ <span id="color-message-span1" style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.Name}</span></strong><span id="color-message-span2"> got a ${anObject.Num}</span></p>`;
    msgBoard.appendChild(div);
  } else if (k === 0 && !/[<>\\/]/.test(anObject.Name)) {
    const div = document.createElement('div');
    div.classList.add('messageFromServer');
    div.innerHTML = `<p>↝ <span id="color-message-span1" style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.Name}</span><span id="color-message-span2"> entered the game</span></p>`;
    msgBoard.appendChild(div);
  } else if (k === 3) {
    const div = document.createElement('div');
    div.classList.add('messageFromServer');
    div.innerHTML = `<span id="color-message-span2" style="text-shadow: 0 0 4px ${colors[myid]};">${anObject}!!</span>`;
    msgBoard.appendChild(div);
  } else if (k === 4) {
    const div = document.createElement('div');
    div.classList.add('messageFromServer');
    div.innerHTML = `<p><span id="color-message-span2">Its </span><span id="color-message-span1" style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.Name}</span><span id="color-message-span2"> chance!!</span></p>`;
    msgBoard.appendChild(div);
  } else if (k === 5) {
    const div = document.createElement('div');
    div.classList.add('messageFromServer');
    div.innerHTML = `<span id="color-message-span2" style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.msg}!!</span>`;
    msgBoard.appendChild(div);
  } else if (k === 6) {
    const div = document.createElement('div');
    div.classList.add('messageFromServer');
    div.innerHTML = `<p>↝ <span id="color-message-span1" style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.Name}</span><span id="color-message-span2"> just left the game</span></p>`;
    msgBoard.appendChild(div);
  }
  msgBoard.scrollTop = msgBoard.scrollHeight - msgBoard.clientHeight;
}

function styleButton(k) {
  let butt = document.getElementById("randomButt");
  if (k === 0) {
    butt.disabled = true;
    butt.style.opacity = 0.6;
    butt.style.cursor = "not-allowed";
    butt.style.backgroundImage = "linear-gradient(to bottom right, red, yellow)";
  } else if (k === 1) {
    butt.disabled = false;
    butt.style.opacity = 1;
    butt.style.cursor = "pointer";
    butt.style.backgroundImage = "linear-gradient(to bottom right, red, yellow)";
  }
}

function diceAction() {
  socket.emit('roll-dice', { room: room_code, id: myid }, function(num) {
    console.log('Dice rolled, got', num);
    let spirit = [];
    for (let i = 0; i < 4; i++) {
      if (PLAYERS[myid].myPieces[i].pos > -1 && PLAYERS[myid].myPieces[i].pos + num <= 56) {
        spirit.push(i);
      }
    }
    if (spirit.length !== 0 || num === 6) {
      outputMessage('Click on a piece', 3);
      canvas.addEventListener('click', function clickHandler(e) {
        console.log('Click event listener added to canvas');
        let Xp = e.clientX - e.target.getBoundingClientRect().left;
        let Yp = e.clientY - e.target.getBoundingClientRect().top;
        let playerObj = {
          room: room_code,
          id: myid,
          num: num
        };
        let alert1 = true;

        for (let i = 0; i < 4; i++) {
          if (
            Xp - PLAYERS[myid].myPieces[i].x < 45 &&
            Xp - PLAYERS[myid].myPieces[i].x > 0 &&
            Yp - PLAYERS[myid].myPieces[i].y < 45 &&
            Yp - PLAYERS[myid].myPieces[i].y > 0
          ) {
            console.log(`Clicked piece ${i}`);
            if ((spirit.includes(i) || num === 6) && PLAYERS[myid].myPieces[i].pos + num <= 56) {
              playerObj.pid = i;
              socket.emit('random', playerObj, function(data) {
                styleButton(0);
                console.log('random acknowledged');
                socket.emit('chance', { room: room_code, nxt_id: chanceRotation(myid, num) });
              });
              canvas.removeEventListener('click', clickHandler);
              return 0;
            } else {
              alert('Please click on a valid Piece.');
              alert1 = false;
              break;
            }
          }
        }
        if (alert1) { alert('You need to click on a piece of your color'); }
      });
    } else {
      socket.emit('chance', { room: room_code, nxt_id: chanceRotation(myid, num) });
      console.log('Next chance');
    }
  });
}

function StartTheGame(serverState) {
  console.log('Starting game with state:', serverState);
  MYROOM.forEach((numb) => {
    numb === myid
      ? outputMessage({ Name: 'You', id: numb }, 0)
      : outputMessage({ Name: USERNAMES[numb], id: numb }, 0);
  });
  document.getElementById('my-name').innerHTML += USERNAMES[myid];
  let copyText = `\n\nMy room:\n${window.location.href} \nor join the room via\nMy room code:${room_code}`;
  document.getElementById('copy').innerHTML += copyText;
  window.localStorage.setItem('room', room_code);
  if (MYROOM.length === 1) {
    styleButton(1);
    chance = Number(myid);
    window.localStorage.setItem('chance', chance.toString());
  }
  loadAllPieces(serverState);
}

function loadAllPieces(serverState) {
  console.log('Loading pieces with state:', serverState);
  let cnt = 0;
  for (let i = 0; i < colors.length; i++) {
    let img = new Image();
    img.src = "../images/pieces/" + colors[i] + ".png";
    img.onload = () => {
      ++cnt;
      if (cnt >= colors.length) {
        for (let j = 0; j < MYROOM.length; j++) {
          PLAYERS[MYROOM[j]] = new Player(MYROOM[j]);
        }
        if (serverState && serverState.positions && Object.keys(serverState.positions).length > 0) {
          console.log('Restoring from server state:', serverState);
          chance = Number(serverState.chance);
          window.localStorage.setItem('chance', chance.toString());
          window.localStorage.setItem('positions', JSON.stringify(serverState.positions));
          window.localStorage.setItem('win', JSON.stringify(serverState.win));
          for (let id in serverState.positions) {
            if (PLAYERS[id]) {
              for (let pid in serverState.positions[id]) {
                console.log(`Restoring ${id}, piece ${pid}: x=${serverState.positions[id][pid].x}, y=${serverState.positions[id][pid].y}, pos=${serverState.positions[id][pid].pos}`);
                PLAYERS[id].myPieces[pid].x = Number(serverState.positions[id][pid].x);
                PLAYERS[id].myPieces[pid].y = Number(serverState.positions[id][pid].y);
                PLAYERS[id].myPieces[pid].pos = Number(serverState.positions[id][pid].pos);
              }
              PLAYERS[id].won = Number(serverState.win[id] || 0);
            }
          }
        } else if (window.localStorage.getItem('room') === room_code && window.localStorage.getItem('started') === 'true') {
          console.log('Restoring from localStorage');
          chance = Number(window.localStorage.getItem('chance') || -1);
          let positions = JSON.parse(window.localStorage.getItem('positions') || '{}');
          let win = JSON.parse(window.localStorage.getItem('win') || '{}');
          for (let i = 0; i < MYROOM.length; i++) {
            if (positions[MYROOM[i]]) {
              PLAYERS[MYROOM[i]].won = Number(win[MYROOM[i]] || 0);
              for (let j = 0; j < 4; j++) {
                console.log(`Restoring ${MYROOM[i]}, piece ${j}: x=${positions[MYROOM[i]][j].x}, y=${positions[MYROOM[i]][j].y}, pos=${positions[MYROOM[i]][j].pos}`);
                PLAYERS[MYROOM[i]].myPieces[j].x = Number(positions[MYROOM[i]][j].x);
                PLAYERS[MYROOM[i]].myPieces[j].y = Number(positions[MYROOM[i]][j].y);
                PLAYERS[MYROOM[i]].myPieces[j].pos = Number(positions[MYROOM[i]][j].pos);
              }
            }
          }
          socket.emit('sync-state', {
            room: room_code,
            positions,
            chance,
            win
          }, function(updatedServerState) {
            console.log('Local state synced to server:', updatedServerState);
          });
        }
        allPlayerHandler();
      }
    };
    PIECES.push(img);
  }
}

function chanceRotation(id, num) {
  if (num === 6) {
    console.log('Next chance (num==6):', id);
    return id;
  } else {
    let c = MYROOM[chance + 1];
    if (c) {
      console.log('Next chance (MYROOM[chance+1]):', c, 'MYROOM:', MYROOM, 'Previous chance:', chance);
      return c;
    } else {
      console.log('Next chance (MYROOM[0]):', MYROOM[0], 'MYROOM:', MYROOM, 'Previous chance:', chance);
      return MYROOM[0];
    }
  }
}

function allPlayerHandler() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < MYROOM.length; i++) {
    if (PLAYERS[MYROOM[i]]) {
      PLAYERS[MYROOM[i]].draw();
    }
  }
  let positions = {};
  let win = {};
  for (let i = 0; i < MYROOM.length; i++) {
    if (PLAYERS[MYROOM[i]]) {
      positions[MYROOM[i]] = {};
      win[MYROOM[i]] = PLAYERS[MYROOM[i]].won;
      for (let j = 0; j < 4; j++) {
        positions[MYROOM[i]][j] = {
          x: PLAYERS[MYROOM[i]].myPieces[j].x,
          y: PLAYERS[MYROOM[i]].myPieces[j].y,
          pos: PLAYERS[MYROOM[i]].myPieces[j].pos
        };
      }
    }
  }
  window.localStorage.setItem('started', 'true');
  window.localStorage.setItem('chance', chance.toString());
  window.localStorage.setItem('positions', JSON.stringify(positions));
  window.localStorage.setItem('win', JSON.stringify(win));
  socket.emit('sync-state', {
    room: room_code,
    positions,
    chance,
    win
  }, function(serverState) {
    console.log('State synced to server:', serverState);
  });
}

function loadNewPiece(id) {
  PLAYERS[id] = new Player(id);
  if (window.localStorage.getItem('room') === room_code && window.localStorage.getItem('started')) {
    console.log('Restoring new player from localStorage');
    let positions = JSON.parse(window.localStorage.getItem('positions') || '{}');
    let win = JSON.parse(window.localStorage.getItem('win') || '{}');
    if (positions[id]) {
      console.log(`Restoring player ${id}: ${JSON.stringify(positions[id])}`);
      PLAYERS[id].won = Number(win[id] || 0);
      for (let j = 0; j < 4; j++) {
        console.log(`Restoring ${id}, piece ${j}: x=${positions[id][j].x}, y=${positions[id][j].y}, pos=${positions[id][j].pos}`);
        PLAYERS[id].myPieces[j].x = Number(positions[id][j].x);
        PLAYERS[id].myPieces[j].y = Number(positions[id][j].y);
        PLAYERS[id].myPieces[j].pos = Number(positions[id][j].pos);
      }
    }
  }
  socket.emit('sync-state', {
    room: room_code,
    positions: { [id]: Object.fromEntries(Object.entries(PLAYERS[id].myPieces).map(([pid, piece]) => [pid, { x: piece.x, y: piece.y, pos: piece.pos }])) },
    win: { [id]: PLAYERS[id].won }
  }, function(serverState) {
    console.log('New player state synced:', serverState);
    if (serverState.positions[id]) {
      for (let pid in serverState.positions[id]) {
        PLAYERS[id].myPieces[pid].x = Number(serverState.positions[id][pid].x);
        PLAYERS[id].myPieces[pid].y = Number(serverState.positions[id][pid].y);
        PLAYERS[id].myPieces[pid].pos = Number(serverState.positions[id][pid].pos);
      }
      PLAYERS[id].won = Number(serverState.win[id] || 0);
    }
    allPlayerHandler();
  });
}

function iKill(id, pid) {
  let boss = PLAYERS[id].myPieces[pid];
  for (let i = 0; i < MYROOM.length; i++) {
    for (let j = 0; j < 4; j++) {
      if (
        MYROOM[i] !== id &&
        boss.x === PLAYERS[MYROOM[i]].myPieces[j].x &&
        boss.y === PLAYERS[MYROOM[i]].myPieces[j].y
      ) {
        if (!inAhomeTile(id, pid)) {
          PLAYERS[MYROOM[i]].myPieces[j].kill();
          return 1;
        }
      }
    }
  }
  return 0;
}

function inAhomeTile(id, pid) {
  for (let i = 0; i < 4; i++) {
    if (
      (PLAYERS[id].myPieces[pid].x === homeTilePos[i][0].x &&
       PLAYERS[id].myPieces[pid].y === homeTilePos[i][0].y) ||
      (PLAYERS[id].myPieces[pid].x === homeTilePos[i][1].x &&
       PLAYERS[id].myPieces[pid].y === homeTilePos[i][1].y)
    ) {
      return true;
    }
  }
  return false;
}

function showModal(id) {
  window.localStorage.clear();
  document.getElementById("myModal-1").style.display = "block";
  document.getElementById("win-win").innerHTML = `The winner is ${USERNAMES[id]}`;
}

async function copyhandler() {
  var copyText = document.getElementById("copy").innerHTML;
  await navigator.clipboard.writeText(copyText);
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copied!!";
}

function outFunc() {
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copy to clipboard";
}

async function copyhandlerLink() {
  var copyText = window.location.href;
  await navigator.clipboard.writeText(copyText);
  var tooltip = document.getElementById("myTooltipLink");
  tooltip.innerHTML = "Copied!!";
}

function outFuncLink() {
  var tooltip = document.getElementById("myTooltipLink");
  tooltip.innerHTML = "Copy room link to clipboard";
}

function resumeHandler(id) {
  document.getElementById("myModal-2").style.display = "block";
  let theOneWhoLeft = document.getElementById('theOneWhoLeft');
  let seconds = document.getElementById('seconds');
  let i = 10;
  theOneWhoLeft.innerHTML = USERNAMES[id];
  theOneWhoLeft.style.textShadow = `0 0 4px ${colors[id]}`;
  document.getElementById('RESUME').onclick = function() {
    resume(id);
    socket.emit('resume', {
      room: room_code,
      id: id,
      click: myid
    }, function() {
      outputMessage({ id: myid, msg: `You have resumed the game without ${USERNAMES[id]}` }, 5);
      if (chance === id) {
        socket.emit('chance', { room: room_code, nxt_id: chanceRotation(id, 0) });
      }
    });
  };
  document.getElementById('WAIT').onclick = function() {
    wait();
    socket.emit('wait', {
      room: room_code,
      click: myid
    }, function() {
      outputMessage({ id: myid, msg: `You have decided to wait` }, 5);
    });
  };
  window.timer = setInterval(function() {
    i -= 1;
    seconds.innerHTML = ` in ${i}`;
    if (i === 0) {
      resume(id);
      socket.emit('resume', {
        room: room_code,
        id: id,
        click: id
      }, function() {
        outputMessage({ id: id, msg: `Resumed the game without ${USERNAMES[id]}` }, 5);
        if (chance === id) {
          socket.emit('chance', { room: room_code, nxt_id: chanceRotation(id, 0) });
        }
      });
    }
  }, 1000);
}

function resume(id) {
  document.getElementById("myModal-2").style.display = "none";
  clearInterval(window.timer);
  MYROOM.splice(MYROOM.indexOf(id), 1);
  delete PLAYERS[id];
  allPlayerHandler();
}

function wait() {
  clearInterval(window.timer);
  document.getElementById('seconds').innerHTML = '';
  let butt = document.getElementById('WAIT');
  if (butt) {
    butt.disabled = true;
    butt.style.opacity = '0.6';
    butt.style.cursor = 'not-allowed';
  }
}
