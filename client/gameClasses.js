//The player object. Moves around using WASD or arrow keys----
class Player extends PIXI.Sprite{
    gridLocationX;
    gridLocationY;
    grid;

    constructor(grid){
        //The sprite and its position on screen----
        super(app.loader.resources["gameMedia/player.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(1);
        this.x = 400;
        this.y = 400;

        //Grid stuff----
        this.grid = grid;
        this.gridLocationX = 6;
        this.gridLocationY = 6;
    }

    //Tells the player object to check its current spot against the grid. Returns true if safe, false otherwise----
    checkCurrentTile(){
        return this.grid.checkIfSafe(this.gridLocationX, this.gridLocationY);
    }

    //Moves the player 1 space left----
    moveLeft(){
        //Only move left if it is within bounds and the cooldown is done----
        if (this.gridLocationX > 0 && !isOnCooldown){
            this.gridLocationX--;
            isOnCooldown = true;

            //Move them on the screen----
            this.x -= 45;

            //Play the move sound effect----
            moveSound.play();

            //Check if they need to lose a life for stepping on a dangerous tile----
            if (!this.checkCurrentTile()){
                //Subtract a life if it is not safe----
                reduceLivesBy(1);
            }

            //Check if they've found a powerup----
            if (powerupActive){
                currentPowerup.checkIfCollected(this.gridLocationX, this.gridLocationY);
            }
        }
    }
    //Moves the player 1 space right----
    moveRight(){
        //Only move right if it is within bounds and the cooldown is done----
        if (this.gridLocationX < 12 && !isOnCooldown){
            this.gridLocationX++;
            isOnCooldown = true;

            //Move them on the screen----
            this.x += 45;

            //Play the move sound effect----
            moveSound.play();

            //Check if they need to lose a life for stepping on a dangerous tile----
            if (!this.checkCurrentTile()){
                //Subtract a life if it is not safe----
                reduceLivesBy(1);
            }

            //Check if they've found a powerup----
            if (powerupActive){
                currentPowerup.checkIfCollected(this.gridLocationX, this.gridLocationY);
            }
        }
    }
    //Moves the player 1 space up----
    moveUp(){
        //Only move up if it is within bounds and the cooldown is done----
        if (this.gridLocationY > 0 && !isOnCooldown){
            this.gridLocationY--;
            isOnCooldown = true;

            //Move them on the screen----
            this.y -= 45;

            //Play the move sound effect----
            moveSound.play();

            //Check if they need to lose a life for stepping on a dangerous tile----
            if (!this.checkCurrentTile()){
                //Subtract a life if it is not safe----
                reduceLivesBy(1);
            }

            //Check if they've found a powerup----
            if (powerupActive){
                currentPowerup.checkIfCollected(this.gridLocationX, this.gridLocationY);
            }
        }
    }
    //Moves the player 1 space down----
    moveDown(){
        //Only move down if it is within bounds and the cooldown is done----
        if (this.gridLocationY < 12 && !isOnCooldown){
            this.gridLocationY++;
            isOnCooldown = true;

            //Move them on the screen----
            this.y += 45;

            //Play the move sound effect----
            moveSound.play();

            //Check if they need to lose a life for stepping on a dangerous tile----
            if (!this.checkCurrentTile()){
                //Subtract a life if it is not safe----
                reduceLivesBy(1);
            }

            //Check if they've found a powerup----
            if (powerupActive){
                currentPowerup.checkIfCollected(this.gridLocationX, this.gridLocationY);
            }
        }
    }

    //Resets the player's position in both the screen and on the grid----
    reset(){
        this.x = 400;
        this.y = 400;
        this.gridLocationX = 6;
        this.gridLocationY = 6;
    }
}

//Powerup that gives the player an extra life----
class ExtraLifePowerup extends PIXI.Sprite{
    gridLocationX;
    gridLocationY;

    constructor(gridX, gridY){
        super(app.loader.resources["gameMedia/extraLife.png"].texture);
        this.gridLocationX = gridX;
        this.gridLocationY = gridY;
        this.x = 108 + (45 * gridX);
        this.y = 108 + (45 * gridY);

        gameScene.addChild(this);
    }

    //Checks if this powerup is at the passed in location. Increases player lives if this powerup's coordinates
    //match the coordinates passed in----
    checkIfCollected(gridX, gridY){
        if (this.gridLocationX == gridX && this.gridLocationY == gridY){
            //Adding a life----
            addLife();

            //Removing the powerup after it has been collected----
            gameScene.removeChild(this);
            powerupActive = false;
            currentPowerup = null;

            //Play powerup sound----
            powerupSound.play();
        }
    }
}

//Powerup that increases the player's score by 5----
class ExtraScorePowerup extends PIXI.Sprite{
    gridLocationX;
    gridLocationY;

    constructor(gridX, gridY){
        super(app.loader.resources["gameMedia/extraScore.png"].texture);
        this.gridLocationX = gridX;
        this.gridLocationY = gridY;
        this.x = 108 + (45 * gridX);
        this.y = 108 + (45 * gridY);

        gameScene.addChild(this);
    }

    //Checks if this powerup is at the passed in location. Increases player score if this powerup's coordinates
    //match the coordinates passed in----
    checkIfCollected(gridX, gridY){
        if (this.gridLocationX == gridX && this.gridLocationY == gridY){
            //Increasing score----
            increaseScoreBy(5);

            //Removing the powerup after it has been collected----
            gameScene.removeChild(this);
            powerupActive = false;
            currentPowerup = null;

            //Play powerup sound----
            powerupSound.play();
        }
    }
}

//The individual tiles the player can stand on (or not)----
class Tile extends PIXI.Sprite{
    tileTextures;

    constructor(x = 0, y = 0){
        super();

        //Creating the array of sprites to be used later----
        let safeTexture = app.loader.resources["gameMedia/tileSafe.png"].texture;
        let hazardTexture = app.loader.resources["gameMedia/tileHazard.png"].texture;
        let dangerTexture = app.loader.resources["gameMedia/tileDanger.png"].texture;
        this.tileTextures = [safeTexture, hazardTexture, dangerTexture]

        //Setting the sprite (safe is default)----
        this.texture = this.tileTextures[0];
        
        //Setting the position----
        this.x = x;
        this.y = y;
    }

    //Changes the texture of the tile to match the current mode (safe/hazard/dangerous)---
    setTileByMode(modeNum){
        this.texture = this.tileTextures[modeNum];
    }
}

//The main grid where the player will be standing. Contains all of the tiles----
class Grid{ 

    //Class variables----
    tileArray;
    statusArray;
    tickArray;

    constructor(gameScene){
        //Creating a grid showing all the tiles (will be a 13x13 grid)----
        this.tileArray = [];

        //Filling the tileArray----
        for (let y = 0; y < 13; y++){
            //Creating a 1D array to add to the main array----
            let tileArrayPart = [];
            for (let x = 0; x < 13; x++){
                let tileToAdd = new Tile(108 + (45 * x), 108 + ( 45 * y))
                tileArrayPart.push(tileToAdd);
                //Adding the child to the gameScene----
                gameScene.addChild(tileToAdd);
            }
            //Adding the row to the main array----
            this.tileArray.push(tileArrayPart)
        }
        
        //Status array, mapping which parts are safe (0), which parts are about to become dangerous (1), and which parts are 
        //currenntly dangerous (2). Array is a 13x13 grid----
        this.statusArray = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];

        //Tick array, mapping which tiles are changing each tick. 0 means not changing, 1 means changing----
        this.tickArray = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];
    }

