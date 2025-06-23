let socket = io(window.location.href.substring(0, window.location.href.length - 7));

const room_code = window.location.href.split('/ludo/').pop()?.substring(0, 6) || generateNewRoomCode();
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
    0: [{x: 50, y: 125}, {x: 125, y: 50}, {x: 200, y: 125}, {x: 125, y: 200}],
    1: [{x: 500, y: 125}, {x: 575, y: 50}, {x: 650, y: 125}, {x: 575, y: 200}],
    2: [{x: 500, y: 575}, {x: 575, y: 500}, {x: 650, y: 575}, {x: 575, y: 650}],
    3: [{x: 50, y: 575}, {x: 125, y: 500}, {x: 200, y: 575}, {x: 125, y: 650}]
}

let homeTilePos = {
    0: {0: {x: 50, y: 300}, 1: {x: 300, y: 100}},
    1: {0: {x: 400, y: 50}, 1: {x: 600, y: 300}},
    2: {0: {x: 650, y: 400}, 1: {x: 400, y: 600}},
    3: {0: {x: 300, y: 650}, 1: {x: 100, y: 400}}
}

class Player {
    constructor(id) {
        this.id = String(id);
        this.myPieces = new Object();
        for (let i = 0; i < 4; i++) {
            this.myPieces[i] = new Piece(String(id), String(i));
        }
        this.won = parseInt(0);
    }
    draw() {
        for (let i = 0; i < 4; i++) {
            this.myPieces[i].draw();
        }
    }

    didIwin() {
        if (this.won == 4) {
            return 1;
        } else {
            return 0;
        }
    }
}

