

/**
 * Constructor for the Game of Life object
 * 
 * @author Qbit
 * @version 0.1
 */
function Game(canvas, cfg) {
  
    // Properties
    this.canvas   = canvas;
    this.ctx      = canvas.getContext("2d");
    this.matrix   = undefined;
    this.round    = 0;
    this.recoveredCount = 0;
    this.sickCount = 0;
    this.totalDeath = 0;  
    
    
    // Merge of the default and delivered config.
    var defaults = {
        cellsX    : 160,
        cellsY    : 80,
        cellSize  : 5,
        rules     : "23/3",
        gridColor : "#eee",
        cellColor : "#ccc",
        suceptibleCellColor: "green",
        infectedCellColor: "red",
        incubationPeriod: 10,
        contaminationProb: 0.2,
        populationDensity: 0.3,
        deathRatio: 0.03,
    };
    this.cfg = $.extend({}, defaults, cfg);
    
    // Initialize the canvas and matrix.
    this.init();
}

/**
 * Prototype of the Game of Life object
 * 
 * @author Qbit
 * @version 0.1
 */
Game.prototype = {
    
    /**
     * Initializes the canvas object and the matrix.
     */
    init: function() {
        // set canvas dimensions
        this.canvas.width  = this.cfg.cellsX * this.cfg.cellSize;
        this.canvas.height = this.cfg.cellsY * this.cfg.cellSize;
        
        // initialize matrix
        this.matrix = new Array(this.cfg.cellsX);
        for (var x = 0; x < this.matrix.length; x++) {
            this.matrix[x] = new Array(this.cfg.cellsY);
            for (var y = 0; y < this.matrix[x].length; y++) {
                this.matrix[x][y] = false;
            }
        }
        
        this.draw();
    },
    
    /**
     * Draws the entire game on the canvas.
     */
    draw: function() {
    var x, y;
        // clear canvas and set colors
        this.canvas.width = this.canvas.width;
        this.ctx.strokeStyle = this.cfg.gridColor;
        let sickCount = 0;
        let confirmedCount = 0;
        let recoveredCount = 0;
        
        // draw grid
        for (x = 0.5; x < this.cfg.cellsX * this.cfg.cellSize; x += this.cfg.cellSize) {
          this.ctx.moveTo(x, 0);
          this.ctx.lineTo(x, this.cfg.cellsY * this.cfg.cellSize);
        }

        for (y = 0.5; y < this.cfg.cellsY * this.cfg.cellSize; y += this.cfg.cellSize) {
          this.ctx.moveTo(0, y);
          this.ctx.lineTo(this.cfg.cellsX * this.cfg.cellSize, y);
        }

        this.ctx.stroke();
        
        // draw matrix
        for (x = 0; x < this.matrix.length; x++) {
            for (y = 0; y < this.matrix[x].length; y++) {
              
                if (this.matrix[x][y]) {
                    let color = this.cfg.cellColor
                    let status = this.matrix[x][y]; 
                    if (status == 1) {
                      color = this.cfg.suceptibleCellColor
                    } else if (status > 1 && status < this.cfg.incubationPeriod) {
                      sickCount += 1;
                      color = this.cfg.infectedCellColor
                    }
                    if (status >= this.cfg.incubationPeriod) {
                      recoveredCount += 1;
                    }
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(x * this.cfg.cellSize + 1,
                                      y * this.cfg.cellSize + 1,
                                      this.cfg.cellSize - 1,
                                      this.cfg.cellSize - 1);
                    
                }
            }
        }
        this.recoveredCount = recoveredCount;
        this.sickCount = sickCount;
        this.totalDeath = Math.floor(recoveredCount * this.cfg.deathRatio);

        if (sickCount == 0 ) {
          $("#run").click();
        }
    },
    /**
     * Checks if there are infected people around a certain cell
     * A cell can have up to 8 neighbours. Borders are concidered as dead.
     * 
     * @param cx horizontal coordinates of the given cell
     * @param cy vertical coordinates of the given cell
     * @return the number of infected neighbours
     */
    infectedNeighbours: function(cx, cy) {
      var count = 0;
      
      for (var x = cx-1; x <= cx+1; x++) {
          for (var y = cy-1; y <= cy+1; y++) {
              if (x == cx && y == cy)
                  continue;
              if (x < 0 || x >= this.matrix.length || y < 0 || y >= this.matrix[x].length)
                  continue;
              if (this.matrix[x][y] > 1 && this.matrix[x][y] < this.cfg.incubationPeriod)
                  count++;
          }
      }
      
      return count;
  },
    
    /**
     * Calculates the new state by applying the rules.
     * All changes were made in a buffer matrix and swapped at the end.
     */
    step: function() {
        // initalize buffer
    var x, y;
        var buffer = new Array(this.matrix.length);
        for (x = 0; x < buffer.length; x++) {
            buffer[x] = new Array(this.matrix[x].length);
        }
        
        // calculate one step
        // 3 things happen here
        //    1 - If you are infected you incubate
        //    2 - If you are suceptible and in contact with infected. You are infected
        //    3 - Everyone moves
        for (x = 0; x < this.matrix.length; x++) {
            for (y = 0; y < this.matrix[x].length; y++) {
              if (this.matrix[x][y]) {
                // Step 1: If you are infected, you incubate
                if(this.matrix[x][y] > 1 && this.matrix[x][y] < this.cfg.incubationPeriod) {
                  this.matrix[x][y] += 1
                }

                // Step 2 if you are close to an infected person you might get sick
                if (this.matrix[x][y] == 1 && this.infectedNeighbours(x, y) > 0) {
                  if (Math.random() < this.cfg.contaminationProb) {
                    this.matrix[x][y] = 2;
                  }
                }

                // Step 3 Everybody moves
                newX = x + Math.floor(Math.random() * 3) -1; 
                newY = y + Math.floor(Math.random() * 3) -1;
                if (newX >= 0 && newY >= 0 && newX < this.cfg.cellsX && newY < this.cfg.cellsY && !this.matrix[newX][newY] && !buffer[newX][newY]) {
                  buffer[newX][newY] = this.matrix[x][y];
                  buffer[x][y] = false
                } else {
                  buffer[x][y] = this.matrix[x][y] 
                }
              }
            }
        }
        
        // flip buffers
        this.matrix = buffer;
        this.round++;
        this.draw();
    },
    

    
    
    /**
     * Clears the entire matrix, by setting all cells to false.
     */
    clear: function() {
        for (var x = 0; x < this.matrix.length; x++) {
            for (var y = 0; y < this.matrix[x].length; y++) {
                this.matrix[x][y] = false;
            }
        }
        
        this.draw();
    },
    
    /**
     * Fills the matrix with a random pattern.
     * The chance that a cell will be alive is at 30%.
     */
    randomize: function() {
        for (var x = 0; x < this.matrix.length; x++) {
            for (var y = 0; y < this.matrix[x].length; y++) {
              if  (Math.random() < this.cfg.populationDensity) {
                this.matrix[x][y] = 1;
              } else {
                this.matrix[x][y] =  0;
              }
                
            }
            
        }
        
        this.matrix[0][0] = 2;
        this.matrix[this.cfg.cellsX - 1][this.cfg.cellsY - 1] = 2;
        this.draw(); 
    },
    
    /**
     * Toggels the state of one cell at the given coordinates.
     *
     * @param cx horizontal coordinates of the given cell
     * @param cy vertical coordinates of the given cell
     */
    toggleCell: function(cx, cy) {
        if (cx >= 0 && cx < this.matrix.length && cy >= 0 && cy < this.matrix[0].length) {
            this.matrix[cx][cy] = 2;
            this.draw();
        }
    }
};

