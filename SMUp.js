window.onload = function(){
	var canvas = document.getElementById("canvas");
	var nextPlace = -1; // Prochaine case dans laquelle on placera la balle tirée, -1 signifiant un append
	var time_before_poping = 0;
	var score = 1;
	var perdu = false;
	
	var init = function(){
		var ctx = canvas.getContext("2d");
		var mainship = new Ship(ctx, canvas, mainship_pattern);
		mainship.build(mainship_pattern.width + 10, canvas.height/2);
		var ennemies = [];
		var direction = [0, 0];

		// Nouvelle itération et affichage tous les 10 millièmes de sec
		timerId = setInterval(function(){
			// Clear le canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			// Fait bouger le vaiseau dans la dernière direction pressée
			mainship.move(direction[0], direction[1]);
			
			shooting(mainship);
			moveBullets(mainship);
			popingEnnemies(ctx, ennemies);
			movingEnnemies(ennemies);
			resolvingShots(mainship, ennemies);
			
			console.log(perdu);

			if(perdu){
				clearInterval(timerId);
			}

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
		width : 20,
		height : 25,
		speed : 0.5,
		attack_speed : 100,
		ennemy : false,
		bullets : {
			size : 1,
			speed : 2 // Nombre de cases parcourues par les balles à chaque tour
		}
	};
	
	var basic_ennemy_pattern = {
		width : 20,
		height : 25,
		speed : 0.5,
		attack_speed : 110,
		ennemy : true,
		bullets : {
			size : 1,
			speed : 2 // Nombre de cases parcourues par les balles à chaque tour
		}
	};
	
	// Le constructeur du vaisseau
	function Ship (ctx, canvas, ship){
		this.canvas = canvas;
		this.width = ship.width;
		this.height = ship.height;
		this.speed = ship.speed;
		this.attack_speed = ship.attack_speed;
		this.ennemy = ship.ennemy;
		this.time_before_shooting = 0; // incrémenté toutes les centièmes de seconde, quand il atteint l'attack-speed, le vaisseau tire
		this.bullets = ship.bullets;
		this.oX = 0;
		this.oY = 0;
		this.ctx = ctx;
		this.fired_bullets = [];
	};
	
	// Dessiner le vaisseau
	Ship.prototype.build = function(x, y){
		
		if((this.oX > 0 && this.oX < this.canvas.width) || (this.oX == 0 && x > 0) || (this.oX == this.canvas.width && x < 0)){ // Si la queue et le cockpit du vaisseau ne touchent ni le bord droit ni le bord gauche, il avance
			this.oX += x; // Origin X
		};
		if((this.oY > 0 && this.oY < this.canvas.height - this.height) || (this.oY == 0 && y > 0) || (this.oY == this.canvas.height - this.height && y < 0)){ // Idem sur l'axe Y
			this.oY += y; // Origin X
		};

		var front;
		var back;

		// Construit les ennemies à l'envers
		if(!this.ennemy){
			back = this.width/1.5;
			front = this.width/3;
		} else {
			back = this.width/3;
			front = this.width/1.5;
		}

		this.ctx.beginPath();
		// Barre verticale
		this.ctx.moveTo(this.oX, this.oY);
		// Barre horizontale
		this.ctx.lineTo(this.oX, this.oY + this.height);
		this.ctx.moveTo(this.oX - back, this.oY + this.height/2);
		this.ctx.lineTo(this.oX + front, this.oY + this.height/2);
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

	// Permet au vaisseau de tirer
	var shooting = function(ship){
		ship.time_before_shooting++;
		if(ship.time_before_shooting === ship.attack_speed){
			ship.shoot(nextPlace);
			ship.time_before_shooting = 0;
		}
	};

	var moveBullets = function(ship){
		for(var j = 0 ; j < ship.fired_bullets.length ; j++){
			// Si la balle a une valeur x plus grande que la longueur du canvas, on recycle la case
			if(ship.fired_bullets[j].x > canvas.width){
				depop(ship.fired_bullets, j);
			}
			//console.log("place " + nextPlace);
			//console.log("longueur " + ship.fired_bullets.length);
			// Si la balle existe dans le tableau, la bouger
			ship.fired_bullets[j].move();
		}
	};

	var popingEnnemies = function(ctx, e){
		if(time_before_poping === 500 - score){
			var ennemy = new Ship(ctx, canvas, basic_ennemy_pattern);
			e.push(ennemy);
			ennemy.build(canvas.width, Math.floor((Math.random() * canvas.height-5)+1));
			time_before_poping = 0;
		} else {
			time_before_poping++;
		}
	};
	
	var movingEnnemies = function(e){
		for(var j = 0 ; j < e.length ; j++){
			e[j].move(-(e[j].speed), 0);
			if(e[j].x <= 1){
				perdu = true;
			}	
		}
	};
	
	// Résoud les tirs alliés
	var resolvingShots = function(ms, e){
		for(var i = 0 ; i < ms.fired_bullets.length ; i++){
			for(var j = 0 ; j < e.length ; j++){
				if(ms.fired_bullets[i].x >= e[j].oX && ms.fired_bullets[i].y >= e[j].oY && ms.fired_bullets[i].y <= (e[j].oY + e[j].width)){
					depop(ms.fired_bullets, i);
					depop(e, j);
					showScore(score++);
				}
			}
		}
	};

	var depop = function(array, index){
		array.splice(index, 1);
	};

	var showScore = function(score){
		document.getElementById("score").innerHTML = score;
	};

	init();
	
};