const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
const { Player, ExtraLifePowerup, ExtraScorePowerup, Grid } = require('./gameClasses.js');
const PIXI = require('pixi.js');
require("pixi.js/unsafe-eval");
const { Howl } = require('howler');

//Requiring media files -SJH
const extraLifePng = require("../hosted/img/extraLife.png");
const extraScorePng = require("../hosted/img/extraScore.png");
const playerPng = require("../hosted/img/player.png");
const tileDangerPng = require("../hosted/img/tileDanger.png");
const tileHazardPng = require("../hosted/img/tileHazard.png");
const tileSafePng = require("../hosted/img/tileSafe.png");
const buttonClickWav = require("../hosted/sound/buttonClick.wav");
const lifeLostWav = require("../hosted/sound/lifeLost.wav");
const moveMp3 = require("../hosted/sound/move.mp3");
const powerupWav = require("../hosted/sound/powerup.wav");
const tickWav = require("../hosted/sound/tick.wav");

//PixiJS app -SJH
let app;
//Textures object -SJH
let textures;
//Window dimensions -SJH
let sceneWidth;
let sceneHeight;
//Scenes----
let menuScene;
let gameScene;
let gameOverScene;
//Important game variables----
let livesRemaining = 3;
let score = 0;
let player;
let grid;
let ticks = 0;
let timeSinceLastTick = 0;
let tickDelay = 2;
let tickCycles = 0;
let paused = true;
//Powerup variables----
let currentPowerup;
let powerupActive = false;
//Movement cooldown variables----
let moveCooldown = .1;
let currentCooldown = 0;
let isOnCooldown = false;
//UI elements that need to be on the script-level----
let scoreDisplay;
let livesDisplay;
let gameOverScoreLabel;
//Sound effects----
let moveSound;
let dieSound;
let tickSound;
let powerupSound;
let buttonSound;

//Sifts through keyboard inputs to determine if and how to move the player. 
//WASD and arrow keys are used for movement -SJH
const callMoveMethods = (keyCode) => {
    //Only send movement commands if the game is in play mode and the movement 
    //cooldown is done. -SJH
    if (!paused && !isOnCooldown) {
        //W or up arrow key (move up)----
        if (keyCode.keyCode == 87 || keyCode.keyCode == 38) {
            player.moveUp();
            isOnCooldown = true;
        }
        //A or left arrow key (move left)----
        else if (keyCode.keyCode == 65 || keyCode.keyCode == 37) {
            player.moveLeft();
            isOnCooldown = true;
        }
        //S or down arrow key (move down)----
        else if (keyCode.keyCode == 83 || keyCode.keyCode == 40) {
            player.moveDown();
            isOnCooldown = true;
        }
        //D or right arrow key (move right)----
        else if (keyCode.keyCode == 68 || keyCode.keyCode == 39) {
            player.moveRight();
            isOnCooldown = true;
        }

        //Check to see if the player is on solid ground or not (lose a life if not) -SJH
        if (player.checkCurrentTile()) {
            reduceLivesBy(1);
        }
        //Check to see if the player is collecting a powerup -SJH
        if (powerupActive) {
            if (currentPowerup.checkIfCollected(player.gridLocationX, player.gridLocationY)) {
                //Add life or increase score depending upon the powerup type -SJH
                if (typeof currentPowerup === ExtraLifePowerup) {
                    addLife();
                }
                else if (typeof currentPowerup === ExtraScorePowerup) {
                    increaseScoreBy(5);
                }
                powerupActive = false;
                currentPowerup = null;
            }
        }
    }
}

//Function to return to the main menu----
const returnToMenu = () => {
    //Play the button click sound----
    buttonSound.play();

    menuScene.visible = true;
    gameOverScene.visible = false;
    gameScene.visible = false;
}

