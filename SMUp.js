window.onload = function(){
	var canvas = document.getElementById("canvas");
	var time_before_poping = 0;
	var score = null;
	var ennemies_number = 1;
	var money = null;
	var should_I_build_shop = true;
	var timerId;
	var start = document.getElementById("start");
	var mainship = null;
	var bullets_shot = null;
	
	var init = function(){
		showScore();
		var ctx = canvas.getContext("2d");
		mainship = new Ship(ctx, canvas, mainship_pattern);
		mainship.build(mainship_pattern.width, canvas.height/2);
		var ennemies = [];
		var allies = [];
		bullets_shot = [];
		allies.push(mainship);
		should_I_build_shop ? buildShop(mainship) : null;
		showStats(mainship);
		var direction = [0, 0];
		var regen_timer = 0;

		// Nouvelle itération et affichage tous les 10 millièmes de sec
		timerId = setInterval(function(){
			// Clear le canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			// Fait bouger le vaiseau dans la dernière direction pressée
			mainship.move(direction[0], direction[1]);
			
			mainship.shooting();
			moveBullets();
			for(var e in ennemies){
				ennemies[e].shooting();
			}
			for(var i = 0; i <= score/30 ; i++){
				popingEnnemies(ctx, ennemies);
			}
			movingEnnemies(allies, ennemies);
			resolvingShots(allies, ennemies); 
			regen_timer++;
			if(regen_timer === 50){
				regenHp(mainship, ennemies);
				regen_timer = 0;
			}
		}, 20);

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
			} else if ( key === "e"){
				direction = [0, 0];
			} else if (key === " "){
				shop();
			}
		};
	};
	
	// méthode permettatn d'incrémenter et d'afficher le score
	var showScore = function(){
		document.getElementById("score").innerHTML = ""+score;
		document.getElementById("money").innerHTML = ""+money;
	};

	// méthode permettant de montrer les stats du vaisseau principal
	var showStats = function(ms){
		document.getElementById("hp").innerHTML = "HP : "+ms.hp;
		document.getElementById("regen").innerHTML = "Regen : "+ms.regen;
		document.getElementById("attack_speed").innerHTML = " AS : "+ms.attack_speed;
		document.getElementById("speed").innerHTML = "Mv speed : "+ms.speed;
		document.getElementById("damage").innerHTML = "Damages : "+ms.damages;
	};

	// Fonction d'arrêt du jeu si le joueur perd
	var lost = function(){
		clearInterval(timerId);
		start.disabled = false;
	};

	// permet de lancer le jeu en cliquant sur le bouton start
	start.onclick = function(){
		init();
		start.disabled = true;
		ennemies_number = 1;
		score = 0;
		money = 500;
		showScore();
	};
	
	
//-------------------------------------------------------------------------------------------------------------------
	// Partie concernant les vaisseaux	
	
	var mainship_pattern = {
		width : 20,
		height : 25,
		speed : 2,
		attack_speed : 0.75,
		damages : 1,
		max_hp : 1,
		hp : 1,
		regen : 0,
		ennemy : false,
		bullets : {
			size : 3,
			speed : 4 // Nombre de cases parcourues par les balles à chaque tour
		},
		pattern : "triple"
	};
	
	var basic_ennemy_pattern = {
		width : 30,
		height : 25,
		speed : 1 + score/5,
		attack_speed : 0.25,
		damages : 1,
		max_hp : 1,
		hp : 1,
		regen : 0,
		ennemy : true,
		money_worth : 20,
		bullets : {
			size : -3,
			speed : -3.5 // Nombre de cases parcourues par les balles à chaque tour
		},
		pattern : "single"
	};
	
	// Le constructeur du vaisseau
	function Ship (ctx, canvas, ship){
		this.canvas = canvas;
		this.width = ship.width;
		this.height = ship.height;
		this.speed = ship.speed;
		this.attack_speed = ship.attack_speed;
		this.damages = ship.damages;
		this.max_hp = ship.max_hp;
		this.hp = ship.hp;
		this.regen = ship.regen;
		this.ennemy = ship.ennemy;
		this.money_worth = ship.money_worth;
		this.time_before_shooting = 0; // incrémenté toutes les centièmes de seconde, quand il atteint l'attack-speed, le vaisseau tire
		this.bullets = ship.bullets;
		this.oX = 0;
		this.oY = 0;
		this.pattern = ship.pattern;
		this.ctx = ctx;
	};
	
	// Dessiner le vaisseau
	Ship.prototype.build = function(x, y){
		
		if((this.oX > 0 && this.oX < this.canvas.width) || (this.oX <= 0 && x > 0) || (this.oX === this.canvas.width && x < 0)){ // Si la queue et le cockpit du vaisseau ne touchent ni le bord droit ni le bord gauche, il avance
			this.oX += x; // Origin X
		}
		if((this.oY > 0 && y < 0) || (this.oY < this.canvas.height - this.height && y > 0)){ // Idem sur l'axe Y
			this.oY += y; // Origin X
		}

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
		this.ctx.lineTo(this.oX + front, this.oY + this.height/2);
		this.ctx.lineTo(this.oX, this.oY + this.height);
		this.ctx.lineTo(this.oX, this.oY + this.height/2);
		this.ctx.lineTo(this.oX - back, this.oY + this.height);
		this.ctx.lineTo(this.oX - front, this.oY + this.height/2);
		this.ctx.lineTo(this.oX - back, this.oY);
		this.ctx.lineTo(this.oX, this.oY + this.height/2);
		this.ctx.lineTo(this.oX, this.oY);
		
		this.ctx.stroke();
	};
	

	Ship.prototype.move = function(x, y){
		// Dessiner le vaisseau dans sa nouvelle position
		this.build(x, y);
	};
	
	// Action de tirer du vaisseau, qui renvoie une nouvelle balle -- peut-être qu'il renverra un array de balles
	Ship.prototype.shoot = function(){
		var p = patternize[this.pattern](this.oX, this.oY, this.width, this.height);
		for(b in p){
			var bullet = new Bullet(this.ctx, this.bullets.size, this.bullets.speed, p[b].x, p[b].y, this.ennemy, this.damages);
			bullets_shot.push(bullet);
		}
	};
	
	// Permet au vaisseau de tirer
	Ship.prototype.shooting = function(pattern){
		this.time_before_shooting += this.attack_speed;
		if(this.time_before_shooting >= 50){ // 50 est le nombre de frame par seconde, à 1 d'As on tire 1fois/sec
			this.shoot();				
			this.time_before_shooting = 0;
		}
	};



