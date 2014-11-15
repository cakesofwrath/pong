var animate = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	function(callback) { window.setTimeout(callback, 1000/1)}; //originally 1000/60

var canvas = document.createElement('canvas');
var scoreboard = document.createElement('div');
var width = 400;
var height = 600;
var DEFAULT_SPEED = 3;
var DEFAULT_PLAYER_MOVE = 5;
var DEFAULT_DIFF = 5;
var playerScore = 0;
var compScore = 0;

var colorScales = { //add more from back of book
	greys : ["#898989", "#959595", "#A0A0A0", "#ACACAC", "#B7B7B7", "#C2C2C2", "#CCCCCC", "#D7D7D7", "#ECECEC"],
	lightBlues : ["#00AEED", "#00B5EF", "#49BDEF", "#6EC6F1", "#8DCFF4", "#A5D8F6", "#BFE2F9", "#D4ECFB", "#EBF5FC"]
};
var colorScalesRanges = { //this won't work... need smaller spectrums
	greys : [parseInt("898989", 16), parseInt("ECECEC", 16)],
	lightBlues: [parseInt("00AEED", 16), parseInt("EBF5FC", 16)]
}
console.log(colorScalesRanges);

//scorebd 
scoreboard.style.background = "#C0C0C0";
//scoreboard.style.color = "green";
scoreboard.style.border = "solid";
//scoreboard.style.marginLeft = '50px';
scoreboard.style.display = 'block';
scoreboard.style.width = '200px';
scoreboard.style.height = '120px';
scoreboard.style.position = 'absolute';
scoreboard.style.left = '50%';
scoreboard.style.top = '50%';
var scoreMsg = "<center> Your Score: "+playerScore+"</center><br> <center> Computer Score: "+compScore+"</center>";
scoreboard.innerHTML = scoreMsg;
scoreboard.setAttribute('class', 'scoreboard');

//Canvas decls
canvas.width = width;
canvas.height = height;
canvas.style.position = 'absolute';
canvas.style.border = 'thin solid black';
//canvas.style.left = '50%';
var context = canvas.getContext('2d');


window.onload = function() {
	document.body.appendChild(canvas);
	document.body.appendChild(scoreboard);
	colorShift();
	animate(step); //1.updates all the objects, 2. renders them, 3. reqAnimFrame to restep
}


var step = function() {
	update();
	render();
	
	animate(step);
};

var whiten = false;
var colorIndex= 0;
var currentColor = "#898989";
var color = parseInt("89", 16);
var currentColorScale = "greys";
var colorShift = function() {
	
	/*if(colorIndex == 0 || colorIndex == colorScales[currentColorScale].length-1)
		whiten = !whiten;
	//console.log("colorIndex", colorIndex, "color", colorScales[currentColorScale][colorIndex]);

	if(whiten) colorIndex++;
	else colorIndex--;*/
	if(color < parseInt("63", 16) || color > parseInt("EF", 16))
		whiten = !whiten;

	if(whiten) color += 2;
	else color -= 2;

	currentColor = "#"+color.toString(16)+""+color.toString(16)+""+color.toString(16);
	//console.log(currentColor);
	setTimeout("colorShift()", 100)	
}

var update = function() {
};

var render = function() {
	//context.fillStyle = "#FF00FF";
	context.fillRect(0, 0, width, height);
}

function Paddle(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.x_speed = 0;
	this.y_speed = 0;
}

Paddle.prototype.render = function () {
	context.fillStyle = "#0000FF";
	context.fillRect(this.x, this.y, this.width, this.height);
}

function Player() {
	this.paddle = new Paddle(175, 580, 50, 10);
}

function Computer() {
	this.paddle = new Paddle(175, 10, 50, 10);
}

Player.prototype.render = function() {
	this.paddle.render();
}

Computer.prototype.render = function() {
	this.paddle.render();
}

