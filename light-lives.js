/*****************
 * Light Lives
 *
 * Copyright (c) 2016 Luiz Felipe(Superbomber / DieBoy)
 * Distributed under the MIT license.
 *
 * Repository: https://github.com/DieBoy/Light-Lives/
 *****************/

// ---- Languages ---- //

var LG = navigator.language;
if(!/pt-BR|en-US/.test(LG)) LG = "en-US";

var lgLoading = {
		"pt-BR" : "Carregando...",
		"en-US" : "Loading..."
};

function limit(val, min, max){
	if(val < min)      val = min;
	else if(val > max) val = max;
	return val;
}

function limitPosition(){
	if(Self.x < 0)          Self.angle = 0;
	if(Self.x > roomWidth)  Self.angle = 180;
	if(Self.y < 0)		    Self.angle = 270;
	if(Self.y > roomHeight) Self.angle = 90;
}

function spawnEnemy(x, y){
	var enemy = Math.choose(enemyBomb, enemyLight, enemyUV);
	
	if(x != null && y != null){
		new Entity(enemy, x, y);
	} else {
		new Entity(enemy, Math.randombet(0, roomWidth), Math.randombet(0, roomHeight));
	}
}

function init(){
	// Initiating values
	Game.setCanvas("game");
	roomWidth  = 1500;
	roomHeight = 1500;
	
	// ---- Backgrounds ---- //
	bgBlack = new Background("images/background.png", true);

	// ---- Rooms ---- //
	rmMenu 		 	= new Room();
	rmMenu.bgColor  = "#223";
	rmMenu.Start    = function(){
		rmMenu.startG 	= false;
		rmMenu.showHelp = false;
		
		// ---- Virtual Keys ---- //
		if(Touch.support){
			if(typeof vkLeft != "undefined"){
				vkLeft.delete();
				vkRight.delete();
			}
			
			VStyles.circle.font = "32px Agency FB";
			VStyles.circle.color = "#445";
			
			vkLeft 		   = new VKey(lang.help[LG], 32, Game.canvas.height-32, Key.left, VStyles.circle);
			vkLeft.radius  = 30;
			
			vkRight		    = new VKey(lang.start[LG], Game.canvas.width-32, Game.canvas.height-32, Key.right, VStyles.circle);
			vkRight.radius  = 30;
		}
	}
	rmMenu.Step1 	= function(){
		if(rmMenu.startG) return;
		
		if(!rmMenu.showHelp){
			Sys.repeat(10, function(i){
				prtPlayer.emit(15, 45 + (10*i), 1.5, Math.randombet(0, 360));
			});
			Sys.repeat(5, function(i){
				prtPlayer.emit(15 + (10*i), 145, 1.5, Math.randombet(0, 360));
			}); // L
		}
		
		if( Key.inDown(Key.left) ){
			rmMenu.showHelp = !rmMenu.showHelp;
		} else if( Key.inDown(Key.right) ){
			rmMenu.startG = true;
			
			Sys.delayed(1000, function(){
				Game.room = rmGame;
			});
		}
	}
	rmMenu.Draw = function(){
		if(rmMenu.startG) return;
		
		Draw.font = "18px Agency FB";
		Draw.text(lang.credit[LG], 5, 25, "#D44");
		
		if(!Touch.support){
			Draw.font = "16px Agency FB";
			Draw.text(lang.txtMenu[LG], 5, 375, "#44D");
		}
		
		Draw.font = "100px sans-serif";
		Draw.text("ight", 70, 145, "#CA3");
		Draw.font = "72px sans-serif";
		Draw.text("Lives", 35, 230, "#CA3");
		
		Draw.font = "22px sans-serif";
		if(Data.load("highscore") != null){
			Draw.text(lang.record[LG] + Data.load("highscore"), 10, 320, "#B94");
		}
		
		// Help
		if(rmMenu.showHelp){
			Draw.colorFill = "rgba(33, 33, 33, 0.9)";
			Draw.rectangle(5, 40, 230, 343);
			
			Draw.colorFill = "#46D";
			Draw.font	   = "18px Agency FB";
			Draw.text(lang.txtHelpLeft[LG] , 10, 60);
			Draw.text(lang.txtHelpRight[LG], 10, 84);
			Draw.text(lang.txtHelpTwo[LG]  , 10, 108);
		}
	}
	
	rmGame 			  = new Room();
	rmGame.background = bgBlack;
	rmGame.setViewLimit(0, 0, roomWidth-240, roomHeight-400);
	rmGame.setFollowLimit(1, 1);
	
	rmGame.Start = function(){
		rmGame.dead   = false;
		rmGame.maxlig = 100;
		
		new Entity(player, 5, 5);
		spawnEnemy(300, Math.randombet(10, 400));
		spawnEnemy(Math.randombet(10, 240), 450);
		Sys.repeat(5, spawnEnemy);
		
		if(Touch.support){
			vkLeft.style.font = vkRight.style.font  = "100px Agency FB";
			vkLeft.text 	  = "<";
			vkRight.text	  = ">";
		}
		
		rmGame.view.follow = player;
	}
	rmGame.Draw  = function(){
		var view = Game.room.view;
		if(rmGame.dead){
			Draw.colorFill = "#222";
			Draw.rectangle(view.x + 5, view.y + 5, Game.canvas.width-10, Game.canvas.height-22);
			
			Draw.font = "32px Agency FB";
			Draw.text(lang.dead[LG], view.x + 55, view.y + 70, "#B94");
			Draw.text("+"+ lang.lights[LG] + Math.floor(Self.maxlig), view.x + 55, view.y + 110, "#A94");
			
			Draw.colorFill = "#46D";
			Draw.font	   = "18px Agency FB";
			Draw.text(lang.txtReturn[LG] , view.x + 10, view.y + 180);
			Draw.text(lang.txtNewGame[LG] , view.x + 10, view.y + 200);
		}
	}
	rmGame.Step1 = function(){
		if(rmGame.dead){
			if( Key.inDown(Key.left) ){
				Game.room = rmMenu;
			} else if( Key.inDown(Key.right) ){
				Game.room = rmGame;
			}
			return;
		}
		var play = player.getEntity(0);
		if(play == null) return;
		
		var xx = Game.room.view.x + Game.canvas.width;
		var yy = Game.room.view.y + Game.canvas.height;
		var pp = Math.radiusGetPoint(400, play.angle);
		
		if(Game.room.time%(60*10) == 0)
			new Entity(light, Math.randombet(0, roomWidth), Math.randombet(0, roomHeight));
		
		if(Game.room.time%(60*7) == 0)  spawnEnemy();
		if(Game.room.time%(60*15) == 0) spawnEnemy(play.x + pp.x, play.y + pp.y);
	}
	
	// ---- Sprites ---- //
	sprPlayer = new Sprite("images/light.png", 16, 16);
	sprEnemy  = new Sprite("images/redlight.png", 16, 16);
	
	// ---- Masks ---- //
	mskCol = new Mask(32, 32);
	mskCol.simple(0, 0, 32, 32);
	
	// ---- Particles ---- //
	prtPlayer 		= new Part("images/light.png", 16, 16, 25);
	prtPlayer.alpha = 0.7;
	prtPlayer.setScale(0.5, 0.5);
	prtPlayer.setTransform(-(0.5 / 25), -(0.5 / 25), -(1 / 25));
	
	prtEnemy 		= new Part("images/redlight.png", 16, 16, 25);
	prtPlayer.alpha = 0.7;
	prtEnemy.setScale(0.7, 0.7);
	prtEnemy.setTransform(-(0.7 / 25), -(0.7 / 25), -(0.7 / 25));
	
	// ---- Models ---- //
	light 		= new Model();
	light.Step1 = function(){
		var play = player.getEntity(0);
		if(Math.distance(Self.x, Self.y, play.x, play.y) < 16){
			play.lights += Math.randombet(5, 20);
			Self.remove();
		}
		if(Game.room.time%10 == 0){
			prtPlayer.emit(Self.x, Self.y, 0.5, Math.randombet(0, 360));
			prtPlayer.emit(Self.x, Self.y, 0.5, Math.randombet(0, 360));
		}
	}
	
	shoot 		 = new Model();
	shoot.Create = function(){
		Self.speed = 6;
		Self.scale = 0.5;
		Self.time  = 0;
	}
	shoot.Step1 = function(){
		if(Game.room.time%2 == 0) prtPlayer.emit(Self.x, Self.y, 0.8, Math.randombet(0, 360));
		
		if(Self.time == 30){
			Self.remove();
			var asx = prtPlayer.xscale, asy = prtPlayer.yscale;
			prtPlayer.setScale(Self.scale, Self.scale);
			
			Sys.repeat(15, function(){
				prtPlayer.emit(Self.x, Self.y, 3, Math.randombet(0, 360));
			});
			
			prtPlayer.setScale(asx, asy);
		}
		Self.time++;
	}
	
	player 		  = new Model(sprPlayer);
	player.mask   = mskCol;
	player.layer  = 1;
	player.Create = function(){
		Self.force    = 1;
		Self.lights   = 100;
		Self.incharge = false;
		Self.shoot    = function(){
			var asx = prtPlayer.xscale, asy = prtPlayer.yscale, sht;
			prtPlayer.setScale(0.5 + Self.force/10, 0.5 + Self.force/10);
			
			if(Self.lights < 100){
				prtPlayer.emit(Self.x, Self.y, 15, Self.angle-3);
				prtPlayer.emit(Self.x, Self.y, 15, Self.angle);
				prtPlayer.emit(Self.x, Self.y, 15, Self.angle+3);
			} else if(Self.lights < 200){
				sht   	  = new Entity(shoot, Self.x, Self.y);
				sht.scale = 0.5 + (Self.force / 10);
				sht.angle = Self.angle;
			} else {
				Sys.repeat(3, function(i){
					sht   	  = new Entity(shoot, Self.x, Self.y);
					sht.scale = 0.5 + (Self.force / 10);
					sht.angle = Self.angle + (i*4) - 4;
				});
			}
			
			prtPlayer.setScale(asx, asy);
			Self.force = 1;
		}
	}
	
	player.Draw = function(){
		var L 		= Math.floor( Self.lights );
		if(L < 0) L = 0;
		
		Draw.font = "32px Agency FB";
		Draw.text(lang.lights[LG] + L, Game.room.view.x+5, Game.room.view.y+34, "#A94");
	}
	
	player.Step1 = function(){
		if(Self.lights > Game.room.maxlig) Game.room.maxlig = Self.lights;
		
		// Hit
		if( Col.simple.particle(Self, prtEnemy) ){
			Self.lights -= Other.xscale;
		}
		
		// Movement
		if(!Self.incharge){
			Sys.repeat(3, function(){
				var mp = Math.radiusGetPoint(1, Self.angle);
				Self.x = limit(Self.x + mp.x, 0, roomWidth);
				Self.y = limit(Self.y + mp.y, 0, roomHeight);
			});
		}
		
		// Die
		if(Self.lights < 1){
			Self.remove();
			Sys.withModel(All, function(){
				if(Self.model == player) return;
				Self.paused = true;
			});
			
			var asx = prtPlayer.xscale, asy = prtPlayer.yscale;
			prtPlayer.setScale(1, 1);
			Sys.repeat(15, function(){
				prtPlayer.emit(Self.x, Self.y, 1, Math.randombet(0, 360));
			});
			Sys.repeat(50, function(){
				prtPlayer.emit(Self.x, Self.y, 5, Math.randombet(0, 360));
			});
			Sys.repeat(50, function(){
				prtPlayer.emit(Self.x, Self.y, 10, Math.randombet(0, 360));
			});
			
			Sys.delayed(1000, function(){
				var score = Math.floor( Game.room.maxlig );
				Game.room.dead = true;
				if(Data.load("highscore") < score) Data.save("highscore", score);
			});
			
			prtPlayer.setScale(asx, asy);
			return;
		}
		
		// Attack
		if( !Key.isDown(Key.right) || !Key.isDown(Key.left) ){
			if(Self.incharge){
				Self.shoot();
			}
			Self.incharge = false;
		}
		
		if( Key.isDown(Key.right) && Key.isDown(Key.left) ){
			Self.incharge = true;
			if(Self.force < 5) Self.force += 0.15;
			else Self.shoot();
			
		} else if( Key.isDown(Key.right) ){
			Self.angle -= 7;
		} else if( Key.isDown(Key.left) ){
			Self.angle += 7;
		}
		
		if(Game.room.time%2 == 0){
			prtPlayer.emit(Self.x, Self.y, 0.7, Math.randombet(0, 360));
		}
	}
	
	enemyBomb 	   	 = new Model();
	enemyBomb.mask 	 = mskCol;
	enemyBomb.Create = function(){
		Self.life  = 100;
		Self.editD = false;
		Self.dir   = 0;
	}
	enemyBomb.Step1 = function(){
		var play = player.getEntity(0);
		
		// Movement
		if(Math.distance(Self.x, Self.y, play.x, play.y) > 100){
			Self.speed = 1;
			if(Math.random() > 0.8){
				Self.editD = !Self.editD;
				Self.dir   = Math.randombet(-5, 5);
			}
			
			if(Self.editD) Self.angle += Self.dir;
		} else {
			Self.speed = 1.5;
			Self.angle = Math.angle(Self.x, Self.y, play.x, play.y);
			
			// Shoot
			if(Math.random() == 1){
				prtEnemy.emit(Self.x, Self.y, 15, Self.angle);
			}
		}
		
		if( Col.simple.particle(Self, prtPlayer) ){
			Self.life -= 1 + (Other.xscale * 2);
		}
		
		// Die
		if(Self.life <= 0){
			Self.remove();
			var asx = prtEnemy.xscale, asy = prtEnemy.yscale;
			prtEnemy.setScale(1.5, 1.5);
			Sys.repeat(30, function(){
				prtEnemy.emit(Self.x, Self.y, 10, Math.randombet(0, 360));
			});
			prtEnemy.setScale(asx, asy);
			if(Math.distance(Self.x, Self.y, play.x, play.y) < 100){
				play.lights -= Math.floor( Math.randombet(10, 30) );
			}
			
			new Entity(light, Self.x, Self.y);
			new Entity(light, Self.x, Self.y);
			return;
		}
		
		prtEnemy.emit(Self.x, Self.y, 1, Math.randombet(0, 360));
		limitPosition();
	}
	
	enemyUV 	   = new Model();
	enemyUV.mask   = mskCol;
	enemyUV.Create = function(){
		Self.life  = 100;
		Self.editD = false;
		Self.dir   = 0;
	}
	enemyUV.Step1 = function(){
		var play = player.getEntity(0);
		
		// Movement
		if(Math.distance(Self.x, Self.y, play.x, play.y) > 200){
			Self.speed = 0.8;
			if(Math.random() > 0.8){
				Self.editD = !Self.editD;
				Self.dir   = Math.randombet(-5, 5);
			}
			
			if(Self.editD) Self.angle += Self.dir;
		} else {
			Self.speed = 1;
			if(Self.editD){
				Self.angle = Math.choose(0, 90, 180, 270);
				Self.editD = false;
				Sys.delayed(1000, function(){
					Self.editD = true;
				});
			}
		}
		
		if( Col.simple.particle(Self, prtPlayer) ){
			Self.life -= 1 + (Other.xscale * 2);
		}
		
		// Die
		if(Self.life <= 0){
			Self.remove();
			Sys.repeat(5, function(){
				prtEnemy.emit(Self.x, Self.y, 1.5, Math.randombet(0, 360));
			});
			Sys.repeat(3, function(){
				prtEnemy.emit(Self.x, Self.y, 0.8, Math.randombet(0, 360));
			});
			
			new Entity(light, Self.x, Self.y);
			return;
		}
		
		
		// Shoot
		if(Math.random() > 0.97){
			prtEnemy.emit(Self.x, Self.y, 15, Math.angle(Self.x, Self.y, play.x, play.y));
		}
		
		if(Game.room.time%30 == 0){
			prtEnemy.emit(Self.x, Self.y, 0.8, Math.randombet(0, 360));
		}
		
		limitPosition();
	}
	
	enemyLight 		  = new Model(sprEnemy, 16, 16);
	enemyLight.mask   = mskCol;
	enemyLight.Create = function(){
		Self.life  = 100;
		Self.editD = false;
		Self.dir   = 0;
	}
	enemyLight.Step1 = function(){
		var play = player.getEntity(0);
		
		if(Game.room.time%2 == 0){
			prtEnemy.emit(Self.x, Self.y, 0.8, Math.randombet(0, 360));
		}
		
		if( Col.simple.particle(Self, prtPlayer) ){
			Self.life -= 1 + (Other.xscale * 2);
		}
		
		// Die
		if(Self.life <= 0){
			Self.remove();
			Sys.repeat(5, function(){
				prtEnemy.emit(Self.x, Self.y, 0.8, Math.randombet(0, 360));
			});
			
			new Entity(light, Self.x, Self.y);
			return;
		}
		
		// Movement
		if(Math.distance(Self.x, Self.y, play.x, play.y) > 150){
			Self.speed = 0.8;
			if(Math.random() > 0.8){
				Self.editD = !Self.editD;
				Self.dir   = Math.randombet(-5, 5);
			}
			
			if(Self.editD) Self.angle += Self.dir;
		} else {
			Self.speed = 2;
			Self.angle = Math.angle(Self.x, Self.y, play.x, play.y);
			
			// Shoot
			if(Math.random() > 0.95){
				prtEnemy.emit(Self.x, Self.y, 15, Self.angle);
			}
		}
		
		limitPosition();
	}
	
	Game.room = rmMenu;
	
	// Starting the game
	Sys.loading(Game.run, lgLoading[LG]);
}