//Takes the game from the main menu to the game scene and starts the game----
const startGame = () => {
    //Play the button click sound----
    buttonSound.play();

    //Adjusting visible scenes----
    menuScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;

    //Resetting score and lives----
    score = 0;
    livesRemaining = 3;

    //Updating displays----
    livesDisplay.text = `Lives Remaining: ${livesRemaining}`;
    scoreDisplay.text = `Score: ${score}`;

    //Resetting ticker----
    ticks = 0;

    //Resetting player and grid----
    grid.reset();
    player.reset();

    //Removing the powerup if there is one----
    if (powerupActive) {
        gameScene.removeChild(currentPowerup);
        powerupActive = false;
        currentPowerup = null;
    }

    //Unpausing the game----
    paused = false;
}

//Increases the user's score by value----
const increaseScoreBy = (value) => {
    score += value;
    scoreDisplay.text = `Score: ${score}`;
}

//Reduces the number of lives the user has remaining by value----
const reduceLivesBy = (value) => {
    //Play the sound effect associated with losing a life----
    dieSound.play();

    livesRemaining -= value;
    livesDisplay.text = `Lives Remaining: ${livesRemaining}`;

    //Losing a life affects the grid. The grid gets reset to its "safe" configuration, and the player gets reset to origin----
    grid.reset();
    player.reset();

    //Giving the player a quick break before resuming----
    timeSinceLastTick = -2;

    //Applying the movement cooldown to prevent the player from getting offset----
    isOnCooldown = true;

    //Setting the ticks back one place to match the "safe" configuration----
    ticks -= 2;

    //Because the player did not survive the pattern, they do not keep the score increase for that round----
    increaseScoreBy(-1);
}

//Increases the player's lives by 1. Called when the player finds a 1-up powerup----
const addLife = () => {
    livesRemaining++;
    livesDisplay.text = `Lives Remaining: ${livesRemaining}`;
}

//Function is called after the player has run out of lives----
const end = () => {
    paused = true;
    gameOverScene.visible = true;
    gameScene.visible = false;

    //Update score display at the end of the game----
    gameOverScoreLabel.text = "Score: " + score
}

//This is called repeatedly when the game has actually begun----
const gameLoop = () => {
    //Only continue the game if the game is not paused----
    if (paused) return;

    //Calculating delta time. Will be necessary for pacing the game "ticks"----
    let deltaTime = 1 / app.ticker.FPS;
    if (deltaTime > 1 / 12) {
        deltaTime = 1 / 12;
    }

    //Movement cooldown timer stuff----
    if (isOnCooldown) {
        currentCooldown += deltaTime;

        //Move has finished cooling down----
        if (currentCooldown >= moveCooldown) {
            currentCooldown = 0;
            isOnCooldown = false;
        }
    }

    //Tick delay stuff----
    //The delay between ticks gets shorter and shorter with each tick cycle. Starts at 1.5 and decreases to .6 over 50 cycles.
    //Cannot decrease below .6 second tick time----
    tickDelay = (-.9 / 50) * tickCycles + 1.5;
    if (tickDelay < .6) {
        tickDelay = .6;
    }

    //Incremeting the tick timer----
    if (!paused) {
        timeSinceLastTick += deltaTime;
    }

    //Tick loop----
    if (timeSinceLastTick >= tickDelay) {
        timeSinceLastTick = 0;
        ticks++
        tickCycles = Math.trunc(ticks / 3);

        //Play the tick sound every tick----
        tickSound.play();

        //Step 1: Hazard tiles appear----
        if (ticks % 3 == 1) {
            //Difficulty increases every 10 cycles. Maximum difficulty of 3----
            let difficulty = Math.trunc(tickCycles / 10) + 1;
            if (difficulty > 3) {
                difficulty = 3;
            }
            //Generating a new pattern and applying it once to the array----
            grid.generateNewTickArray(difficulty);
            grid.tickGrid();
        }

        //Step 2: Hazard tiles become dangerous----
        if (ticks % 3 == 2) {
            grid.tickGrid();

            //Increase player score----
            increaseScoreBy(1);

            //Check if the player is in a safe location at the time of the tick----
            if (!player.checkCurrentTile()) {
                reduceLivesBy(1);
            }
        }

        //Step 3: Dangerous tiles become safe--------
        if (ticks % 3 == 0) {
            grid.tickGrid();

            //Add a new powerup every 7 cycles (if there isn't already one present)----
            if (tickCycles % 7 == 0) {
                if (!powerupActive) {
                    powerupActive = true;

                    //Creating a random powerup----
                    let random = Math.floor(Math.random() * 2);
                    if (random == 0) {
                        //Extra life at a random tile location----
                        currentPowerup = new ExtraLifePowerup(
                            Math.floor(Math.random() * 13),
                            Math.floor(Math.random() * 13),
                            gameScene,
                            powerupSound,
                            textures);
                    }
                    else {
                        //Extra score at a random tile location----
                        currentPowerup = new ExtraScorePowerup(
                            Math.floor(Math.random() * 13),
                            Math.floor(Math.random() * 13),
                            gameScene,
                            powerupSound,
                            textures);
                    }
                    //Collecting the powerup if it just happened to spawn on top of the player-----
                    currentPowerup.checkIfCollected();
                }
            }
        }
    }

    //Call the end function if the player has run out of lives----
    if (livesRemaining <= 0) {
        end();
    }
}

