window.onload = function(){
	var canvas = document.getElementById("canvas");
	console.log(canvas);
	
	var init = function(){
		console.log(canvas);
		var mainship = new Ship(canvas, mainship_pattern);
		mainship.build();
	};
	
	
	
	
	var mainship_pattern = {
		width : 12,
		height : 18
	};
	
	function Ship (canvas, ship){
		this.canvas = canvas;
		this.width = ship.width;
		this.height = ship.height;
	};
	
	Ship.prototype.build = function(){
		var ctx = this.canvas.getContext("2d");
		var oX = 10; // Origin X
		var oY = canvas.height/2; // Origin Y
		
		ctx.beginPath();
		ctx.moveTo(oX, oY); 
		ctx.lineTo(oX, oY += this.height); // X: 249, Y: 17
		ctx.moveTo(oX -= this.width/1.5, oY -= this.height/2); // X: 247, Y: 15
		ctx.lineTo(oX += this.width, oY);
		ctx.stroke();
	};
	
	init();
	
};