    //Resets the grid, setting all tiles back to their "safe" configuration----
    reset(){
        this.statusArray = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0]
            ];
        this.tickArray = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0]
            ];

        //Iterating through statusArray and resetting each tile that corresponds to it----
        for (let y = 0; y < 13; y++){
            for (let x = 0; x < 13; x++){
                this.tileArray[y][x].setTileByMode(this.statusArray[y][x]);
            }
        }
    }

    //Detects if a certain tile on the grid is safe to stand on. Used to check if the player is in a safe spot----
    checkIfSafe(x, y){
        if (this.statusArray[y][x] == 2){
            return false;
        }
        return true;
    }

    //Applies the current array pattern to grid----
    tickGrid(){
        //Iterating through statusArray and adding its respective tickArray value to it----
        for (let y = 0; y < 13; y++){
            for (let x = 0; x < 13; x++){
                this.statusArray[y][x] += this.tickArray[y][x]
                this.statusArray[y][x] %= 3;
                //Updating the appearance of each tile to match the danger----
                this.tileArray[y][x].setTileByMode(this.statusArray[y][x]);
            }
        }
    }
    
    //Generates a new pattern for the grid to change to. The higher the difficulty number (1-3), the more difficult
    //the pattern it generates----
    generateNewTickArray(difficulty){
        //Easy difficulty patterns----
        if (difficulty == 1){
            this.generateEasyTickArray();
        }
        else if (difficulty == 2){
            this.generateMediumTickArray();
        }    
        else if (difficulty == 3){
            this.generateHardTickArray();
        }
    }
    
    //Helper method. Sets tickArray to a random easy-difficulty pattern----
    generateEasyTickArray(){
        let randomizer = Math.random() * 7;
        randomizer = Math.trunc(randomizer);

        if  (randomizer == 0){
            this.tickArray = [
                [0,0,0,1,0,0,0,1,0,0,0,1,0],
                [0,1,0,0,0,1,0,0,0,1,0,0,0],
                [0,0,0,1,0,0,0,1,0,0,0,1,0],
                [0,1,0,0,0,1,0,0,0,1,0,0,0],
                [0,0,0,1,0,0,0,1,0,0,0,1,0],
                [0,1,0,0,0,1,0,0,0,1,0,0,0],
                [0,0,0,1,0,0,0,1,0,0,0,1,0],
                [0,1,0,0,0,1,0,0,0,1,0,0,0],
                [0,0,0,1,0,0,0,1,0,0,0,1,0],
                [0,1,0,0,0,1,0,0,0,1,0,0,0],
                [0,0,0,1,0,0,0,1,0,0,0,1,0],
                [0,1,0,0,0,1,0,0,0,1,0,0,0],
                [0,0,0,1,0,0,0,1,0,0,0,1,0]
                ];
        }
        else if  (randomizer == 1){
            this.tickArray = [
                [1,1,0,0,0,1,1,1,0,0,0,1,1],
                [1,1,0,0,0,0,1,0,0,0,0,1,1],
                [0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,1,1,0,1,0,1,1,0,0,0],
                [0,0,0,1,1,0,1,0,1,1,0,0,0],
                [1,0,0,0,0,0,1,0,0,0,0,0,1],
                [1,1,0,1,1,1,1,1,1,1,0,1,1],
                [1,0,0,0,0,0,1,0,0,0,0,0,1],
                [0,0,0,1,1,0,1,0,1,1,0,0,0],
                [0,0,0,1,1,0,1,0,1,1,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0],
                [1,1,0,0,0,0,1,0,0,0,0,1,1],
                [1,1,0,0,0,1,1,1,0,0,0,1,1]
                ];
        }
        else if  (randomizer == 2){
            this.tickArray = [
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,0,0,1,1,0,0,0,1,1,0,0,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,1,0,1,1,1,1,1,1,1,0,1,1],
                [1,1,0,1,0,0,0,0,0,1,0,1,1],
                [1,0,0,1,0,0,0,0,0,1,0,0,1],
                [1,0,0,1,0,0,1,0,0,1,0,0,1],
                [1,0,0,1,0,0,0,0,0,1,0,0,1],
                [1,1,0,1,0,0,0,0,0,1,0,1,1],
                [1,1,0,1,1,1,1,1,1,1,0,1,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,0,1,1,0,0,0,1,1,0,0,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1]
                ];
        }
        else if  (randomizer == 3){
            this.tickArray = [
                [1,0,0,0,0,1,1,1,0,0,0,0,1],
                [0,0,0,0,0,1,1,1,0,0,0,0,0],
                [0,0,0,0,0,1,1,1,0,0,0,0,0],
                [0,0,0,0,0,1,1,1,0,0,0,0,0],
                [0,0,0,0,0,1,1,1,0,0,0,0,0],
                [1,1,1,1,1,0,1,0,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,0,1,0,1,1,1,1,1],
                [0,0,0,0,0,1,1,1,0,0,0,0,0],
                [0,0,0,0,0,1,1,1,0,0,0,0,0],
                [0,0,0,0,0,1,1,1,0,0,0,0,0],
                [0,0,0,0,0,1,1,1,0,0,0,0,0],
                [1,0,0,0,0,1,1,1,0,0,0,0,1]
                ];
        }
        else if  (randomizer == 4){
            this.tickArray = [
                [0,1,0,0,0,0,0,0,0,0,0,1,0],
                [1,0,1,0,0,0,0,0,0,0,1,0,0],
                [0,1,0,1,0,0,1,0,0,1,0,1,0],
                [0,0,1,0,1,0,0,0,1,0,1,0,0],
                [0,0,0,1,0,1,0,1,0,1,0,0,0],
                [0,0,0,0,1,1,1,1,1,0,0,0,0],
                [0,0,1,0,0,1,0,1,0,0,1,0,0],
                [0,0,0,0,1,1,1,1,1,0,0,0,0],
                [0,0,0,1,0,1,0,1,0,1,0,0,0],
                [0,0,1,0,1,0,0,0,1,0,1,0,0],
                [0,1,0,1,0,0,1,0,0,1,0,1,0],
                [1,0,1,0,0,0,0,0,0,0,1,0,1],
                [0,1,0,0,0,0,0,0,0,0,0,1,0]
                ];
        }
       //This one is twice as likely as the other options----
       else{
            for (let y = 0; y < 13; y++){
                for (let x = 0; x < 13; x++){
                    this.tickArray[y][x] = this.tileRandomizer(35);
                }
            }
        }
    }

    //Helper method. Sets tickArray to a random medium-difficulty pattern----
    generateMediumTickArray(){
        let randomizer = Math.random() * 7;
        randomizer = Math.trunc(randomizer);

        if  (randomizer == 0){
            this.tickArray = [
                [1,0,0,1,1,0,0,1,1,0,0,1,1],
                [0,1,1,0,0,1,1,0,0,1,1,0,0],
                [1,0,0,1,1,0,0,1,1,0,0,1,1],
                [0,1,1,0,0,1,1,0,0,1,1,0,0],
                [1,0,0,1,1,0,0,1,1,0,0,1,1],
                [0,1,1,0,0,1,1,0,0,1,1,0,0],
                [1,0,0,1,1,0,0,1,1,0,0,1,1],
                [0,1,1,0,0,1,1,0,0,1,1,0,0],
                [1,0,0,1,1,0,0,1,1,0,0,1,1],
                [0,1,1,0,0,1,1,0,0,1,1,0,0],
                [1,0,0,1,1,0,0,1,1,0,0,1,1],
                [0,1,1,0,0,1,1,0,0,1,1,0,0],
                [1,0,0,1,1,0,0,1,1,0,0,1,1]
                ];
        }
        else if  (randomizer == 1){
            this.tickArray = [
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,1,0,0,1,1,1,0,0,1,1,1],
                [1,1,0,0,0,0,0,0,0,0,0,1,1],
                [1,0,0,1,1,0,0,0,1,1,0,0,1],
                [1,0,0,1,1,0,0,0,1,1,0,0,1],
                [1,1,0,0,0,1,0,1,0,0,0,1,1],
                [1,1,0,0,0,0,1,0,0,0,0,1,1],
                [1,1,0,0,0,1,0,1,0,0,0,1,1],
                [1,0,0,1,1,0,0,0,1,1,0,0,1],
                [1,0,0,1,1,0,0,0,1,1,0,0,1],
                [1,1,0,0,0,0,0,0,0,0,0,1,1],
                [1,1,1,0,0,1,1,1,0,0,1,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1]
                ];
        }
        else if  (randomizer == 2){
            this.tickArray = [
                [0,0,1,0,0,1,1,1,0,0,1,0,0],
                [0,1,0,1,1,0,0,0,1,1,0,1,0],
                [1,0,0,1,1,0,0,0,1,1,0,0,1],
                [0,1,1,1,1,1,1,1,1,1,1,1,0],
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [1,0,0,1,1,0,0,0,1,1,0,0,1],
                [1,0,0,1,1,0,1,0,1,1,0,0,1],
                [1,0,0,1,1,0,0,0,1,1,0,0,1],
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [0,1,1,1,1,1,1,1,1,1,1,1,0],
                [1,0,0,1,1,0,0,0,1,1,0,0,1],
                [0,1,0,1,1,0,0,0,1,1,0,1,0],
                [0,0,1,0,0,1,1,1,0,0,1,0,0]
                ];
        }
        else if  (randomizer == 3){
            this.tickArray = [
                [0,1,0,1,0,1,0,1,0,1,0,1,0],
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [0,1,0,1,0,1,0,1,0,1,0,1,0],
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [0,1,0,1,0,1,0,1,0,1,0,1,0],
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [0,1,0,1,0,1,0,1,0,1,0,1,0],
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [0,1,0,1,0,1,0,1,0,1,0,1,0],
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [0,1,0,1,0,1,0,1,0,1,0,1,0],
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [0,1,0,1,0,1,0,1,0,1,0,1,0]
                ];
        }
        else if  (randomizer == 4){
            this.tickArray = [
                [0,1,0,0,1,0,0,0,1,0,0,1,0],
                [1,0,1,0,0,1,0,1,0,0,1,0,0],
                [0,1,0,1,0,0,1,0,0,1,0,1,0],
                [0,0,1,0,1,1,0,1,1,0,1,0,0],
                [1,0,0,1,0,1,0,1,0,1,0,0,1],
                [0,1,0,1,1,1,1,1,1,1,0,1,0],
                [0,0,1,0,0,1,0,1,0,0,1,0,0],
                [0,1,0,1,1,1,1,1,1,1,0,1,0],
                [1,0,0,1,0,1,0,1,0,1,0,0,1],
                [0,0,1,0,1,1,0,1,1,0,1,0,0],
                [0,1,0,1,0,0,1,0,0,1,0,1,0],
                [1,0,1,0,0,1,0,1,0,0,1,0,1],
                [0,1,0,0,1,0,0,0,1,0,0,1,0]
                ];
        }
        //This one is twice as likely as the other options----
        else{
            for (let y = 0; y < 13; y++){
                for (let x = 0; x < 13; x++){
                    this.tickArray[y][x] = this.tileRandomizer(50);
                }
            }
        }
    }

    //Helper method. Sets tickArray to a random hard-difficulty pattern----
    generateHardTickArray(){
        let randomizer = Math.random() * 7;
        randomizer = Math.trunc(randomizer);

        if  (randomizer == 0){
            this.tickArray = [
                [1,1,0,1,1,1,0,1,1,1,0,1,1],
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [1,1,0,1,1,1,0,1,1,1,0,1,1],
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [1,1,0,1,1,1,0,1,1,1,0,1,1],
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [1,1,0,1,1,1,0,1,1,1,0,1,1],
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [1,1,0,1,1,1,0,1,1,1,0,1,1],
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [1,1,0,1,1,1,0,1,1,1,0,1,1],
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [1,1,0,1,1,1,0,1,1,1,0,1,1]
                ];
        }
        else if  (randomizer == 1){
            this.tickArray = [
                [0,1,1,1,1,1,0,1,1,1,1,1,0],
                [1,1,1,0,1,1,1,1,1,0,1,1,1],
                [1,1,0,0,1,0,0,0,1,0,0,1,1],
                [1,1,1,1,1,1,0,1,1,1,1,1,1],
                [1,1,1,1,1,1,0,1,1,1,1,1,1],
                [1,1,0,1,1,1,1,1,1,1,0,1,1],
                [0,1,0,0,0,1,1,1,0,0,0,1,0],
                [1,1,0,1,1,1,1,1,1,1,0,1,1],
                [1,1,1,1,1,1,0,1,1,1,1,1,1],
                [1,1,1,1,1,1,0,1,1,1,1,1,1],
                [1,1,0,0,1,0,0,0,1,0,0,1,1],
                [1,1,1,0,1,1,1,1,1,0,1,1,1],
                [0,1,1,1,1,1,0,1,1,1,1,1,0]
                ];
        }
        else if  (randomizer == 2){
            this.tickArray = [
                [0,0,1,0,0,1,1,1,0,0,1,0,0],
                [0,1,0,1,1,0,1,0,1,1,0,1,0],
                [1,0,0,1,1,1,1,1,1,1,0,0,1],
                [0,1,1,1,1,1,1,1,1,1,1,1,0],
                [0,1,1,1,0,1,0,1,0,1,1,1,0],
                [1,0,1,1,1,0,1,0,1,1,1,0,1],
                [1,1,1,1,0,1,0,1,0,1,1,1,1],
                [1,0,1,1,1,0,1,0,1,1,1,0,1],
                [0,1,1,1,0,1,0,1,0,1,1,1,0],
                [0,1,1,1,1,1,1,1,1,1,1,1,0],
                [1,0,0,1,1,1,1,1,1,1,0,0,1],
                [0,1,0,1,1,0,1,0,1,1,0,1,0],
                [0,0,1,0,0,1,1,1,0,0,1,0,0]
                ];
        }
        else if  (randomizer == 3){
            this.tickArray = [
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [0,1,1,1,0,1,0,1,0,1,1,1,0],
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [0,1,1,1,0,1,0,1,0,1,1,1,0],
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [0,1,1,1,0,1,1,1,0,1,1,1,0],
                [0,1,1,1,0,1,1,1,0,1,1,1,0]
                ];
        }
        else if  (randomizer == 4){
            this.tickArray = [
                [1,1,0,1,1,0,1,0,1,1,0,1,1],
                [1,0,1,0,0,1,1,1,0,0,1,0,0],
                [0,1,0,1,1,0,1,0,1,1,0,1,0],
                [1,0,1,1,1,1,0,1,1,1,1,0,1],
                [1,0,1,1,0,1,1,1,0,1,1,0,1],
                [0,1,0,1,1,1,1,1,1,1,0,1,0],
                [1,1,1,0,1,1,0,1,1,0,1,1,1],
                [0,1,0,1,1,1,1,1,1,1,0,1,0],
                [1,0,1,1,0,1,1,1,0,1,1,0,1],
                [1,0,1,1,1,1,0,1,1,1,1,0,1],
                [0,1,0,1,1,0,1,0,1,1,0,1,0],
                [1,0,1,0,0,1,1,1,0,0,1,0,1],
                [1,1,0,1,1,0,1,0,1,1,0,1,1]
                ];
        }
       //This one is twice as likely as the other options----
       else{
            for (let y = 0; y < 13; y++){
                for (let x = 0; x < 13; x++){
                    this.tickArray[y][x] = this.tileRandomizer(65);
                }
            }
        }
    }

    //Helper method. Used for tile randomizations-----
    tileRandomizer(percentChance){
        let roll = Math.random() * 100;
        if (roll < percentChance) {
            return 1;
        }
        else{
            return 0;
        }
    }
}

module.exports = {
    Player,
    ExtraLifePowerup,
    ExtraScorePowerup,
    Grid
}
    