/* ***** MAIN SCRIPT ***** */

// animation loop
var timer;
var game = new Game(document.getElementById("game"));

// Initialize game


// run or stop the animation loop
$("#run").click(function() {
  
  if (timer === undefined) {
    timer = setInterval(run, 80);

    
    $(this).text("Stop");
  } else {
    clearInterval(timer);
    timer = undefined;
    $(this).text("Start");
  }
});

$(".variable").on("change", ()=>{
  game = new Game(document.getElementById("game"), {
    incubationPeriod: Number($("#incubationPeriod").val()),
    contaminationProb: Number($("#virality").val())/100,
    populationDensity: $("#populationDensity").val()/100.0,
    deathRatio: $("#mortality").val()/100.0,
  });
  game.randomize();

})

// make a single step in the animation loop
$("#step").click(function() {
  if (timer === undefined) {
    game.step();
    $("#round span").text(game.round);
  }
});

// clear the entire game board
$("#clear").click(function() {
  game.clear();
  game.round = 0;
  $("#round span").text(game.round);
});

// set a random pattern on the game board
$("#rand").click(function() {
  game.randomize();
  game.round = 0;
  $("#round span").text(game.round);
});

// register onclick on the canvas
game.canvas.addEventListener("click", gameOnClick, false);

// determens the click position and toggels the corresponding cell
function gameOnClick(e) {
    var x;
    var y;
    
    // determen click position
    if (e.pageX !== undefined && e.pageY !== undefined) {
        x = e.pageX;
        y = e.pageY;
    } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    
    // make it relativ to canvas
    x -= game.canvas.offsetLeft;
    y -= game.canvas.offsetTop;
    
    // calculate clicked cell
    x = Math.floor(x/game.cfg.cellSize);
    y = Math.floor(y/game.cfg.cellSize);
    
    game.toggleCell(x, y);
}

// runs the animation loop, calculates a new step and updates the counter
function run() {
    
    game.step();
    let confirmed = (game.recoveredCount + game.sickCount);
    let recovered = game.recoveredCount;
    $("#confirmedCases").text(confirmed)
    $("#recoveredCases").text(recovered)
    $("#totalDeath").text(game.totalDeath);
    
    $("#round span").text(game.round);
}

game.randomize();