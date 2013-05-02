var io = require('socket.io').listen(8000);


var games = {};



io.sockets.on('connection', function (socket) {
  
	socket.on('disconnect', function() {
    
    //find if this socket is a game. if so, just remove it.
    var found = false;
    for(var game in games){

      if(games[game].socket === socket){
        delete games[game];
        found = true;
        break;
      }
    }

    //otherwise it must be a user, so loop through all games to find it
    if(!found){
      for(var game in games){
        for(var i = 0; i < games[game].users.length; i++){
          if(games[game].users[i].socket === socket){
            games[game].socket.send('{"type": "disconnect", "id": "'+games[game].users[i].id+'"}');
          }
        }
      }
    }

    
  })

	

	socket.on('message', function (message) {

      var data = JSON.parse(message);
  		if(data.type == 'gameRegister'){

  			var game = {};
        game.socket = socket;
        game.users = [];
        games[data.gameID] = game;

  		}

  		if(data.type == 'joinGame'){
  			
        var user = {};
  			user.nickname = data.nickname;
  			user.id = data.id;
  			user.socket = socket;

        try{
          games[data.gameID].users.push(user);
    
    			games[data.gameID].socket.send(message);
        } catch(e){}
  		}

  		if(data.type == 'tv'){
        //turn vector messages arent as important and will be coming thcik and fast - send them volatile
  			
        try{
          games[data.gameID].socket.volatile.send(message);
        } catch(e){}
  		}

      if(data.type == 'ac' || data.type == 'br'){
        try{
          games[data.gameID].socket.send(message);
        } catch(e){}
      }



	});
	
});