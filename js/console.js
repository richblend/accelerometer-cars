var Game = {

	socket: null,
	socketID: null,
	users: [],
	gameSize: {},

	init: function(){
		this.connect();
		
		Game.gameSize.width = $(window).width();
		Game.gameSize.height = $(window).height();

		
	},

	connect: function(){
		//this.socket = io.connect('http://localhost:6969');
		this.socket = io.connect('http://www.richsavage.co.uk:8000');
		this.socket.on('connect', function () {
	    	Game.gameID = Game.createID();
	    	var payload = '{"type": "gameRegister", "gameID": "'+Game.gameID+'"}';
	    	Game.sendMessage(payload);
	    	$('h1').hide();
	    	$('#qrcode').qrcode({text: "http://richsavage.co.uk/labs/cars/controller.html?/#" + Game.gameID, 
	    		width: 200, 
	    		height: 200,
	    		background: 'rgba(0,0,0,0)'
	    	});
	    }); 

	    

	    this.socket.on('message', function (msg) {
	    	var data = JSON.parse(msg);
	    	//console.log('Recieved:', msg);
	    	
	    	if(data.type == 'joinGame'){
	    		var user = {};
	  			user.nickname = data.nickname;
	  			user.id = data.id;
	  			
	  			Game.createCar(user);
		    }

		    if(data.type == 'disconnect'){
		    	Game.removeUser(data.id);
		    }

		    if(data.type == 'tv'){
		    	var user = Game.getUserFromID(data.id);
		    	if(user)user.car.turnVector = parseFloat(data.v);
		    	
		    }

		    if(data.type == 'ac'){
		    	var user = Game.getUserFromID(data.id);
		    	if(user)user.car.accelerate = parseInt(data.val);
		    }

		    if(data.type == 'br'){
		    	var user = Game.getUserFromID(data.id);
		    	if(user)user.car.brake = parseInt(data.val);
		    }

	    });
	 
	},

	getUserFromID: function(id){
		var userIndex = -1;
    	for(var i = 0; i < Game.users.length; i++){
    		if(Game.users[i].id == id){
    			userIndex = i;
    		}
    	}
    	return Game.users[userIndex];
	},

	sendMessage: function(msg){
		this.socket.send(msg);
	},

	createCar: function(user){
		
		user.car = Car.create(user);
		user.car.init();
		Game.users.push(user);
	},

	removeUser: function(id){
		var userIndex;
    	for(var i = 0; i < Game.users.length; i++){
    		if(Game.users[i].id == id){
    			userIndex = i;
    		}
    	}
    	Game.users[userIndex].car.spriteContainer.remove();
    	Game.users.splice(userIndex);
	},
	createID: function(){
		var id = '';
		var alpha = 'abcdefghijklmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
		var arr = alpha.split('');
		for(var i = 0; i < 5; i++){
			var index = Math.floor(Math.random() * arr.length);
			id += arr[index];
		}
		return id;
	}

}

Car = {
	create: function(user){
		var c = {};
		c.speed = 0;
		c.rotation = 0;
		c.x = Math.random() * Game.gameSize.width;
		c.y = Math.random() * Game.gameSize.height;
		c.turnVector = 0;
		var carIndex = Math.floor(Math.random() * 8);
		//c.sprite = $('<div class="car" style="background: url(images/car_'+carIndex+'.png)"></div>');
		c.sprite = $('<div class="car"><img src="images/car_'+carIndex+'.png" /></div>');
		c.shadow = $('<div class="shadow"><img src="images/shadow.png" /></div>');
		c.spriteContainer = $('<div class="carContainer"><span class="nickname">'+user.nickname+'</span></div>');
		c.spriteContainer.append(c.shadow);
		c.spriteContainer.append(c.sprite);
		c.accelerate = 0;
		c.brake = 0;
		$('#container').append(c.spriteContainer);

		c.init = function(){
			this.interval = setInterval(this.tick, 30);
		}
		
		c.tick = function(){
			
			if(c.accelerate){
				c.speed += 0.1;
			} else {
				c.speed -= 0.01;
			}
			if(c.brake){
				c.speed -= 0.2;
			}

			if(c.speed < 0)c.speed = 0;
			if(c.speed > 10)c.speed = 10;

			c.rotation += (c.turnVector) * (c.speed * 0.7);
			var rotationRads = c.rotation / 57.2957795;
			var xVector = Math.sin(rotationRads) * c.speed;			
			var yVector = Math.cos(rotationRads) * c.speed;
			
			c.x += xVector;
			c.y -= yVector;
			if(c.x > Game.gameSize.width)c.x = -100;
			if(c.x < -100)c.x = Game.gameSize.width;
			if(c.y > Game.gameSize.height)c.y = -100;
			if(c.y < -100)c.y = Game.gameSize.height;
			

			c.spriteContainer.css('top', c.y + "px");
			c.spriteContainer.css('left', c.x + "px");
			c.sprite.css("-webkit-transform", "rotate("+c.rotation+"deg)");
			c.shadow.css("-webkit-transform", "rotate("+c.rotation+"deg)");
			c.sprite.css("-moz-transform", "rotate("+c.rotation+"deg)");
			c.shadow.css("-moz-transform", "rotate("+c.rotation+"deg)");
		}
		return c;

	}
}

Game.init();