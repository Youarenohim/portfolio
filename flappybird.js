// Variables for the game board and canvas context
let board;
let boardwidth = 360;
let boardheight = 640;
let context;

// Bird properties: width, height, initial position
let birdwidth = 34; 
let birdheight = 24;
let birdX = (boardwidth - birdwidth) / 8;
let birdY = (boardheight - birdheight) / 2;

// Bird object holds position and size
let bird = {
    x: birdX,
    y: birdY,
    width: birdwidth,
    height: birdheight
};

// Pipes Array to hold all pipes on screen
let pipesArray = [];

// Pipe properties: width, height, spawn positions
let pipewidth = 64; 
let pipeheight = 512;
let pipeX = boardwidth; 
let pipeY = 0;          

// Images for bird and pipes
let birdImg;
let topPipeImg;
let bottomPipeImg;

// Movement velocities and gravity physics
let VelocityX = -2; // Pipes move left at speed 2 px/frame
let velocityY = 0;  // Bird's vertical speed (jump/fall)
let gravity = 0.4;  // Gravity pulling bird downwards

// Game state flags and score
let gameOver = false;
let score = 0;

// Space between top and bottom pipes for bird to fly through
let openingSpace = 85;

// Setup function when window loads
window.onload = function () {
    // Get canvas and set dimensions
    board = document.getElementById("board");
    board.height = boardheight;
    board.width = boardwidth;
    context = board.getContext("2d"); // 2D drawing context

    // Load bird image
    birdImg = new Image();
    birdImg.src = "./flappybird.gif";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    // Load pipe images
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Start main game loop
    requestAnimationFrame(update);

    // Set interval to spawn pipes every 1.5 seconds
    setInterval(placePipes, 1500);

    // Listen for keyboard events to move bird
    document.addEventListener("keydown", moveBird);

    // Listen for touch events for mobile support
    document.addEventListener("touchstart", handleTouch, { passive: false });
}

// Main game loop - updates frame
function update() {
    requestAnimationFrame(update);

    // Stop updating if game over
    if (gameOver) {
        return;
    }

    // Clear the whole canvas before drawing new frame
    context.clearRect(0, 0, board.width, board.height);

    // Apply gravity to bird's vertical velocity
    velocityY += gravity;

    // Update bird's vertical position, keeping it within top boundary
    bird.y = Math.max(bird.y + velocityY, 0);

    // If bird falls below bottom of board, end game
    if (bird.y + bird.height > board.height) {
        gameOver = true;
    }

    // Draw bird image at updated position
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Loop through pipes array backwards for safe removal
    for (let i = pipesArray.length - 1; i >= 0; i--) {
        let pipe = pipesArray[i];

        // Move pipe leftwards
        pipe.x += VelocityX;

        // Remove pipe if it has moved off the left edge
        if (pipe.x + pipe.width < 0) {
            pipesArray.splice(i, 1);
        } else {
            // Draw pipe image
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        }

        // Increase score if pipe not passed and bird passed pipe's right edge
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // 0.5 since there are two pipes per set
            pipe.passed = true;
        }

        // Check for collision between bird and pipe
        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Extra cleanup: remove pipes from start if left edge off-screen
    while (pipesArray.length > 0 && pipesArray[0].x < -pipewidth){
        pipesArray.shift();
    }

    // Draw score on the canvas
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if(gameOver){
        context.fillText("GAME OVER", 6 , 90);
    }
}

// Function to place new pipes at right side with a random height offset
function placePipes() {
    if (gameOver) {
        return;
    }

    // Random vertical position for top pipe within range
    let randomPipeY = pipeY - pipeheight / 4 - Math.random() * (pipeheight / 2);

    // Top pipe object
    let topPipes = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipewidth,
        height: pipeheight,
        passed: false
    }
    pipesArray.push(topPipes);

    // Bottom pipe object positioned below opening space
    let bottomPipes = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeheight + openingSpace,
        width: pipewidth,
        height: pipeheight,
        passed: false
    }
    pipesArray.push(bottomPipes);
}

// Control bird jump on space or arrow up key press
function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -6; // set upward speed to jump

        //reset
        if(gameOver){
            bird.y = birdY;
            pipesArray = [];
            score =0;
            gameOver = false;
        }
    }
}

// Handle touch for mobile
function handleTouch(e) {
    e.preventDefault(); // Prevent scrolling on mobile
    velocityY = -6;

    if(gameOver){
        bird.y = birdY;
        pipesArray = [];
        score = 0;
        gameOver = false;
    }
}

// Collision detection between rectangles a and b
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