//--------------------------------------------------------------------------------------------------------------------------

	// Section des balles


	// Constructeur de la classe balle, qui prend les caracs de tir du vaisseau
	function Bullet(ctx, size, speed, oX, oY, ennemy, damages){
		this.ctx = ctx;
		this.size = size;
		this.speed = speed;
		this.ennemy = ennemy;
		this.damages = damages;
		this.x = oX;
		this.y = oY;
	};
	
	// Dessin d'une balle, qui la fait avancer de la vitesse de la balle par tour
	Bullet.prototype.move = function(){
		this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);
		this.ctx.lineTo(this.x+this.size, this.y);
		this.ctx.stroke();
		this.x += this.speed;
	};

	var moveBullets = function(){
		for(var j = 0 ; j < bullets_shot.length ; j++){
			// Si la balle a une valeur x plus grande que la longueur du canvas, on recycle la case
			if(bullets_shot[j].x < 0 || bullets_shot[j].x > canvas.width){
				depop(bullets_shot, j);
			}
			//console.log("place " + nextPlace);
			//console.log("longueur " + ship.fired_bullets.length);
			// Si la balle existe dans le tableau, la bouger
			bullets_shot[j].move();
		}
	};

	// Objet fonctenant les fonctions qui sont des patterns.
	var patternize = {
		"single" : function(x, y, width, height){
			return([
					{
						x : x + width/3, 
						y : y + height/2
					}
				]);
		},
		
		"double" : function(x, y, width, height){
			return([
					{
						x : x,
						y : y
					},
					{
						x : x,
						y : y + height 
					}
				]);
		},
		
		"triple" : function(x, y, width, height){
			return([
					{
						x : x,
						y : y
					},
					{
						x : x,
						y : y + height 
					},
					{
						x : x + width/3, 
						y : y + height/2
					}
				]);
		}
	};


