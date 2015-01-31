window.onload = function(){
	var canvas = document.getElementById("canvas");
	var i = 0;var nextPlace = -1; // Prochaine case dans laquelle on placera la balle tirée, -1 signifiant un append
	
	var init = function(){
		var ctx = canvas.getContext("2d");
		var mainship = new Ship(ctx, canvas, mainship_pattern);
		mainship.build(mainship_pattern.width + 10, canvas.height/2);

		var direction = [0, 0];

		// Nouvelle itération et affichage tous les 10 centièmes de sec
		timerId = setInterval(function(){
			// Clear le canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			mainship.move(direction[0], direction[1]);
			i++;
			if(i === 100){
				mainship.shoot(nextPlace);
				i = 0;
			}
			
			moveBullets(mainship);
			
		}, 10);

		// En fonction de la touche pressée, on met une direction, qui sera suivie par le vaisseau
		document.onkeypress = function(event){
			var key = String.fromCharCode(event.which);
			if(key === "z"){
				direction = [0, -(mainship.speed)]; //mainship.move(0, -10);
			} else if( key === "s"){
				direction = [0, mainship.speed]; //mainship.move(0, 10);
			} else if ( key === "q"){
				direction = [-(mainship.speed), 0]; //mainship.move(-10, 0);
			} else if ( key === "d"){
				direction = [mainship.speed, 0]; //mainship.move(10, 0);
			}
		};

	};
	
	
	var mainship_pattern = {
		width : 20, //12
		height : 25, //18
		speed : 0.5,
		bullets : {
			size : 1,
			speed : 1,
		}
	};
	
	// Le constructeur du vaisseau
	function Ship (ctx, canvas, ship){
		this.canvas = canvas;
		this.width = ship.width;
		this.height = ship.height;
		this.speed = ship.speed;
		this.bullets = ship.bullets;
		this.oX = 0;
		this.oY = 0;
		this.ctx = ctx;
		this.fired_bullets = [];
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
		// Dessiner le vaisseau dans sa nouvelle position
		this.build(x, y);
	};

	// Action de tirer du vaisseau, qui renvoie une nouvelle balle -- peut-être qu'il renverra un array de balles
	Ship.prototype.shoot = function(nextPlace){
		var bullet = new Bullet(this.ctx, this.bullets.size, this.bullets.speed, this.oX + this.width/3, this.oY + this.height/2);
		if(nextPlace === -1){
			this.fired_bullets.push(bullet);
		} else {
			this.fired_bullets[nextPlace] = bullet;
		}
	};

	// Constructeur de la classe balle, qui prend les caracs de tir du vaisseau
	function Bullet(ctx, size, speed, oX, oY){
		this.ctx = ctx;
		this.size = size;
		this.speed = speed;
		this.x = oX;
		this.y = oY;
	};
	
	// Dessin d'une balle, qui la fait avancer de la vitesse de la balle par tour
	Bullet.prototype.move = function(){
		this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);
		this.ctx.lineTo(this.x+1, this.y);
		this.ctx.stroke();
		this.x += this.speed;
	};


	var moveBullets = function(ship){
		for(var j = 0 ; j < ship.fired_bullets.length ; j++){
			// Si la balle a une valeur x plus grande que la longueur du canvas, on recycle la case
			if(ship.fired_bullets[j] != null && ship.fired_bullets[j].x > canvas.width){
				ship.fired_bullets[j] = null;
				nextPlace = j;
			}
			console.log("place " + nextPlace);
			console.log("longueur " + ship.fired_bullets.length);
			// Si la balle existe dans le tableau, la bouger
			if(ship.fired_bullets[j] != null){
				ship.fired_bullets[j].move();	
			}
		}
	};

	init();
	
};



