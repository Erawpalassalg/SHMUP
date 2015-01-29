window.onload = function(){
	var canvas = document.getElementById("canvas");
	
	var init = function(){
		var mainship = new Ship(canvas, mainship_pattern);
		mainship.build();
	};
	
	
	
	
	var mainship_pattern = {
		height : 12,
		width : 7
	};
	
	function Ship (canvas, ship){
		this.width = ship.width;
		this.height = ship.height;
	};
	
	Ship.prototype.build = function(){
		var ctx = this.canvas.getContext("2d");
		var oX = 249; // Origin X
		var oY = 10; // Origin Y
		
		ctx.beginPath();
		ctx.moveTo(oX, oY); 
		ctx.lineTo(oX, oY += mainship.width); // X: 249, Y: 17
		ctx.moveTo(oX -= mainship.height/2, oY -= (mainship.width - (mainship.width/2))); // X: 247, Y: 15
		ctx.lineTo(oX += mainship.height, oY);
		ctx.stroke();
	};
	
	init();
	
};



