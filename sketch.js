/*
Originally made in Processing 
Based on: https://www.youtube.com/watch?v=CbKJqeOxQQ4

Known bugs:
If someone presses the start button or any area of the start screen, a slot is filled.
The winner can change from 2 to 1 if a player presses the mouse again on the game over screen
*/

let w = 7, h = 6, block = 100, scene = 1;
let switchScene = false;
let isPlayingGame;
let title,cnv,shared,my,toggle,connect4;
let blueTeam,redTeam;
let icon,iconBtn;

function preload(){
   partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "connect4-final",
    "main"
  );
  
  shared = partyLoadShared("shared");
  my = partyLoadMyShared();
  participants = partyLoadParticipantShareds();
  title = loadImage("assets/title.png");
  connect4 = loadImage("assets/connect4.jpg");
  icon = loadImage("assets/icon.png");
}

function setup(){ 
  cnv = createCanvas(700,600);
  // let xPos = (windowWidth - width) / 2;
  // let yPos = (windowHeight - height) / 2;
  // cnv.position(xPos,yPos);
  isPlayingGame = false;
  
  ellipseMode(CORNER); 
  blueTeam = color(0,0,255);
  redTeam = color(255,0,0);
  
  partyToggleInfo(false);
  toggle = createButton("Toggle Info");
  toggle.position(615,600);
  toggle.mousePressed(()=> {
      partyToggleInfo();
  }); 
  
  if(partyIsHost()){
  partySetShared(shared,{
      player: 1,
      playerPos: 0,
      board: 0,
      role: "Observer"
    });
  }
  
  shared.board = Array(6).fill().map(() =>Array(7).fill(0));
  
  shared.currentTurn = shared.currentTurn || "Blue";
  my.selectedTeam = "Blue";
  
  // Make a select menu 
  const teamDropDownMenu = createSelect();
  teamDropDownMenu.option("Blue");
  teamDropDownMenu.option("Red");
  teamDropDownMenu.option("Observer");
  
   teamDropDownMenu.changed(() => {
     my.selectedTeam = teamDropDownMenu.value();
  });
  
  buttons();
}

function draw(){
  background(225,225,0);
  switch(scene){
    case 2:
      game();
      watchGame();
      start.hide();
      break;
    case 3:
      gameOver();
      break;
    case 4:
      instructions();
      break;
    default:
      startScreen();
      start.show();
      iconBtn.show();
      break;
  }
}

function watchGame(){
  my.role = "Observer";
}

function startScreen(){
  background(connect4);
  image(title,220,6,300,90);
}

function buttons(){
  start = createButton("Start");
  start.mousePressed(() => {
    scene = 2;
    switchScene = true;
    setTimeout(() => {
      isPlayingGame = true;
    }, 100);
  });
  start.position(300,300);
  start.style("color","#fff");
  start.style("background-color","#000");
  start.size(130,40);
  
  iconBtn = new Button(icon,550,10,40,40);
}

/*create a gif of the game*/
function instructions(){
  background(225,225,0);
  fill(0);
  textSize(40);
  text("Connect 4", 250,50);
  textSize(30);
  text("Choose a color and then take turns dropping" + "\n" + "colored tokens into a seven-column, six-row grid.",10,120);
}

function game(){
  //if there's no winner we can play the game
  if(getWinner() == 0){
    drawBoard();
  }
  else{
    gameOver();
  }
}

