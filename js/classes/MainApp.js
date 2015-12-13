define([
	"funcs",
	"eva",
	"jquery",
	"classes/Cigarette",
	"classes/Chicken",
	"classes/Egg",
	"classes/Block",
	"classes/map/lvl1",
	"classes/map/lvl2",
	"classes/map/lvl3",
	"classes/map/lvl4",
	"classes/map/lvl5"
], function(f, Events, $, Cigarette, Chicken, Egg, Block,
	lvl1, lvl2, lvl3, lvl4, lvl5) {

	var PROP = 1; // масштаб относительно исходного экрана (667px в высоту)
	var lvls = [lvl1, lvl2, lvl3, lvl4, lvl5];
	var MainApp = f.CreateClass("MainApp", {}, Events);

	MainApp.prototype.init = function(params) {
		params = params || {};
		for (var key in params) {
			this[key] = params[key];
		}

		// some inits...
		this._speed = 7;
		this.speed = this._speed;
		this.score = 0;
		this.$score = $(".score");
		this._paused = true;
		this.frameTime = 30;
		this._fireDelay = 0;
		this.triangleIndex = 0;
		this.initCanvas();
		this.initControls();

		this.chicken = new Chicken();
		this.chicken.mass = 15 * PROP;
		this.chicken._jumpIndex = 0;

		this.gravityObjects = [this.chicken];
		this.eggs = [];
		this.cigarettes = [];
		this.blocks = [];

		this.initBlockImage(function() {
			this.chicken.r *= PROP;
			this.createMap(lvl1);
			this.initTimer();
			this.initMenu();
		}.bind(this));
	};

	MainApp.prototype.initMenu = function() {
		this.$menu = $(".menu");
		this.$button = this.$menu.find(".button");

		this.$button.on("click", function(e) {
			e.preventDefault();
			$(document.body).addClass("play");
			this.score = 0;
			this.play();
		}.bind(this));
	};

	MainApp.prototype.play = function() {
		this._paused = false;
	};

	MainApp.prototype.pause = function() {
		this._paused = true;
	};

	MainApp.prototype.initBlockImage = function(callback) {
		this.blockImage = new Image();
		this.blockImage.onload = function() {
			callback();
		}.bind(this);
		this.blockImage.src = "img/block.png";
	};

	MainApp.prototype.initCamera = function() {
		this.camera = {
			x: 0,
			y: 0
		};
	};

	MainApp.prototype.onResize = function() {
		var windSize = f.getWindowSize();
		this.size = windSize;
		this.canvas.width = windSize.width;
		this.canvas.height = windSize.height;
		PROP = this.size.height / 667;
		this.landY = this.size.height * 0.9;
	};

	MainApp.prototype.initCanvas = function() {
		this.canvas = document.getElementById("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.onResize();

		var windSize = f.getWindowSize();
		this.size = windSize;
		this.canvas.width = windSize.width;
		this.canvas.height = windSize.height;

		$(window).on("resize", this.onResize.bind(this));
	};

	MainApp.prototype.initTimer = function() {
		this.leftTime = 0;
		this.interval = setInterval(function() {
			if ( this._paused ) {
				this.draw();

				if ( this.keyCodes[13] ) {
					this.$button.click();
				}
				return;
			}

			this.frame();

			this.leftTime += this.frameTime;
			if ( this.leftTime > 1000000 ) {
				this.leftTime = 0;
			}
		}.bind(this), this.frameTime);
	};

	MainApp.prototype.initControls = function() {
		this.keyCodes = {};

		$(window).on("keydown", function(e) {
			this.keyCodes[e.keyCode] = true;
			this.onKeydown(e);
		}.bind(this));

		$(window).on("keyup", function(e) {
			delete this.keyCodes[e.keyCode];
			this.onKeyup(e);
		}.bind(this));
	};

	MainApp.prototype.onKeydown = function(e) {
		//console.log(this.keyCodes);
		// 32 space
		// 17 ctrl
		if ( this.keyCodes[32] || this.keyCodes[17] ) {
			e.preventDefault();
		}
	};

	MainApp.prototype.draw = function() {
		this.canvas.width += 0; // clear
		this.drawBg();
		//this.drawSky();

		this.drawBlocks();
		this.drawCigarettes();
		this.drawEggs();
		this.chicken.draw(this.ctx);
		this.drawScore();
		// отрисовка областей соприкосновения
		/*
		var obj, objs = this.chicken.getCollisionCircles(), i, egg, cigarette;
		this.ctx.strokeStyle = "red";
		for (i = 0; i < objs.length; i++) {
			obj = objs[i];
			this.ctx.beginPath();
			this.ctx.arc(obj.x, obj.y, obj.collisionRadius, 0, Math.PI * 2);
			this.ctx.stroke();
		}

		for (i = 0; i < this.eggs.length; i++) {
			egg = this.eggs[i];
			this.ctx.beginPath();
			this.ctx.arc(egg.x, egg.y, egg.collisionRadius, 0, Math.PI * 2);
			this.ctx.stroke();
		}

		for (i = 0; i < this.cigarettes.length; i++) {
			cigarette = this.cigarettes[i];
			this.ctx.beginPath();
			this.ctx.arc(cigarette.x, cigarette.y, cigarette.collisionRadius, 0, Math.PI * 2);
			this.ctx.stroke();
		}
		*/
	};

	MainApp.prototype.drawScore = function() {
		this.$score.html(parseInt(this.score));
	};

	MainApp.prototype.drawSky = function(ctx) {
		var grd = this.ctx.createLinearGradient(0, 0, 0, this.size.height/2);
		grd.addColorStop(0, "#9a9aff");
		grd.addColorStop(1, "#ccccff");

		this.ctx.fillStyle = grd;
		this.ctx.fillRect(0, 0, this.size.width, this.size.height * 0.7);
	};

	MainApp.prototype.gravity = function() {
		var obj, step;
		for (var i = 0; i < this.gravityObjects.length; i++) {
			obj = this.gravityObjects[i];
			if ( obj._gravity === false ) {
				continue;
			}

			obj.y += obj.mass;

			if ( obj.y > this.size.height * 1.5 ) {
				//sooo
			}
		}
	};

	MainApp.prototype.onKeyup = function() {
		//console.log(this.keyCodes);
		//this._jumpIndex = 0;
	};

	MainApp.prototype.processJump = function() {
		var diff = 0;
		// прыжок
		if ( this.keyCodes[32] ) {
			this.chicken._jumpIndex++;
			if ( this.chicken._jumpIndex < 20 ) {
				if ( this.chicken.y > this.chicken.r ) {
					diff = -this.chicken.mass;
					this.chicken.y += diff;
				}
				this.chicken._gravity = false;
			} else {
				this.chicken._gravity = true;
			}
		} else {
			this.chicken._gravity = true;
			this.chicken._jumpIndex = 0;
		}

		return diff;
	};

	MainApp.prototype.processFire = function() {
		// выстрел
		if ( this.keyCodes[17] ) {
			if ( this._fireDelay === 0 ) {
				this.createEgg();
				this._fireDelay += this.frameTime;
			}
		}

		if ( this._fireDelay > 0 ) {
			this._fireDelay += this.frameTime;
			if ( this._fireDelay > 500 ) {
				this._fireDelay = 0;
			}
		}
	};

	MainApp.prototype.frame = function() {
		this.speed += 0.03;
		this.score += this.speed;

		var chickenInFly = true;

		if ( Math.random() > 0.99 ) {
			this.createCigarette();
		}

		this.processFire();
		this.flyEggs();
		this.flyCigarretes();
		this.processBlocks();

		this.processJump();
		this.gravity();

		this.checkObjectsCollisions();
		var collision = this.checkChickenAndBlocksCollision();
		if ( collision ) {
			// курица слево от блока
			if ( collision.circle.x < collision.block.x ) {
				this.gameOver();
				return;
			}
			// курица над блоком
			if ( collision.circle.y < collision.block.y ) {
				this.chicken.y = collision.block.y - this.chicken.r * 0.162;
				chickenInFly = false;
			} else
			// курица под блоком
			if ( this.chicken.y > collision.block.y + collision.block.height ) {
				this.chicken.y = collision.block.y + collision.block.height + this.chicken.r * 3.2;
			}
		}

		if ( !chickenInFly ) {
			this.chicken.go();
			this.chicken.stopFlitter();
		} else {
		// если на земле
			this.chicken.stop();
			this.chicken.flitter();
		}

		if ( this.chicken.y > this.size.height ) {
			this.gameOver();
		}

		this.draw();
	};

	MainApp.prototype.createEgg = function() {
		var egg = new Egg();
		egg.x = this.chicken.x;
		egg.y = this.chicken.y - this.chicken.r * 3;
		egg.mass = 2;
		this.eggs.push(egg);
		this.gravityObjects.push(egg);
	};

	MainApp.prototype.removeEgg = function(egg) {
		var index;

		index = this.eggs.indexOf(egg);
		if ( index != -1 ) {
			this.eggs.splice(index, 1);
		}

		index = this.gravityObjects.indexOf(egg);
		if ( index != -1 ) {
			this.gravityObjects.splice(index, 1);
		}
	};

	MainApp.prototype.drawEggs = function() {
		var egg, i;

		for (i = 0; i < this.eggs.length; i++) {
			egg = this.eggs[i];
			egg.draw(this.ctx);
		}
	};

	MainApp.prototype.flyEggs = function() {
		var egg, i;
		var eggsToRemove = [];

		for (i = 0; i < this.eggs.length; i++) {
			egg = this.eggs[i];

			egg.x += 10;

			if ( egg.x - egg.r * 2 > this.size.width ) {
				eggsToRemove.push(egg);
			}
		}

		for (i = 0; i < eggsToRemove.length; i++) {
			egg = eggsToRemove[i];
			this.removeEgg(egg);
		}
	};

	MainApp.prototype.createCigarette = function() {
		var cigarette = new Cigarette();
		cigarette.x = Math.random() * this.size.width * 0.4 + this.size.width * 0.5;
		cigarette.y = Math.random() * this.chicken.r + this.chicken.y - this.chicken.r;
		cigarette.w *= PROP;
		cigarette.h *= PROP;
		this.cigarettes.push(cigarette);
	};

	MainApp.prototype.removeCigarette = function(cigarette) {
		var index;
		index = this.cigarettes.indexOf(cigarette);
		if ( index != -1 ) {
			this.cigarettes.splice(index, 1);
		}
	};

	MainApp.prototype.drawCigarettes = function() {
		var cigarette, i;

		for (i = 0; i < this.cigarettes.length; i++) {
			cigarette = this.cigarettes[i];
			cigarette.draw(this.ctx);
		}
	};

	MainApp.prototype.flyCigarretes = function() {
		var cigarette, i;
		var cigarettesToRemove = [], index;

		for (i = 0; i < this.cigarettes.length; i++) {
			cigarette = this.cigarettes[i];
			cigarette.x -= this.speed;

			if ( cigarette.x + cigarette.width < 0 ) {
				cigarettesToRemove.push(cigarette);
			}
		}

		for (i = 0; i < cigarettesToRemove.length; i++) {
			cigarette = cigarettesToRemove[i];
			this.removeCigarette(cigarette);
		}
	};

	MainApp.prototype.checkObjectsCollisions = function() {
		var egg, cigarette, block, i, j,
			objs, obj;
		var cigarettesToRemove = [], eggsToRemove = [];

		// проверям столкновение сигарет и яиц
		for (i = 0; i < this.eggs.length; i++) {
			egg = this.eggs[i];
			for (j = 0; j < this.cigarettes.length; j++) {
				cigarette = this.cigarettes[j];

				if ( this.checkRadiusCollision(egg, cigarette) ) {
					cigarettesToRemove.push(cigarette);
					eggsToRemove.push(egg);
					this.speed *= 0.9;
				}
			}
		}

		// проверяем столкновение сигареты и курицы
		objs = this.chicken.getCollisionCircles();
		for (i = 0; i < objs.length; i++) {
			obj = objs[i];

			for (j = 0; j < this.cigarettes.length; j++) {
				cigarette = this.cigarettes[j];

				if ( this.checkRadiusCollision(obj, cigarette) ) {
					cigarettesToRemove.push(cigarette);
					this.gameOver();
				}
			}
		}

		// удаляем столкнувшиеся объекты
		for (i = 0; i < cigarettesToRemove.length; i++) {
			cigarette = cigarettesToRemove[i];
			this.removeCigarette(cigarette);
		}
		for (i = 0; i < eggsToRemove.length; i++) {
			egg = eggsToRemove[i];
			this.removeEgg(egg);
		}
	};

	MainApp.prototype.checkChickenAndBlocksCollision = function() {
		var block, obj, objs, i, j;
		objs = this.chicken.getCollisionCircles();

		// проверяем столкновение курицы и блоков
		for (i = 0; i < this.blocks.length; i++) {
			block = this.blocks[i];

			for (j = 0; j < objs.length; j++) {
				obj = objs[j];

				if ( this.checkCircleAndBlockCollision(obj, block) ) {
					return {block: block, circle: obj};
				}
			}
		}

		return false;
	};

	MainApp.prototype.checkCircleAndBlockCollision = function(circle, block) {
		var r = circle.collisionRadius,
			cx = circle.x,
			cy = circle.y,
			bx = block.x,
			by = block.y,
			bw = block.width,
			bh = block.height;

				// top
		return  this.checkCircleAndLine(bx, by, bx + bw, by, cx, cy, r) ||
				// bottom
				this.checkCircleAndLine(bx, by + bh, bx + bw, by + bh, cx, cy, r) ||
				// left
				this.checkCircleAndLine(bx, by, bx, by + bh, cx, cy, r) ||
				// right
				this.checkCircleAndLine(bx + bw, by, bx + bw, by + bh, cx, cy, r);
	};

	MainApp.prototype.checkCircleAndLine = function(x1, y1, x2, y2, cx, cy, r) {
		// используем квадратное уравнение
		x1 -= cx;
		y1 -= cy;
		x2 -= cx;
		y2 -= cy;

		var dx = x2 - x1,
			dy = y2 - y1,
			a = dx * dx + dy * dy,
			b = 2 * ( x1 * dx + y1 * dy ),
			c = x1 * x1 + y1 * y1 - r * r;

		if ( -b < 0 ) {
			return c < 0;
		}

		if ( -b < 2 * a ) {
			return 4 * a * c - b * b < 0;
		}

		return a + b + c < 0;
	};


	MainApp.prototype.checkRadiusCollision = function(obj1, obj2) {
		var r = Math.sqrt( (obj2.x - obj1.x) * (obj2.x - obj1.x) + (obj2.y - obj1.y) * (obj2.y - obj1.y) );
		return r < obj1.collisionRadius + obj2.collisionRadius;
	};

	MainApp.prototype.createBlock = function() {
		var block = new Block(this.blockImage);
		this.blocks.push(block);
		return block;
	};

	MainApp.prototype.removeBlock = function(block) {
		var index = this.blocks.indexOf(block);
		if ( index != -1 ) {
			this.blocks.splice(index, 1);
		}
	};

	MainApp.prototype.drawBlocks = function() {
		var block, i;

		for (i = 0; i < this.blocks.length; i++) {
			block = this.blocks[i];
			block.draw(this.ctx);
		}
	};

	MainApp.prototype.processBlocks = function() {
		var lvl = this.currentLvl;
		this._blockX += this.speed;
		if ( this._blockX + this.size.width > lvl.width &&
			this._blockX > 50
		) {
			newLvl = lvls[ Math.floor( Math.random() * lvls.length ) ];
			this.createMap(newLvl, this.size.width);
		}
		this.flyBlocks();
	};

	MainApp.prototype.flyBlocks = function() {
		var block, i, blocksToRemove = [];

		// двигаем у удаляем блоки
		for (i = 0; i < this.blocks.length; i++) {
			block = this.blocks[i];
			block.x -= this.speed;

			if ( block.x + block.width < 0 ) {
				blocksToRemove.push(block);
			}
		}

		for (i = 0; i < blocksToRemove.length; i++) {
			blcok = blocksToRemove[i];
			this.removeBlock(blcok);
		}
	};

	MainApp.prototype.createMap = function(lvl, dx) {
		dx = dx || 0;
		var params, i, block;

		for (i = 0; i < lvl.blocks.length; i++) {
			 params = lvl.blocks[i];
			 block = this.createBlock(this.blockImage);
			 block.x = params.x + dx;
			 block.y = params.y * PROP;
		}

		this._blockX = -dx;
		this.currentLvl = lvl;
	};

	MainApp.prototype.drawBg = function() {

		var w = this.size.width,
			h = this.size.height,
			x = w / 2,
			y = h / 2;

		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.fillStyle = "#444444";
		this.ctx.fillRect(0, 0, this.size.width, this.size.height);

		var diff = this.score/2 % (w * 2);
		if ( diff < 15 ) {
			this.triangleIndex++;
		}

		var grd = this.ctx.createLinearGradient(0, 0, 0, this.size.height/2);
		grd.addColorStop(0, "#222");
		grd.addColorStop(1, "#444");

		var type = this.triangleIndex % 4;
		if ( type === 0 ) {
			this.drawTriangle(x - diff + w, y, w, h, grd);
			this.drawTriangle(x - diff + w - w / 3, y, w / 2, h * 0.8, grd);
		} else
		if ( type === 1 ) {
			this.drawTriangle(x - diff + w, y, w, h, grd);
			this.drawTriangle(x - diff + w + w / 3, y, w / 2, h * 0.6, grd);
		} else
		if ( type === 2 ) {
			this.drawTriangle(x - diff + w, y, w, h, grd);
			this.drawTriangle(x - diff + w - w / 5, y, w / 3, h * 0.8, grd);
		} else
		if ( type === 3 ) {
			this.drawTriangle(x - diff + w, y, w, h, grd);
			this.drawTriangle(x - diff + w + w / 3, y, w / 2, h * 0.3, grd);
		}
	};

	MainApp.prototype.drawTriangle = function(x, y, w, h, fillStyle) {
		var x0 = x - w/3,
			y0 = y + h/3,
			x1 = x,
			y1 = y - h/3,
			x2 = x + w/3,
			y2 = y + h/3;

		this.ctx.fillStyle = fillStyle;
		this.ctx.moveTo(x0, y0);
		this.ctx.lineTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.beginPath();
		this.ctx.restore();
	};

	MainApp.prototype.gameOver = function() {
		this.pause();
		this.chicken.y = 142;
		this.blocks = [];
		this.speed = this._speed;
		this.createMap(lvl1);
		$(document.body).removeClass("play");
	};

	return MainApp;
});
