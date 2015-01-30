window.onload = function(){
	var canvas = document.getElementById("canvas");

	var init = function(){
		var mainship = new Ship(canvas, mainship_pattern);
		mainship.build(mainship_pattern.width + 10, canvas.height/2);

		var direction = [0, 0];
		
		// Faire en sorte que ça se passe toutes les 16millisecondes, si la key is down
		timerId = setInterval(function(){
			mainship.move(direction[0], direction[1]);
		}, 16);

		document.onkeypress = function(event){
			var key = String.fromCharCode(event.which);
			if(key === "z"){
				direction = [0, -(mainship_pattern.speed)]; //mainship.move(0, -10);
			} else if( key === "s"){
				direction = [0, mainship_pattern.speed]; //mainship.move(0, 10);
			} else if ( key === "q"){
				direction = [-(mainship_pattern.speed), 0]; //mainship.move(-10, 0);
			} else if ( key === "d"){
				direction = [mainship_pattern.speed, 0]; //mainship.move(10, 0);
			}
		};

	};
	
	
	var mainship_pattern = {
		width : 50,//12
		height : 70,//18
		speed : 5
	};
	
	// Le constructeur du vaisseau
	function Ship (canvas, ship){
		this.canvas = canvas;
		this.width = ship.width;
		this.height = ship.height;
		this.oX = 0;
		this.oY = 0;
		this.ctx = this.canvas.getContext("2d");
	};
	
	// Dessiner le vaisseau
	Ship.prototype.build = function(x, y){
		
		if((this.oX > 0 && this.oX < this.canvas.width) || (this.oX == 0 && x > 0) || (this.oX == this.canvas.width && x < 0)){
			this.oX += x; // Origin X
		};
		if((this.oY > 0 && this.oY < this.canvas.height - this.height) || (this.oY == 0 && y > 0) || (this.oY == this.canvas.height - this.height && y < 0)){
			this.oY += y; // Origin X
		};

		this.ctx.beginPath();
		// Barre verticale
		this.ctx.moveTo(this.oX, this.oY);
		// Barre horizontale
		this.ctx.lineTo(this.oX, this.oY + this.height);
		this.ctx.moveTo(this.oX - this.width/1.5, this.oY + this.height/2);
		this.ctx.lineTo(this.oX + this.width/3, this.oY + this.height/2);
		this.ctx.stroke();
	};
	

	Ship.prototype.move = function(x, y){
		// Clear le canvas
		this.ctx.clearRect(0, 0, canvas.width, canvas.height);
		// Dessiner le vaisseau dans sa nouvelle position
		this.build(x, y);
	};

	init();
	
};