class Piece {
    constructor(id, colorid) {
        this.path = [];
        this.color_id = String(colorid);
        this.Pid = String(id);
        this.pos = -1;
        this.x = parseInt(allPiecesePos[this.color_id][this.Pid].x);
        this.y = parseInt(allPiecesePos[this.color_id][this.Pid].y);
        this.image = PIECES[this.color_id];
        switch (id) {
            case '0':
                for (let i = 0; i < 4; i++) { this.path.push(this.oneStepToRight) }
                this.path.push(this.oneStepTo45);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop) }
                for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToRight) }
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom) }
                this.path.push(this.oneStepTo315);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight) }
                for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToBottom) }
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft) }
                this.path.push(this.oneStepTo225);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom) }
                for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToLeft) }
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop) }
                this.path.push(this.oneStepTo135);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft) }
                this.path.push(this.oneStepToTop);
                for (let i = 0; i < 6; i++) { this.path.push(this.oneStepToRight) }
                break;
            case '1':
                for (let i = 0; i < 4; i++) { this.path.push(this.oneStepToBottom) }
                this.path.push(this.oneStepTo315);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight) }
                for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToBottom) }
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft) }
                this.path.push(this.oneStepTo225);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom) }
                for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToLeft) }
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop) }
                this.path.push(this.oneStepTo135);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft) }
                for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToTop) }
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight) }
                this.path.push(this.oneStepTo45);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop) }
                this.path.push(this.oneStepToRight);
                for (let i = 0; i < 6; i++) { this.path.push(this.oneStepToBottom) }
                break;
            case '2':
                for (let i = 0; i < 4; i++) { this.path.push(this.oneStepToLeft) }
                this.path.push(this.oneStepTo225);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom) }
                for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToLeft) }
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop) }
                this.path.push(this.oneStepTo135);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft) }
                for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToTop) }
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight) }
                this.path.push(this.oneStepTo45);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop) }
                for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToRight) }
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom) }
                this.path.push(this.oneStepTo315);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight) }
                this.path.push(this.oneStepToBottom);
                for (let i = 0; i < 6; i++) { this.path.push(this.oneStepToLeft) }
                break;
            case '3':
                for (let i = 0; i < 4; i++) { this.path.push(this.oneStepToTop) }
                this.path.push(this.oneStepTo135);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft) }
                for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToTop) }
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight) }
                this.path.push(this.oneStepTo45);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToTop) }
                for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToRight) }
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom) }
                this.path.push(this.oneStepTo315);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToRight) }
                for (let i = 0; i < 2; i++) { this.path.push(this.oneStepToBottom) }
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToLeft) }
                this.path.push(this.oneStepTo225);
                for (let i = 0; i < 5; i++) { this.path.push(this.oneStepToBottom) }
                this.path.push(this.oneStepToLeft);
                for (let i = 0; i < 6; i++) { this.path.push(this.oneStepToTop) }
                break;
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, 50, 50);
    }

    update(num) {
        if (this.pos != -1 && this.pos + num <= 56) {
            for (let i = this.pos; i < this.pos + num; i++) {
                this.path[i](this.color_id, this.Pid);
            }
            this.pos += num;
            if (this.pos == 56) {
                window.PLAYERS[this.color_id].won += 1;
            }
        } else if (num == 6 && this.pos == -1) {
            this.x = homeTilePos[this.color_id][0].x;
            this.y = homeTilePos[this.color_id][0].y;
            this.pos = 0;
        }
    }

    oneStepToRight(id, pid) {
        window.PLAYERS[id].myPieces[pid].x += 50;
    }

    oneStepToLeft(id, pid) {
        window.PLAYERS[id].myPieces[pid].x -= 50;
    }

    oneStepToTop(id, pid) {
        window.PLAYERS[id].myPieces[pid].y -= 50;
    }

    oneStepToBottom(id, pid) {
        window.PLAYERS[id].myPieces[pid].y += 50;
    }

    oneStepTo45(id, pid) {
        window.PLAYERS[id].myPieces[pid].x += 50;
        window.PLAYERS[id].myPieces[pid].y -= 50;
    }

    oneStepTo135(id, pid) {
        window.PLAYERS[id].myPieces[pid].x -= 50;
        window.PLAYERS[id].myPieces[pid].y -= 50;
    }

    oneStepTo225(id, pid) {
        window.PLAYERS[id].myPieces[pid].x -= 50;
        window.PLAYERS[id].myPieces[pid].y += 50;
    }

    oneStepTo315(id, pid) {
        window.PLAYERS[id].myPieces[pid].x += 50;
        window.PLAYERS[id].myPieces[pid].y += 50;
    }

    kill() {
        this.x = allPiecesePos[this.color_id][this.Pid].x;
        this.y = allPiecesePos[this.color_id][this.Pid].y;
        this.pos = -1;
    }
}