function Ball(x, y){
	this.x = x;
	this.y = y;
	this.x_speed = 0;
	this.y_speed = DEFAULT_SPEED;
	this.radius = 5;
}

Ball.prototype.render = function() {
	context.beginPath();
	context.arc(this.x, this.y, this.radius, 2*Math.PI, false);
	//context.fillStyle = "#000000";
	context.fill();
};

var player = new Player();
var computer = new Computer();
var ball = new Ball(200, 300);

var render = function() {
	//context.fillStyle = "#FFFFFF";
	//context.fillStyle = "#FF00FF";
	//context.fillStyle = colorScales[currentColorScale][colorIndex];
	context.fillStyle = currentColor;
	context.fillRect(0, 0, width, height);
	player.render();
	computer.render();
	ball.render();
};

var update = function() {
	player.update();
	computer.update(ball);
	ball.update(player.paddle, computer.paddle);
};

Player.prototype.update = function() {
	for(var key in keysDown) {
		var value = Number(key);
		if(value == 37) { //left arrow
			this.paddle.move(-DEFAULT_PLAYER_MOVE, 0);
		} else if (value == 39) { //right arrow
			this.paddle.move(DEFAULT_PLAYER_MOVE, 0);
		} else {
			this.paddle.move(0, 0);
		}
	}
};

Paddle.prototype.move = function(x, y) {
	this.x += x;
	this.y += y;
	this.x_speed = x;
	this.y_speed = y;
	if(this.x < 0){ //way left
		this.x = 0;
		this.x_speed = 0;
	} else if (this.x + this.width > 400) { //way right
		this.x = 400 - this.width;
		this.x_speed = 0;
	}
}

Computer.prototype.update = function(ball) {
	var x_pos = ball.x;
	var diff = -((this.paddle.x + (this.paddle.width / 2)) - x_pos);
	if(diff < 0 && diff < -4) { // max speed left
		diff = -DEFAULT_DIFF;
		//diff = -5;
	} else if(diff > 0 && diff > 4) { //max speed right
		diff = DEFAULT_DIFF;
		//diff = 5;
	}
	this.paddle.move(diff, 0);
	if(this.paddle.x < 0) {
		this.paddle.x = 0;
	} else if (this.paddle.x + this.paddle.width > 400) {
		this.paddle.x = 400 - this.paddle.width;
	}
}

Ball.prototype.update = function(paddle1, paddle2) {
	this.x += this.x_speed;
	this.y += this.y_speed;
	var top_x = this.x - 5;
	var top_y = this.y - 5;
	var bottom_x = this.x + 5;
	var bottom_y = this.y + 5;

	if(this.x - 5 < 0) { //hit left wall
		this.x = 5;
		this.x_speed = -this.x_speed;
	} else if(this.x + 5 > 400) { //hit right wall
		this.x = 395;
		this.x_speed = -this.x_speed;
	}

	if(this.y < 0){
		console.log('you won');
   		playerScore++;
	}
	else if(this.y > 600){
		console.log('comp won');
		compScore++;
	}

	if(this.y < 0 || this.y > 600){ // point
		scoreboard.innerHTML = "<center> Your Score: "+playerScore+"</center><br> <center> Computer Score: "+compScore+"</center>";
		this.x_speed = 0;
		this.y_speed = DEFAULT_SPEED;
		this.x = 200;
		this.y = 300;
	}

	if(top_y > 300) {
		if(top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
   			//hit paddle
   			this.y_speed = -DEFAULT_SPEED;
   			this.x_speed += (paddle1.x_speed /2);
   			this.y += this.y_speed; 
    	}
	} else {
		if(top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x){
			//hit comp paddle
			this.y_speed = DEFAULT_SPEED;
			this.x_speed += (paddle2.x_speed / 2);
			this.y += this.y_speed;
		}
	}
}

var keysDown = {};

window.addEventListener("keydown", function(event) {
	keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
	delete keysDown[event.keyCode];
});

//startingColor = some hex s
var shiftingColors = function(startingColor){

}