// -------------------------------------------------------------------------------------------------------------------------------

	// Gameplay

	// Fait apparaître les ennemeis aléatoirement sur la droite du Canvas
	var popingEnnemies = function(ctx, e){
		// Incrémentation tous les centièmes de seconde, un ennemy pop lorsqu'arrive à time before_poping - score
		if(time_before_poping >= 250 - (score*5)%150){
			var ennemy = new Ship(ctx, canvas, basic_ennemy_pattern);
			e.push(ennemy);
			ennemy.build(canvas.width, Math.floor((Math.random() * (canvas.height-12))+1));
			time_before_poping = 0;
		} else {
			time_before_poping++;
		}
	};
	
	// Fait bouger les ennemies sur le Canvas. Résoud aussi les actions si un vaisseau atteint le bord gauche du Canvas ou qu'un vaisseau touche un joueur ( gotShot)
	var movingEnnemies = function(a, e){
		for(var j = 0 ; j < e.length ; j++){
			for(var i = 0 ; i < a.length ; i ++){
				if(e[j].oX === 0 || (((e[j].oY >= a[i].oY && e[j].oY <= a[i].oY + a[i].height) || (a[i].oY >= e[j].oY && a[i].oY <= e[j].oY + e[j].height)) && (e[j].oX <= a[i].oX && e[j].oX + e[j].width/1.5 >= a[i].oX))){
					gotShot(a, i, e[j].damage);
					gotShot(e, j, a[i].damage);
				}
			}
			e[j].move(-(e[j].speed), 0);
			if(e[j].oX <= 0){
				lost();
			}
		}
	};
	
	// Résoud les tirs alliés
	var resolvingShots = function(a, e){
		for(var i = 0 ; i < bullets_shot.length ; i++){
			if(bullets_shot[i].ennemy){
				if(bullets_shot[i].y > a[0].oY && bullets_shot[i].y < a[0].oY + a[0].height && bullets_shot[i].x <= a[0].oX && bullets_shot[i].x >= a[0].oX-a[0].width/1.5){
					gotShot(a, 0, bullets_shot[i].damages);
					depop(bullets_shot, i);
				}
			} else {
				for(var j = 0 ; j < e.length ; j++){
					// Si une balle est dans la hitbox ( barre verticale représentant les ailes) d'un des vaisseaux, passe le vaisseau à la méthode gotShot
					if(bullets_shot[i].ennemy != e[j].ennemy && bullets_shot[i].x >= e[j].oX && bullets_shot[i].y >= e[j].oY && bullets_shot[i].y <= (e[j].oY + e[j].height)){
						gotShot(e, j, bullets_shot[i].damages);
						depop(bullets_shot, i);
					}
				}
			}
		}
	};

	// Fait disparaître un vaisseau ou une balle du canvas
	var depop = function(array, index){
		array.splice(index, 1);
	};


	// Fait perdre des Pv à la cible, si elle est à 0 la fait mourir ( perdre si la cible est le joueur )
	var gotShot = function(ships, index, damages){
		ships[index].hp-=damages;
		if(ships[index].hp <= 0){
			if(ships[index].ennemy){
				money += ships[index].money_worth;
				depop(ships, index);
				score++;
				ennemies_number = 1 + score/10;
				showScore();
			} else {
				lost();
			}
		}
	};
	
	var regenHp = function(ms, e){
		console.log(ms.attack_speed);
		if (ms.hp < ms.max_hp){
			ms.hp += ms.regen;
			if(ms.hp > ms.max_hp){
				ms.hp = ms.max_hp;
			}
		} else 
			
		for(var s in e){
			if(s.hp < s.max_hp){
				s.hp += s.regen;
				if(s.hp > s.max_hp){
					s.hp = e.max_hp;
				}
			}
				
		};
		document.getElementById("hp").innerHTML = "HP : " + ms.hp;
	};
	
	
	
//-----------------------------------------------------------------------------------------------------------------------------------------	
	
	// Partie boutique
	
	var buildShop = function(ms){
		var items_window = document.getElementById("items_window");
		for(var item_name in catalog){
			var item_block = new ItemBlock(catalog[item_name]);
			item_block.putInShop(item_name, catalog[item_name], items_window);
			should_I_build_shop = false;
		}
	};
	
	// La fonction qui fait poper la fenêtre d'achat d'items
	var shop = function(){
		var ps = document.getElementById("shop_screen");
		if(ps.style.display === "none"){
			ps.style.display = "block";
		} else {
			ps.style.display = "none";
		}
	};
	
	// Constructeur d'objets
	function ItemBlock(item){
		// Crée un nouvel élément div
		this.container = document.createElement("div");
		this.container.onclick = function(){
			if(money >= item["meta"]["cost"]){
				for(stat in item["stats"]){
					//console.log(mainship[stat]);
					mainship[stat] += item["stats"][stat];
					//console.log(mainship[stat]);
				}
				money -= item["meta"]["cost"];
				showScore();
				showStats(mainship);
			}
		};
	}
	
	ItemBlock.prototype.putInShop = function(name, item, shopNode){
		// Append un txt node au div
		this.container.appendChild(document.createTextNode(name));
		// Rajoute des sauts de ligne et une ligne pour chacune des stats de l'objet JSON
		for(var stat in item["stats"]){
			this.container.innerHTML += "<br>";
			this.container.innerHTML += (stat + " : " + item["stats"][stat]);
		}
		this.container.innerHTML += ("<br>" + "Cost : " + item["meta"]["cost"]);
		// Finalement ajoute le div à l'élément items_window
		shopNode.appendChild(this.container);
		
		// Peut-être un ID à la place d'une classe ?
		this.container.className += this.container.className ? (" " + this.name) : this.name;
		
		// Le style de chaque élément dy catalogue
		this.container.style.display = "inline-block";
		this.container.style.backgroundColor = "rgba(120, 120, 120, 0.6)";
		this.container.style.margin = "10px";
		this.container.style.cursor = "pointer";
		this.container.style.padding = "10px";
		this.container.style.border = "2px solid coral";
		this.container.style.borderRadius = "10px";
	};
	
	// Qui est un objet d'objets, pom pom...
	var catalog = {
		"Engine boost" : {
			meta : {
				cost : 550
			},
			stats : {
				speed : 0.4
			}
		},
		
		"Canon" : {
			meta : {
				cost : 550
			},
			stats : {
				damage : 0.5
			}
		},
		
		"Power surge" : {
			meta : {
				cost : 650
			},
			stats : {
				attack_speed : 0.5
			}
		},
		
		"Shell Piece" : {
			meta : {
				cost : 600
			},
			stats : {
				max_hp : 1,
				regen : 0.05
			}
		}
	};
	
};