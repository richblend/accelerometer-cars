var Controller = {

	socket: null,
	curAccelerationY: 0,
	throttledTurnFunc: null,
	gameID: null,

	init: function(){
		this.connect();
		var scope = this;
		$('.joinBtn').bind('click', function(e){
			e.preventDefault();
			scope.joinGame();
		});

		$('.accelerator').bind('touchstart', function(e){
			e.preventDefault();
			$('.acceleratorHighlight').show();
			scope.accelerate(true);
		});

		$('.accelerator').bind('touchend', function(e){
			e.preventDefault();
			$('.acceleratorHighlight').hide();
			scope.accelerate(false);
		});

		$('.brake').bind('touchstart', function(e){
			e.preventDefault();
			$('.brakeHighlight').show();
			scope.brake(true);
		});

		$('.brake').bind('touchend', function(e){
			e.preventDefault();
			$('.brakeHighlight').hide();
			scope.brake(false);
		});

		Controller.throttledTurnFunc = _.throttle(Controller.turnCar, 20);

		
	},

	connect: function(){
		
		this.socket = io.connect('http://www.richsavage.co.uk:8000');
		this.socket.on('connect', function (){
	    	console.log('connected');
			$('.connecting').hide();
	    	$('.controllerIntro').fadeIn();
	    });

	    

	    this.socket.on('message', function (msg) {
	    	console.log(msg);
	    });
	 
	},

	joinGame: function(){
		Controller.userID = Controller.createID();
		Controller.gameID = window.location.href.split('#')[1];
		var payload = '{"type": "joinGame", "nickname": "' + $('#nickname').val() + '", "id": "' + Controller.userID + '", "gameID": "'+Controller.gameID+'"}';
		Controller.sendMessage(payload);

		$('.controllerIntro').slideUp();
		$('.controllerControls').show();

		window.ondevicemotion  = function(event){
			var accelerationY = event.accelerationIncludingGravity.y;  
			Controller.throttledTurnFunc(accelerationY / -9);
		}
	},

	turnCar: function(vector){
		var str = vector.toString().substr(0, 5);

		var payload = '{"type": "tv", "v": "'+str+'", "id": "'+Controller.userID +'", "gameID": "'+Controller.gameID+'"}';
		Controller.sendMessage(payload);
	},

	accelerate: function(bool){
		var payload;
		if(bool){
			payload = '{"type": "ac", "val": 1, "id": "'+Controller.userID +'", "gameID": "'+Controller.gameID+'"}';
		} else {
			payload = '{"type": "ac", "val": 0, "id": "'+Controller.userID +'", "gameID": "'+Controller.gameID+'"}';
		}
		Controller.sendMessage(payload);
	},

	brake: function(bool){
		var payload;
		if(bool){
			payload = '{"type": "br", "val": 1, "id": "'+Controller.userID +'", "gameID": "'+Controller.gameID+'"}';
		} else {
			payload = '{"type": "br", "val": 0, "id": "'+Controller.userID +'", "gameID": "'+Controller.gameID+'"}';
		}
		Controller.sendMessage(payload);
	},

	sendMessage: function(msg){
		console.log('Send:', msg);
		this.socket.send(msg);
	},

	createID: function(){
		var id = '';
		var alpha = 'abcdefghijklmnpqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
		var arr = alpha.split('');
		for(var i = 0; i < 5; i++){
			var index = Math.floor(Math.random() * arr.length);
			id += arr[index];
		}
		return id;
	}

}

Controller.init();