socket.on('connect', function() {
    console.log('You are connected to the server!!');

    socket.emit('fetch', room_code, function(data, id, error) {
        if (error || data === null || id === null) {
            console.error('Fetch error or invalid response:', error, data, id);
            outputMessage({ msg: 'Error: Invalid or full room. Retrying...' }, 5);
            const newRoomCode = generateNewRoomCode();
            if (window.Android) {
                console.log('Sending new room code to Android:', newRoomCode);
                window.Android.sendRoomCode(newRoomCode);
            }
            // Retry with new room code via fetch
            socket.emit('fetch', newRoomCode, function(newData, newId, newError) {
                if (newError || newData === null || newId === null) {
                    console.error('Retry failed:', newError, newData, newId);
                    outputMessage({ msg: 'Error: Unable to create room. Please try again.' }, 5);
                    return;
                }
                window.location.href = `/ludo/${newRoomCode}`;
            });
            return;
        }
        MYROOM = data ? data.sort((a, b) => a - b).map(Number) : [0];
        myid = Number(id) >= 0 && Number(id) < USERNAMES.length ? Number(id) : 0;
        console.log('Fetched room:', MYROOM, 'myid:', myid, 'chance:', chance);
        const isCreatingRoom = !window.location.href.includes('/ludo/') || (data && data.length === 0);
        if (isCreatingRoom && window.Android) {
            console.log('Sending room code to Android (create):', room_code);
            window.Android.sendRoomCode(room_code);
        }
        if (myid >= 0 && myid < USERNAMES.length) {
            document.getElementById('my-name').innerHTML = `You are ${USERNAMES[myid]}`;
            if (isCreatingRoom && !MYROOM.includes(myid)) {
                MYROOM.push(myid);
                MYROOM.sort((a, b) => a - b);
            }
            StartTheGame();
        } else {
            console.error('Invalid myid after fallback:', myid);
            outputMessage({ msg: 'Error: Unable to assign player color' }, 5);
        }
    });

    if (chance === myid) {
        document.getElementById('randomButt').addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Button clicked');
            styleButton(0);
            diceAction();
        });
    }

    socket.on('imposter', () => {
        console.warn('Imposter detected, retrying with new room');
        outputMessage({ msg: 'Room invalid or full. Retrying...' }, 5);
        const newRoomCode = generateNewRoomCode();
        if (window.Android) {
            console.log('Sending new room code to Android (imposter):', newRoomCode);
            window.Android.sendRoomCode(newRoomCode);
        }
        socket.emit('fetch', newRoomCode, function(data, id, error) {
            if (error || data === null || id === null) {
                console.error('Imposter retry failed:', error, data, id);
                outputMessage({ msg: 'Error: Unable to create room. Please try again.' }, 5);
                return;
            }
            window.location.href = `/ludo/${newRoomCode}`;
        });
    });

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
        MYROOM = [...new Set(MYROOM)];
        MYROOM.sort(function(a, b) { return a - b });
        for (let i = 0; i < MYROOM.length; i++) { MYROOM[i] = +MYROOM[i]; }
        loadNewPiece(data.id);
        outputMessage({ Name: USERNAMES[data.id], id: data.id }, 0);
        document.getElementById("myModal-2").style.display = "none";
        let butt = document.getElementById('WAIT');
        butt.disabled = false;
        butt.style.opacity = '1';
        butt.style.cursor = "pointer";
        clearInterval(window.timer);
    });

    socket.on('user-disconnected', function(data) {
        outputMessage({ Name: USERNAMES[data], id: data }, 6);
        resumeHandler(data);
    });

    socket.on('resume', function(data) {
        resume(data.id);
        data.id == data.click ? outputMessage({ id: data.id, msg: `Resumed the game without ${USERNAMES[data.id]}` }, 5) : outputMessage({ id: data.click, msg: `${USERNAMES[data.click]} has resumed the game without ${USERNAMES[data.id]}` }, 5);
    });

    socket.on('wait', function(data) {
        wait();
        outputMessage({ id: data.click, msg: `${USERNAMES[data.click]} has decided to wait` }, 5);
    });

    socket.on('rolled-dice', function(data) {
        Number(data.id) != myid ? outputMessage({ Name: USERNAMES[data.id], Num: data.num, id: data.id }, 1) : outputMessage({ Name: 'you', Num: data.num, id: data.id }, 1);
    });

    socket.on('Thrown-dice', async function(data) {
        await PLAYERS[data.id].myPieces[data.pid].update(data.num);
        if (iKill(data.id, data.pid)) {
            outputMessage({ msg: 'Oops got killed', id: data.id }, 5);
            allPlayerHandler();
        } else {
            allPlayerHandler();
        }
        if (PLAYERS[data.id].didIwin()) {
            socket.emit('WON', {
                room: data.room,
                id: data.id,
                player: myid
            });
        }
    });

    socket.on('winner', function(data) {
        showModal(data);
    });
});

socket.on('disconnect', function() {
    console.log('You are disconnected to the server');
});

