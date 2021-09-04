/**
 * 2020 Sergio Soriano - sergiosoriano.com
 */

var SHAPES = [
    [ 1632                   ],
    [ 8738, 3840, 17476, 240 ],
    [ 610 ,  114,   562, 624 ],
    [ 802 , 1136,   550, 113 ],
    [ 1570, 116 ,   547, 368 ],
    [ 561 , 864 ,  1122,  54 ],
    [ 306 , 1584,   612,  99 ]
];

var COLORS = [ "#111", "#00a300", "#9f00a7", "#603cba", "#ffc40d", "#ee1111", "#99b433", "#ff0097"];

var dw = 180;
var dh = 380;

class Tetris extends Loop {

    constructor() {
        super();
        this.score = 0;
        this.level = 1;
        this.currentShape = null;
        this.time     = 0;
        this.keyLeft  = new Key(0.15);
        this.keyRight = new Key(0.15);
        this.keyDown  = new Key(0.20);
        this.keyUp    = new Key();
    }

    create = function (parent) {
        this.canvas = document.createElement("canvas");
        this.canvas.style.width  = "100%";
        this.canvas.style.height = "100%";
        parent.appendChild(this.canvas);

        window.addEventListener('keydown', this.inputHandler.bind(this),false);
        window.addEventListener('keyup'  , this.inputHandler.bind(this),false);
        
        let self = this;
        let resize = function() {
        	self.canvas.width  = dw;
        	self.canvas.height = dh;
        	self.canvas.getContext("2d");
        }      
        window.onresize = resize;
        resize();
        this.running = true;
        
        this.restart();
        this.start(function(dt) {
            self.update(dt);
            self.render(self.canvas.getContext("2d"));
        }, 60);

    }

    inputHandler = function(e) {

        let code = e.keyCode;
        let down = e.type == "keydown";

        switch(code) {
            case 32:
                if(this.gameOver && !down) {
                    this.restart();
                }
                break;
            case 37:
                if(down && this.keyLeft.isReleased()) {
                    this.keyLeft.setState(JUST_PRESSED);
                } else if(!down) {
                    this.keyLeft.setState(RELEASED);
                }
                break;
            case 39:
                if(down && this.keyRight.isReleased()) {
                    this.keyRight.setState(JUST_PRESSED);
                } else if(!down) {
                    this.keyRight.setState(RELEASED);
                }
                break;
            case 40:
                if(down && this.keyDown.isReleased()) {
                    this.keyDown.setState(JUST_PRESSED);
                } else if(!down) {
                    this.keyDown.setState(RELEASED);
                }
                break;
            case 38:
                if(down && this.keyUp.isReleased()) {
                    this.keyUp.setState(JUST_PRESSED);
                } else if(!down) {
                    this.keyUp.setState(RELEASED);
                }
                break;
        }
    }

    update = function(deltaTime) {

        if(this.gameOver) {            
            return;
        }

        if (this.currentShape == null || this.currentShape.remove) {
						
			let lines = this.grid.checkLines();
			if (lines > 0) {
				this.score += lines * 100;
				if (this.score > this.level * 1000) {
					this.level++;
				}
			}
	
			let shapeId = Math.floor(Math.random() * 7);
			this.currentShape = new Shape(SHAPES[shapeId], shapeId + 1, this.grid);
			this.currentShape.x = 3;
			this.time = 0;
			
			if (!this.currentShape.canMove(this.currentShape.x, this.currentShape.y)) {
                // GAME OVER
                this.gameOver = true;
                return;
			}
						
		}
        
		if (this.time > 1) {
			this.time = 0;
			this.currentShape.moveDown();
		} else {
			this.time += deltaTime * this.level;
		}
				
		if (this.keyLeft.isJustPressed() || this.keyLeft.isHoldDown()) {
            this.keyLeft.setState(PRESSED);
			this.currentShape.moveLeft();
		} else if(this.keyLeft.isPressed()) {
			this.keyLeft.addHoldDownTime(deltaTime * this.level);
		}
		
		if (this.keyRight.isJustPressed() || this.keyRight.isHoldDown()) {
            this.keyRight.setState(PRESSED);
			this.currentShape.moveRight();
		} else if(this.keyRight.isPressed()) {
			this.keyRight.addHoldDownTime(deltaTime * this.level);
		}
				
		if (this.keyDown.isJustPressed() || this.keyDown.isHoldDown()) {
			this.keyDown.setState(PRESSED);
			this.time = 0;
			this.currentShape.moveDown();
		} else if(this.keyDown.isPressed()) {
			this.keyDown.addHoldDownTime(deltaTime * 10 *  this.level);
		}
				
		if (this.keyUp.isJustPressed()) {
            this.keyUp.setState(Key.PRESSED);
			this.currentShape.rotateRight();
		}
        
    }

    render = function(ctx) {

    	
        ctx.fillStyle = "#040404"; // black
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
        this.grid.render(ctx);
        if(this.currentShape != null) this.currentShape.render(ctx);
		ctx.font = '10px sans-serif';
		ctx.fillStyle = "#808080"; // gray
		ctx.fillText("Score: " + this.score, 5, dh - 8);
		ctx.fillText("Level: " + this.level, dw - 45, dh - 8);

        if(this.gameOver) {                   
            ctx.fillText("Press Space", dw * 0.5 - 28, dh * 0.5 + 15);
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText("GAME OVER", dw * 0.5 - 44, dh * 0.5);
        }

    } 

    dispose = function() {
        this.stop();
    }

    restart = function() {
        this.grid = new Grid(10, 20);
        this.currentShape = null;
        this.level = 1;
        this.score = 0;
        this.gameOver = false;
    }

}