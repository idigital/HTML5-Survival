// Set constant variables
var FPS = 30;
var BALL_SPEED = 10;
var BALL_RADIUS = 10;
var LASER_SPEED = 10;
var LASER_LENGTH = 10;
var BORDER_WIDTH = 0;
var BORDER_SHRINK_TIME = 0;
var BORDER_SHRINK_SIZE = 0;

// Set game variables
var game;
var gameContext;
var gameInterval;
var gameTimer;
var borderShrink;
var score;
var lasers;
var ballLocation;

function newGame()
{
    // Get game elements
    game = document.getElementById("game");
    gameContext = game.getContext("2d");
    
    // Get score card element
    var scoreDiv = document.getElementById("score");
    scoreDiv.innerHTML = "Score " + 0;
    
    // Clear the laser array
    lasers = new Array();
    
    // Set the starting value of borderShrink
    borderShrink = 0;
    
    // Set the default ball location
    ballLocation = [browserWidth() * 0.5,browserHeight() * 0.5];
    
    // Set the game start time
    gameTimer = new Date();
    
    // Clear the previous setIntervall call and re-draw the game at the rate of FPS
    clearInterval(gameInterval);
    gameInterval = setInterval("drawGame()",1000/FPS);
}

function drawGame()
{
    // Clear the canvas
    game.width = browserWidth();
    game.height = browserHeight();
    
    // Draw the game border
    drawBorder();
    
    // Draw the ball
    drawBall();
    
    // Draw lasers
    drawLasers();
    
    // Update the score
    updateScore();
}

function drawBorder()
{
    // Draw the game border
    gameContext.lineWidth = BORDER_WIDTH;
    gameContext.strokeRect(BORDER_WIDTH + borderShrink,BORDER_WIDTH + borderShrink - 2,browserWidth() - 2 * (BORDER_WIDTH + borderShrink) + 3,browserHeight() - 2 * (BORDER_WIDTH + borderShrink) + 4);

    // If more than BORDER_SHRINK_TIME seconds has past, shrink the border by BORDER_SHRINK_SIZE
    if((new Date() - gameTimer) / (BORDER_SHRINK_TIME * 1000) > 1) {
        borderShrink += BORDER_SHRINK_SIZE;
        gameTimer = new Date();
    }
}

function drawBall()
{
    // Draw the ball at location ballLocation with radius BALL_RADIUS
    gameContext.fillStyle = "#0000FF";
    gameContext.beginPath();
    gameContext.arc(ballLocation[0],ballLocation[1],BALL_RADIUS,0,2*3.1415,false);
    gameContext.closePath();
    gameContext.fill();
}