function outputMessage(anObject, k) {
    let msgBoard = document.querySelector('.msgBoard');

    if (k === 0 && !(anObject?.Name?.includes('<'))) {
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<p>↘️ <span style="color: ${colors[anObject.id]}">${anObject.Name}</span> entered the game</p>`;
        msgBoard.appendChild(div);
    } else if (k === 1 && !(anObject?.Name?.includes('<'))) {
        const div = document.createElement('div');
        div.classList.add('message');
        div.innerHTML = `<p><strong>★ <span style="color: ${colors[anObject.id]}">${anObject.Name}</span></strong> got a ${anObject.Num}</p>`;
        msgBoard.appendChild(div);
    } else if (k === 3) {
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<span style="color: ${colors[myid]}">${anObject}!!</span>`;
        msgBoard.appendChild(div);
    } else if (k === 4) {
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<p>It's <span style="color: ${colors[anObject.id]}">${anObject.Name}</span>'s turn!</p>`;
        msgBoard.appendChild(div);
    } else if (k === 5) {
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<p><span style="color: ${colors[anObject.id]}">${anObject.msg}</span></p>`;
        msgBoard.appendChild(div);
    } else if (k === 6) {
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<p>↘️ <span style="color: ${colors[anObject.id]}">${anObject.Name}</span> left the game</p>`;
        msgBoard.appendChild(div);
    }
    msgBoard.scrollTop = msgBoard.scrollHeight;
}

function styleButton(k) {
    let butt = document.getElementById("randomButt");
    if (k === 0) {
        butt.disabled = true;
        butt.style.opacity = '0.6';
        butt.style.cursor = 'not-allowed';
        butt.style.backgroundImage = "linear-gradient(to bottom right, rgb(255, 0, 0), rgb(255, 255, 0))";
    } else if (k === 1) {
        butt.disabled = false;
        butt.style.opacity = '1';
        butt.style.cursor = 'pointer';
        butt.style.backgroundImage = "linear-gradient(to bottom right, rgb(255, 0, 0), rgb(255, 255, 0))";
    }
}

function diceAction() {
    socket.emit('roll-dice', { room: room_code, id: myid }, function(num) {
        console.log('Dice rolled, got:', num);
        let spirit = [];
        for (let i = 0; i < 4; i++) {
            if (PLAYERS[myid].myPieces[i].pos > -1 && PLAYERS[myid].myPieces[i].pos + num <= 56) {
                spirit.push(i);
            }
        }
        if (spirit.length !== 0 || num === 6) {
            outputMessage('Click on a piece', 3);
            canvas.addEventListener('click', function clickHandler(e) {
                console.log('Click event listener added to canvas element');
                let Xp = e.clientX - e.target.getBoundingClientRect().left;
                let Yp = e.clientY - e.target.getBoundingClientRect().top;
                let playerObj = {
                    room: room_code,
                    id: myid,
                    num: num
                };
                let alert1 = true;

                for (let i = 0; i < 4; i++) {
                    if (Xp - PLAYERS[myid].myPieces[i].x < 45 && Xp - PLAYERS[myid].myPieces[i].x > 0 && Yp - PLAYERS[myid].myPieces[i].y < 45 && Yp - PLAYERS[myid].myPieces[i].y > 0) {
                        if ((spirit.includes(i) || num === 6) && PLAYERS[myid].myPieces[i].pos + num <= 56) {
                            playerObj['pid'] = i;
                            console.log(playerObj);
                            socket.emit('random', playerObj, function(data) {
                                styleButton(0);
                                console.log('random acknowledged');
                                socket.emit('chance', { room: room_code, nxt_id: chanceRotation(myid, data) });
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

function StartTheGame() {
    MYROOM.forEach(function(numb) {
        numb === myid ? outputMessage({ Name: 'You', id: numb }, 0) : outputMessage({ Name: USERNAMES[numb], id: numb }, 0);
    });
    document.getElementById('my-name').innerHTML = `You are ${USERNAMES[myid]}`;
    console.log(myid);
    let copyText = `\n\nMy room:\n${window.location.href} \nor join the room via\nMy room code:${room_code}`;
    document.getElementById('copy').textContent += copyText;
    if (MYROOM.length === 1) {
        styleButton(1);
        chance = Number(myid);
    } else {
        styleButton(0);
    }
    loadAllPieces();
}

function loadAllPieces() {
    let cnt = 0;
    for (let i = 0; i < colors.length; i++) {
        let img = new Image();
        img.src = "/images/pieces/" + colors[i].toLowerCase() + ".png";
        img.onload = () => {
            ++cnt;
            if (cnt >= colors.length) {
                for (let j = 0; j < MYROOM.length; j++) {
                    PLAYERS[MYROOM[j]] = new Player(MYROOM[j]);
                }
                if (MYROOM.includes(myid)) {
                    allPlayerHandler();
                    outputMessage({ Name: 'You', id: myid }, 0);
                } else {
                    console.error('myid not in MYROOM:', myid, MYROOM);
                }
            }
            if (cnt >= colors.length) {
                if (window.localStorage.getItem('room') === room_code) {
                    console.log('Yes my localStorage is for this room');
                    if (window.localStorage.getItem('started') === 'true') {
                        console.log('Yes I am from this room');
                        chance = parseInt(window.localStorage.getItem('chance'));
                        let positions = JSON.parse(window.localStorage.getItem('positions'));
                        let win = JSON.parse(window.localStorage.getItem('win'));
                        for (let i = 0; i < MYROOM.length; i++) {
                            PLAYERS[MYROOM[i]].won = parseInt(win[i]);
                            for (let j = 0; j < 4; j++) {
                                console.log('Yes room==room_code && started==true:', i, j);
                                PLAYERS[MYROOM[i]].myPieces[j].x = parseInt(positions[MYROOM[i]][j].x);
                                PLAYERS[MYROOM[i]].myPieces[j].y = parseInt(positions[MYROOM[i]][j].y);
                                PLAYERS[MYROOM[i]].myPieces[j].pos = parseInt(positions[MYROOM[i]][j].pos);
                            }
                        }
                        allPlayerHandler();
                    } else {
                        allPlayerHandler();
                    }
                } else {
                    window.localStorage.clear();
                    window.localStorage.setItem('room', room_code);
                    allPlayerHandler();
                }
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
            console.log('Next chance (MYROOM[chance+1]):', c, '\nROOM:', MYROOM, '\nPrevious chance:', chance);
            return c;
        } else {
            console.log('Next chance (MYROOM[0]):', MYROOM[0], '\nMYROOM:', MYROOM, '\nPrevious chance:', chance, 'c:', c, 'chance+1:', chance + 1, 'MYROOM[chance+1]:', MYROOM[chance + 1]);
            return MYROOM[0];
        }
    }
}

function allPlayerHandler() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log('Drawing pieces for MYROOM:', MYROOM, 'PLAYERS:', Object.keys(PLAYERS));
    for (let i = 0; i < MYROOM.length; i++) {
        if (PLAYERS[MYROOM[i]]) {
            PLAYERS[MYROOM[i]].draw();
        } else {
            console.error('No player found for ID:', MYROOM[i]);
        }
    }
    let positions = {};
    let win = {};
    for (let i = 0; i < MYROOM.length; i++) {
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
    window.localStorage.setItem('started', 'true');
    window.localStorage.setItem('chance', chance.toString());
    window.localStorage.setItem('positions', JSON.stringify(positions));
    window.localStorage.setItem('win', JSON.stringify(win));
}

function loadNewPiece(id) {
    PLAYERS[id] = new Player(id);
    if (window.localStorage.getItem('room') === room_code) {
        console.log('Yes I\'m from my room');
        if (window.localStorage.getItem('started')) {
            console.log('Yes I have started the game');
            let positions = JSON.parse(window.localStorage.getItem('positions'));
            let win = JSON.parse(window.localStorage.getItem('win'));
            if (positions[id]) {
                console.log(`Yes I have data for user of ID: ${id} in my local storage\nIt is ${positions[id]}`);
                PLAYERS[id].won = parseInt(win[id]);
                for (let j = id0; j++) { positions[id]; }
                for (let i = 0; i < 4; i++) {
                    console.log(`for ${id}, ${j}\n${i}\nx${id}: ${parseInt(positions[id][i].x)}\n${id}: ${parseInt(positions[id][i].y)}, ${parseInt(id)}\npos${i}: ${parseInt(id)}`);
                    PLAYERS[id].myPieces[i].x = parseInt(positions[id][i].x);
                    PLAYERS[id].myPieces[i].y = parseInt(positions[id][i].y);
                    PLAYERS[id].myPieces[i].pos = parseInt(positions[id][i].pos);
                }
            }
        }
    }
    allPlayerHandler();
}

function iKill(id, pid) {
    let boss = PLAYERS[id].myPieces[pid];
    for (let i = 0; i < MYROOM.length; i++) {
        for (let j = 0; j < 4; j++) {
            if (MYROOM[i] !== id && boss.x === PLAYERS[id].myPieces[j].x && boss.y === PLAYERS[id].myPieces[j].y) {
                if (!inAhomeTile(id, pid)) {
                    PLAYERS[id].myPieces[j].kill();
                    return 0;
                }
            }
        }
    }
    return 0;
}

function inAhomeTile(id, pid) {
    for (let i = 0; i < 4; i++) {
        if ((PLAYERS[id].myPieces[pid].x === homeTilePos[i][0].x && PLAYERS[id].myPieces[pid].y === homeTilePos[i][0].y) ||
            (PLAYERS[id].myPieces[pid].x === homeTilePos[i][1].x && PLAYERS[id].myPieces[pid].y === homeTilePos[i][1].y)) {
            return true;
        }
    }
    return false;
}

function showModal(id) {
    window.localStorage.removeItem('room');
    document.getElementById("myModal-1").style.display = "block";
    document.getElementById("win").textContent = `The winner is ${USERNAMES[id]}`;
}

async function copyHandler() {
    var copyText = document.getElementById("copy").textContent;
    try {
        await navigator.clipboard.writeText(copyText);
        var tooltip = document.getElementById("myTooltipText");
        tooltip.innerText = "Copied!";
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}

function outFunc() {
    var tooltipText = document.getElementById("myTooltipText");
    tooltipText.innerHTML = "Copy Link";
}

async function copyLinkHandler() {
    var copyText = window.location.href;
    try {
        await navigator.clipboard.writeText(copyText);
        var tooltipText = document.getElementById("myTooltipLink");
        tooltipText.innerHTML = "Copied!";
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}

function wait() {
    document.getElementById("myModal-2").style.display = "block";
    let butt = document.getElementById('my-button');
    butt.disabled = true;
    butt.style.opacity = '0.6';
    butt.style.cursor = "not-allowed";
}

function resume(id) {
    MYROOM = MYROOM.filter(function(ele) {
        return ele != id;
    });
    document.getElementById("myModal-2").style.display = "none";
    let butt = document.getElementById('my-button');
    butt.disabled = false;
    butt.style.opacity = '1';
    butt.style.cursor = "pointer";
    clearInterval(window.timer);
}

function resumeHandler(id) {
    if (MYROOM.length > 1) {
        wait();
        let timeLeft = 15;
        document.getElementById("myModal-2").style.display = "block";
        document.getElementById("time").textContent = timeLeft;
        document.getElementById("theOneWhoLeft").textContent = USERNAMES[id];
        window.timer = setInterval(function() {
            document.getElementById("time").textContent = --timeLeft;
            if (timeLeft <= 0) {
                resume(id);
                socket.emit('resume', {
                    room: room_code,
                    id: id,
                    click: myid
                });
                clearInterval(window.timer);
            }
        }, 1000);
    }
}

function generateNewRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array(6).fill().map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}