//Constructing UI for different scenes -SJH
const populateSceneUIs = () => {
    //Creating a new style for buttons----
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xF28305,
        fontSize: 48,
        fontFamily: "Verdana, Geneva, sans-serif"
    });

    //START SCENE STUFF-------------------------------------------------
    //Creating the title text----
    let title = new PIXI.Text({text: "The Floor is (almost) Lava!"});
    title.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 50,
        fontFamily: "Verdana, Geneva, sans-serif",
        stroke: 0xF28305,
        strokeThickness: 4
    });
    title.x = 65;
    title.y = 120;
    //Adding it to the scene----
    menuScene.addChild(title);

    //Creating instructions for the game----
    let startLabel2 = new PIXI.Text(
        {text:"Instructions: \n     Move using WASD or the arrow keys. \n     Avoid the lava."});
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 26,
        fontFamily: "Verdana, Geneva, sans-serif",
    });
    startLabel2.x = 140;
    startLabel2.y = 300;
    //Add it to the scene----
    menuScene.addChild(startLabel2);

    //Creating and adding the start game button----
    let startButton = new PIXI.Text({text:"Play!"});
    //Set button style----
    startButton.style = buttonStyle;
    //Button position----
    startButton.x = 345;
    startButton.y = sceneHeight - 100;
    //How the button works----
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    let buttonElement;
    startButton.on("pointerover", e => {
        e.target.alpha = .7;
        buttonElement = e.target
    });
    startButton.on("pointerout", e => buttonElement.alpha = 1);
    //Adding it to the scene----
    menuScene.addChild(startButton);

    //GAME SCENE STUFF--------------------------------------------------
    //Creating a text style----
    let displayText = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 20,
        fontFamily: "Verdana, Geneva, sans-serif",
    });

    //Create and add the score label to the scene----
    scoreDisplay = new PIXI.Text();
    scoreDisplay.style = displayText;
    scoreDisplay.x = 355;
    scoreDisplay.y = 15;
    gameScene.addChild(scoreDisplay);
    scoreDisplay.text = `Score: ${score}`;

    //Adding the score icon----
    let scoreSymbol = PIXI.Sprite.from(textures.extraScorePng);
    scoreSymbol.x = 305;
    scoreSymbol.y = 5;
    gameScene.addChild(scoreSymbol);

    //Create and add a lives display label to the scene----
    livesDisplay = new PIXI.Text();
    livesDisplay.style = displayText;
    livesDisplay.x = 55;
    livesDisplay.y = 15;
    gameScene.addChild(livesDisplay);
    livesDisplay.text = `Lives Remaining: ${livesRemaining}`;

    //Adding the lives icon----
    let lifeSymbol = PIXI.Sprite.from(textures.extraLifePng);
    lifeSymbol.x = 5;
    lifeSymbol.y = 5;
    gameScene.addChild(lifeSymbol);

    //GAME OVER SCENE STUFF----------------------------------------------
    let gameOverText = new PIXI.Text({text:"Game Over!"});
    //Creating a text style----
    let TextStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 50,
        fontFamily: "Verdana, Geneva, sans-serif",
        stroke: 0xF28305,
        strokeThickness: 4
    });
    gameOverText.style = TextStyle;
    gameOverText.x = 270;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    //Make the score display----
    gameOverScoreLabel = new PIXI.Text({text:"Score: 0"});
    gameOverScoreLabel.style = TextStyle;
    gameOverScoreLabel.x = 300;
    gameOverScoreLabel.y = sceneHeight / 2;
    gameOverScene.addChild(gameOverScoreLabel) + 100;

    //Return to main menu button----
    let mainMenuButton = new PIXI.Text({text:"Main Menu"});
    mainMenuButton.style = buttonStyle;
    mainMenuButton.x = 280;
    mainMenuButton.y = sceneHeight - 100;
    mainMenuButton.interactive = true;
    mainMenuButton.buttonMode = true;
    mainMenuButton.on("pointerup", returnToMenu);
    mainMenuButton.on('pointerover', e => e.target.alpha = 0.7);
    mainMenuButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(mainMenuButton);
}

