let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; //? 32 * 16
let boardHeight = tileSize * rows; //? 32 * 16
let context;


//* ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
};

let shipIMG;
let shipVelocityX = tileSize; //? when you move the ship, you move it one tile over

//* aliens
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienIMG;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; //? number of aliens to defeat
let alienVelocityX = 1; //? alien moving speed

//* bullets
let bulletArray = [];
let bulletVelocityY = -10; //? bullet moving speed

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //? used for drawing on the board

    // context.fillStyle = "blue";
    // context.fillRect(ship.x, ship.y, ship.width, ship.height);

    //* load images
    shipIMG = new Image();
    shipIMG.src = "spaceinvadersMedia/ship.png";
    shipIMG.onload = function() {
        context.drawImage(shipIMG, ship.x, ship.y, ship.width, ship.height);
    };

    alienIMG = new Image();
    alienIMG.src = "spaceinvadersMedia/alien.png";
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
};

function update() {
    requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height);

    //* draw ship over and over per frame
    context.drawImage(shipIMG, ship.x, ship.y, ship.width, ship.height);

    //* draw aliens in each frame
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            //todo if aliens touch the borders, we want to flip the velocity of the aliens
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX*2;

                //* move all aliens up by 1 row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienIMG, alien.x, alien.y, alien.width, alien.height)
        }
    }

    //* bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)

        //* bullet collision with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
            }
        }
    }

    //* clear bullets
    while (bulletArray.length > 0 && bulletArray[0].used || bulletArray[0].y < 0) {
        bulletArray.shift; //? removes the first element of the array (extra bullets)
    }
};

function moveShip(e) {
    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX //* move left
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX //* move right
    }
};

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img : alienIMG,
                x : alienX + c * alienWidth,
                y : alienY + r * alienHeight,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
};

function shoot(e) {   
    if (e.code == "Space") {
        let bullet = {
            x : ship.x + shipWidth * 15/32,
            y : ship.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
};

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //? a's top left corner doesnt reach b's top right corner
           a.x + a.width > b.x &&   //? a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //? a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y     //? a's bottom left corner passes b's top left corner
};