function randomColor(format)
{
    var rint = Math.round(0xffffff * Math.random());
    switch(format) {
        case 'hex':
            return ('#0' + rint.toString(16)).replace(/^#0([0-9a-f]{6})$/i, '#$1');
            break;
  
        case 'rgb':
            return 'rgb(' + (rint >> 16) + ',' + (rint >> 8 & 255) + ',' + (rint & 255) + ')';
            break;
  
        default:
            return rint;
            break;
    }
}

function drawLasers()
{
    // Draw the lasers
    for(var i = 0; i < lasers.length; i++) {
        gameContext.strokeStyle = lasers[i].color;
        gameContext.beginPath();
        gameContext.lineWidth = 3;
        gameContext.moveTo(lasers[i].x,lasers[i].y);
        gameContext.lineTo(lasers[i].x + LASER_LENGTH * Math.cos(lasers[i].angle),lasers[i].y + LASER_LENGTH * Math.sin(lasers[i].angle));
        gameContext.closePath();
        gameContext.stroke();
        
        // Draw the ball to cover the lasers leaving the ball center
        drawBall();

        // Update origin position of the laser
        lasers[i].x += LASER_SPEED * Math.cos(lasers[i].angle);
        lasers[i].y += LASER_SPEED * Math.sin(lasers[i].angle);
        
        // Change the angle of the i-th laser if it hits the sides
        changeAngle(i);
        
        // Check for a win
        checkWin(i);
    }
}

function createLaser()
{
    // Create the random angle value and the time value
    var theta = 2 * Math.random() * Math.PI;
    var time = new Date();
    
    lasers.push(new laser(ballLocation[0],ballLocation[1],theta,time,randomColor('hex')));
}

function changeAngle(i)
{
    // Change the angle if hitting the sides
    if(((lasers[i].y) <= (2 * BORDER_WIDTH + borderShrink)) || (lasers[i].y >= (browserHeight() - 2 * BORDER_WIDTH - borderShrink))) {
        lasers[i].angle = 2 * Math.PI - lasers[i].angle;
    } else if((lasers[i].x < (2 * BORDER_WIDTH + borderShrink)) || (lasers[i].x > (browserWidth() - 2 * BORDER_WIDTH - borderShrink))) {
        lasers[i].angle = Math.PI - lasers[i].angle;
    }
}

function checkWin(i)
{
    // Get the location of the i-th laser's tip
    var laserTip = [lasers[i].x,lasers[i].y];
    var circle;
    var safe = true;
    
    // Check for a win only if the laser has been in play for more than 500ms
    if(new Date() - lasers[i].shootTime > 500) {
        // Iterate around the circumference of the circle and see if the laser hits the ball
        for(var j = 0; (j < 2 * Math.PI) && (safe); j+=0.01) {
            circle = [ballLocation[0] + BALL_RADIUS * Math.cos(j),ballLocation[1] + BALL_RADIUS * Math.sin(j)];
            if((j >= 0) && (j < Math.PI * 0.5)) {
                if((laserTip[0] <= circle[0]) && (laserTip[1] <= circle[1]) && (laserTip[0] >= ballLocation[0]) && (laserTip[1] >= ballLocation[1])) {
                    safe = false;
                }
            } else if((j >= Math.PI * 0.5) && (j < Math.PI)) {
                if((laserTip[0] >= circle[0]) && (laserTip[1] <= circle[1]) && (laserTip[0] <= ballLocation[0]) && (laserTip[1] >= ballLocation[1])) {
                    safe = false;
                }
            } else if((j >= Math.PI) && (j < Math.PI * 1.5)) {
                if((laserTip[0] >= circle[0]) && (laserTip[1] >= circle[1]) && (laserTip[0] <= ballLocation[0]) && (laserTip[1] <= ballLocation[1])) {
                    safe = false;
                }
            } else {
                if((laserTip[0] <= circle[0]) && (laserTip[1] >= circle[1]) && (laserTip[0] >= ballLocation[0]) && (laserTip[1] <= ballLocation[1])) {
                    safe = false;
                }
            }
        }
        
        // If the safe flag is false, that means the ball has been hit so end the game
        if(!safe) {
            endGame();
        }
    }
}

function updateScore()
{
    // Get score card element
    var scoreDiv = document.getElementById("score");
    score = 0;
    
    // Calculate the score for each laser in play
    for(var i = 0; i < lasers.length; i++) {
        score += Math.floor((new Date() - lasers[i].shootTime) / 1000);
    }
    
    // Display the score
    scoreDiv.innerHTML = "Score " + score;
}

function endGame()
{
    // Alert the user and start a new game;
    alert("You have been hit!\r\nYour score is " + score);
    newGame();
}

function laser(x,y,a,t,c)
{
    this.x = x;
    this.y = y;
    this.angle = a;
    this.shootTime = t;
    this.color = c;
}

function checkKeyPress(e)
{
    // Get the key character code
    var keyPress = (window.event) ? event.keyCode : e.keyCode;

    switch(keyPress) {
        // Space bar
        case 32:
            createLaser();
            break;
        // Left arrow
        case 37:
            if(ballLocation[0] - BALL_SPEED - BALL_RADIUS > 0) {
                ballLocation[0] -= BALL_SPEED;
            } else {
                ballLocation[0] = BALL_RADIUS;
            }
            break;
        // Up arrow
        case 38:
             if(ballLocation[1] - BALL_SPEED - BALL_RADIUS > 0) {
                 ballLocation[1] -= BALL_SPEED;
             } else {
                ballLocation[1] = BALL_RADIUS;
             }
             break;

        // Rigth arrow
        case 39:
            if(ballLocation[0] + BALL_SPEED + BALL_RADIUS < browserWidth()) {
                ballLocation[0] += BALL_SPEED;
            } else {
                ballLocation[0] = browserWidth() - BALL_RADIUS;
            }
            break;
        // Down arrow
        case 40:
            if(ballLocation[1] + BALL_SPEED + BALL_RADIUS < browserHeight()) {
                ballLocation[1] += BALL_SPEED;
            } else {
                ballLocation[1] = browserHeight() - BALL_RADIUS;
            }
            break;
    }
}

function browserHeight()
{
    var height;

    // Get the height of the browser window
    if (typeof window.innerWidth != 'undefined') {
        height = window.innerHeight;
    } else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) {
        height = document.documentElement.clientHeight;
    } else {
        height = document.getElementsByTagName('body')[0].clientHeight;
    }

    return height;  
}

function browserWidth()
{
    var width;
    
    // Get the width of the browser window
    if (typeof window.innerWidth != 'undefined') {
        width = window.innerWidth;
    } else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) {
        width = document.documentElement.clientWidth;
    } else {
        width = document.getElementsByTagName('body')[0].clientWidth;
    }
    
    return width;
}