function drawBoard(){
  shared.playerPos = floor(mouseX/block);

  stroke(0);
  fill(255);//top strip
  rect(-1,-1,width + 2, block);
  for(let j = 0; j < h; j++){
    for(let i = 0; i < w; i++){
      fill(255);//background of board
      if(shared.board[j][i] > 0){
        //fill(board[j][i] == 1 ? 255:0, 0, board[j][i] == 2 ? 255: 0);
        //actual game pieces
        if(shared.board[j][i] == 1){
          fill(blueTeam);
        }
        if(shared.board[j][i] == 2){
          fill(redTeam);
        }
        ellipse(i * block + 10, j * block + 110,80,80);
      }
      ellipse(i * block + 10, j * block + 110,80,80);
    }
    
    textSize(30);
    //displays current player
    if(shared.player == 1 && shared.currentTurn == "Blue"){
      fill(blueTeam);
      text("Player: " + shared.player, 250,50);
    }
    
    else if(shared.player == 2 && shared.currentTurn == "Red"){
      fill(redTeam);
      text("Player: " + shared.player,250,50);
    }
  }
  
  //ellipse above board
  if(shared.player == 1){
    fill(blueTeam);
    ellipse((shared.playerPos + 0.15) * block, block / 2 - 35, 80,80);
  }
  
  else if(shared.player == 2){
    fill(redTeam);
    ellipse((shared.playerPos + 0.15) * block, block / 2 - 35, 80,80);
  }
}

function gameOver(){
  background(0);
  fill(255);
  textSize(40);
  text("Winner: " + getWinner() + "\n" + "Press R to restart", width/2 - 110, height/2 - 80);
}

function keyPressed(){  
  if(key == 'r'){
    shared.player = 1;
    shared.currentTurn = "Blue";
    for(let y = 0; y < h; y++){
      for(let x = 0; x < w; x++){
        shared.board[y][x] = 0;
      }
    }
  }
}

function mousePressed(){
  if(isPlayingGame){
    //enforcing turns
    if(shared.currentTurn == my.selectedTeam){
      let x = floor(mouseX / block);
      let y = nextSpace(x);
      if(y >= 0){
          shared.board[y][x] = shared.player;
          shared.player = shared.player == 1 ? 2: 1;
          shared.currentTurn = shared.currentTurn == "Blue" ? "Red": "Blue";
      }
    }
  }
  
  if(mouseX > iconBtn.x && mouseX < iconBtn.x + iconBtn.w && mouseY > iconBtn.y && mouseY < iconBtn.y + iconBtn.h){
    scene = 4;
  }
}

function nextSpace(x){
  let g = 5;
  for(let y = g - 1; y >= 0; y-=1){
    if(shared.board[y][x] == 0){
      return y;
    }
  }
  return -1;
}

function piece(x,y){
    /*if the piece's off the board it's going to return 0
  ? means return - : means otherwise or else if
  */
  return (y < 0 || x < 0 || y >= h || x >= w) ? 0: shared.board[y][x];//switch shared.player to next shared.player
}

function getWinner(){
  //rows
  for(let y = 0; y < h; y++){
    for(let x = 0; x < w; x++){
            /*if position isn't empty and piece is equal to the one to the right of it 
      and the piece the right of that one
      basically four pieces in a row
      */
  if(piece(y,x) != 0 && piece(y,x) == piece(y,x + 1) && piece(y,x) == piece(y, x + 2) && piece(y,x) == piece(y,x + 3)){
       return piece(y,x);
     } 
    }
  }
  
  //columns
  for(let y = 0; y < h; y++){
    for(let x = 0; x < w; x++){
      if(piece(y,x) != 0 && piece(y,x) == piece(y + 1, x) && piece(y,x) == piece(y + 2,x) && piece(y,x) == piece(y + 3 ,x)){
         return piece(y,x);
      }
    }
  }
  
  //diagonals
  for(let y = 0; y < h; y++){
    for(let x = 0; x < w; x++){
      for(let d = -1; d <= 1; d+= 2){
        if(piece(y,x) != 0 && piece(y,x) == piece(y + 1, x + 1 * d) && piece(y,x) == piece(y + 2, x + 2 * d) && piece(y,x) == piece(y + 3, x + 3 * d)){
          return piece(y,x);
        }
      }
    }
  }
  
  //keep going if there's no tie
  for(let y = 0; y < h; y++){
    for(let x = 0; x < w; x++){
      if(piece(y,x) == 0){
        return 0;
      }
    }
  }
  return -1;//tie
}
  