//Runs setup for the game once the PixiJS app has finished loading. -SJH
const setup = () => {
    //Loading sound effects----
    moveSound = new Howl({
        src: [moveMp3]
    });
    dieSound = new Howl({
        src: [lifeLostWav]
    });
    tickSound = new Howl({
        src: [tickWav]
    });
    powerupSound = new Howl({
        src: [powerupWav]
    });
    buttonSound = new Howl({
        src: [buttonClickWav]
    });

    //Creating the main menu scene----
    menuScene = new PIXI.Container();
    app.stage.addChild(menuScene);

    //Creating the game scene----
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    app.stage.addChild(gameScene);

    //Creating the game over scene----
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    app.stage.addChild(gameOverScene);

    //Create the player and the grid----
    grid = new Grid(gameScene, textures);
    player = new Player(grid, moveSound, textures);
    gameScene.addChild(player);

    //Populating each scene's UI----
    populateSceneUIs();

    //Begin the game loop----
    app.ticker.add(gameLoop);

    //Start listening for keyboard inputs----
    window.addEventListener("keydown", callMoveMethods);
}

//=================================================================================================
//REACT ELEMENTS -SJH -----------------
//=================================================================================================
const Game = () => {
    const [reloadScores, setReloadScores] = useState(false);
    return (
        <div id="game">
        </div>);
};

//=================================================================================================
//SET THINGS INTO MOTION AFTER FUNCTIONS AND VARIABLES HAVE BEEN INITIALIZED -SJH -----------------
//=================================================================================================

//Create the game canvas and put it on the HTML page -SJH
const init = async () => {
    //Creating the pixijs app----
    app = new PIXI.Application();
    await app.init({ width: 800, height: 800 });

    //Caching window dimensions -SJH
    sceneWidth = app.canvas.width;
    sceneHeight = app.canvas.height;

    console.log("loading assets");
    //Loading in images----
    PIXI.Assets.add({ alias: 'extraLifePng', src: extraLifePng });
    PIXI.Assets.add({ alias: 'extraScorePng', src: extraScorePng });
    PIXI.Assets.add({ alias: 'playerPng', src: playerPng });
    PIXI.Assets.add({ alias: 'tileSafePng', src: tileSafePng });
    PIXI.Assets.add({ alias: 'tileHazardPng', src: tileHazardPng });
    PIXI.Assets.add({ alias: 'tileDangerPng', src: tileDangerPng });

    const texturesPromise = PIXI.Assets.load([
        'extraLifePng',
        'extraScorePng',
        'playerPng',
        'tileSafePng',
        'tileHazardPng',
        'tileDangerPng',]);

    texturesPromise.then((texturesLoaded) => {
        textures = texturesLoaded;
        //const gameArea = createRoot(document.querySelector('#gameArea'));
        const gameArea = document.querySelector('#gameArea');
        //gameArea.innerHTML = `<img src = ${tileSafePng}>`

        console.log("running setup");
        setup();
        console.log("end of setup");


        //gameArea.render(<Game />)
        gameArea.appendChild(app.canvas);
        console.log("end of init");
    });
};

window.onload = init;