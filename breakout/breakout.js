//board
let board;
let boardWidth = window.innerWidth-10;
let boardHeight = window.innerHeight-100;
let context;
//players
let playerWidth = 150;//150
let playerHeight = 10;

let player = {
    x : boardWidth/2 - playerWidth/2,
    y : boardHeight - playerHeight - 30,
    width: playerWidth,
    height: playerHeight,
}

//ball
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 6; //15 for testing, 3 normal
let ballVelocityY = 4; //10 for testing, 2 normal

let ball = {
    x : boardWidth/2,
    y : boardHeight/2,
    width: ballWidth,
    height: ballHeight,
    velocityX : ballVelocityX,
    velocityY : ballVelocityY
}

//blocks
let blockArray = [];
let blockWidth = 80;
let blockHeight = 15;
let blockColumns = Math.floor(boardWidth/(blockWidth+10)); 
let blockRows = 3;
let blockMaxRows = 10; //limit how many rows
let blockCount = 0;
let blockX = 15;
let blockY = 55;

let score = 0;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d"); //used for drawing on the board

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);
    document.addEventListener("mousemove", movePlayer);
    document.addEventListener("touchstart", movePlayer);
    document.addEventListener("touchmove", movePlayer);


    createBlocks();

    counterBoard = document.getElementById("counterBoard");
    counterBoard.height = 300;
    counterBoard.width = 300;
    counterContext = counterBoard.getContext("2d");

}


function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // player
    context.fillStyle = "lightblue";
    context.fillRect(player.x, player.y, player.width, player.height);

    // ball
    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    // context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillRect(ball.x, ball.y, ball.width, ball.height);


//     context.beginPath();
// context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
// context.fillStyle = "red"; // Set the fill color of the ball
// context.fill();
// context.closePath();

    //bounce the ball off player paddle
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1;   // flip y direction up or down
    }
    else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1;   // flip x direction left or right
    }

    if (ball.y <= 0) { 
        ball.velocityY *= -1;
    }
    if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
        ball.velocityX *= -1;
    }
    if (ball.y >= player.y+ball.height) {
        context.font = "20px sans-serif";
        gameOver = true;
        if (isMobileDevice()) {
            context.fillText("Game Over: Tap the screen to restart", 30, 300);
        }
        else {
            context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
        }
    }

    //blocks
    let colors = ["red", "blue", "green", "yellow", "orange"];
    for (let i = 0; i < blockArray.length; i++) {
        context.fillStyle = colors[i%colors.length];
        let block = blockArray[i];
        if (!block.break) {
            if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break = true;     // block is broken
                ball.velocityY *= -1;   // flip y direction up or down
                score += 100;
                blockCount -= 1;
            }
            else if (leftCollision(ball, block) || rightCollision(ball, block)) {
                block.break = true;     // block is broken
                ball.velocityX *= -1;   // flip x direction left or right
                score += 100;
                blockCount -= 1;
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    let isNextLevelTimeoutSet = false;
    
    if (blockCount == 0 && !isNextLevelTimeoutSet) {
        score += 1000; // bonus points
        isNextLevelTimeoutSet = true; // Set the flag to prevent multiple timeouts
    
        ball = {
            x: boardWidth / 2,
            y: boardHeight / 2,
            width: ballWidth,
            height: ballHeight,
            velocityX: ballVelocityX,
            velocityY: ballVelocityY
        };
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        createBlocks();
    
        ball.velocityX = 0;
        ball.velocityY = 0;
    
        let counter = 3;
        let counterInterval = setInterval(() => {
           
            if (counter > 0) {
                counterContext.clearRect(0, 0, counterBoard.width, counterBoard.height);
                counterContext.font = "100px sans-serif";
                counterContext.fillStyle = "white";
                // counterContext.textAlign = "center";
                counterContext.fillText(counter, 100, 200);
                counter--;
            } else {
                clearInterval(counterInterval); // Stop the counter
                ball.velocityX = ballVelocityX;
                ball.velocityY = ballVelocityY;
                counterContext.clearRect(0, 0, counterBoard.width, counterBoard.height);
            }
        }, 1000);
    }
    

      
    context.font = "20px sans-serif";
    context.fillText('Score: '+score, 30, 35);
}


function movePlayer(e) {
    if (gameOver) {
        if (e.type === 'touchstart' || (e.code === "Space")) {
            resetGame();
        }
        return;
    }



    let touchX;

    if (e.type === 'touchmove') {
        touchX = e.touches[0].clientX;
    } else {
        touchX = e.clientX;
    }

    player.x = touchX;

    // let mouseX = e.clientX;

    // //update player position
    // player.x = mouseX;
    
    // Ensure the player stays within the bounds of the board
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + playerWidth > boardWidth) {
        player.x = boardWidth - playerWidth;
    }

    
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function topCollision(ball, block) {
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) {
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) {
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) {
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

function createBlocks() {
    blockArray = [];
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x : blockX + c*blockWidth + c*10, //c*10 space 10 pixels apart columns
                y : blockY + r*blockHeight + r*10, //r*10 space 10 pixels apart rows
                width : blockWidth,
                height : blockHeight,
                break : false
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameOver = false;
    player = {
        x : boardWidth/2 - playerWidth/2,
        y : boardHeight - playerHeight - 30,
        width: playerWidth,
        height: playerHeight,
    }
    ball = {
        x : boardWidth/2,
        y : boardHeight/2,
        width: ballWidth,
        height: ballHeight,
        velocityX : ballVelocityX,
        velocityY : ballVelocityY
    }
    blockArray = [];
    blockRows = 3;
    score = 0;
    createBlocks();
}