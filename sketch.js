// http://www.javascripter.net/games/tetris/game.htm
// のサイトを見て（コードは見ずに）できるだけテトリスに近くしようと思います

// グリッドの初期化
const rows = 16;
const cols = 10;
let grid = new Array(rows);
for(let i = 0; i < rows; i++){
	grid[i] = new Array(cols).fill(false);
}

// カンバスの設計
let board = document.createElement('canvas');
// board.setAttribute('id', 'Board');
board.setAttribute('width',"400");
board.setAttribute('height', "640");
board.setAttribute('style',"border:1px solid #d3d3d3");

const instructions = document.createElement('p');
instructions.innerHTML="RETURN new game, arrow keys or WASD, SPACE quickdown";
let gameBGM = document.createElement('audio');
gameBGM.setAttribute("src","https://ia800504.us.archive.org/33/items/TetrisThemeMusic/Tetris.mp3");
gameBGM.setAttribute("controls","controls");
gameBGM.autoplay = true;
gameBGM.load();
$( ()=>{
	$('body').append(board);
	$('body').append(instructions);
	$('body').append(gameBGM);
});

// ゲームのための変数
let currentb;
let randbl;
let linesCleared = 0;
const reducer = (acc, cv) => acc && cv;
const gameSpeed = 600;
const blocks = [
	// O
	[[0,4],[0,5],[1,4],[1,5]],
	// I
	[[0,5],[1,5],[2,5],[3,5]],
	// T
	[[0,5],[1,5],[2,5],[1,4]],
	// Z
	[[0,4],[0,5],[1,5],[1,6]],
	// S
	[[1,4],[1,5],[0,5],[0,6]],
	// L
	[[0,4],[0,5],[1,5],[2,5]],
	// J
	[[0,5],[0,4],[1,4],[2,4]]
];

// ゲームの表示
let ctx = board.getContext("2d");
function show(){
	ctx.lineWidth = 0.2;
	ctx.fillStyle = "#000000";
	ctx.strokeStyle = "#3C3D3C";
	ctx.clearRect(0, 0, board.width, board.height);
	for(let i = 0; i < rows; i++){
		for(let j = 0; j < cols; j++){
			if (grid[i][j]){
				ctx.fillRect(j*40, i*40, 39.5, 39.5);
			} else {
				ctx.strokeRect(j*40, i*40, 40, 40);
			}
		}
	}
	for(let p of currentb){
		ctx.fillRect(p[1]*40, p[0]*40, 40, 40);
	}
}

// ブロックの落ち
function update(){
	fullRow();
	let tempb = currentb.map(x=> [x[0]+1,x[1]]);
	if(stickyCollisionTest(tempb)) currentb = tempb;
}
function fullRow(){
	// fullrows = new Array();
	for(let i=rows-1; i>-1; i--){
		if(grid[i].reduce(reducer)) {
			// fullrows.push(i);
			let newrow = new Array(cols).fill(false);
			grid.splice(i, 1);
			grid.unshift(newrow);
			linesCleared++;
		}
	}
	show();
}

// ブロックの衝突テスト
function collisionTest(tempb){
	for(let p of tempb){
		if(p[1]<0 || p[1]>=cols || p[0]>=rows || grid[p[0]][p[1]]) return false;
	}
	return true;
}
function stickyCollisionTest(tempb){
	for(let p of tempb){
		if(p[0]>=rows || grid[p[0]][p[1]]) {
			placeBlock();
			return false;
		}
	}
	return true;
}

// ブロック固定
function placeBlock(){
	for(let p of currentb){
		grid[p[0]][p[1]] = true;
	}
	fullRow();
	requestNewBlock();
}

// ブロック移動
function speedDown(){
	while(true){
		if(!moveDown()) break;
	}
}
function moveSide(dir){
	let tempb = currentb.map(x=> [x[0],x[1]+dir]);
	if(collisionTest(tempb)) currentb = tempb;
	show();
}
function moveDown(){
	let tempb = currentb.map(x=> [x[0]+1,x[1]]);
	let go = stickyCollisionTest(tempb);
	if(go) currentb = tempb;
	return go;
}
function rotateTest(tempb){
	if(collisionTest(tempb)) currentb = tempb;
	show();
}

// ブロック回転
function rotate(){
	let tempb = new Array(4);
	// console.log(randbl);
	switch(randbl){
		case 1:
			if(currentb[0][1]==currentb[1][1]){
				tempb[0] = [currentb[0][0]+2, currentb[0][1]-2];
				tempb[1] = [currentb[1][0]+1, currentb[1][1]-1];
				tempb[2] = currentb[2];
				tempb[3] = [currentb[3][0]-1, currentb[3][1]+1];
			} else {
				tempb[0] = [currentb[0][0]-2, currentb[0][1]+2];
				tempb[1] = [currentb[1][0]-1, currentb[1][1]+1];
				tempb[2] = currentb[2];
				tempb[3] = [currentb[3][0]+1, currentb[3][1]-1];
			}
			rotateTest(tempb); break;
		case 2:
			if(currentb[1][0]==currentb[3][0]){
				if(currentb[1][1]>currentb[3][1]){
					// point left -> up
					tempb[0] = [currentb[2][0]-1, currentb[2][1]+1];
					tempb[1] = currentb[1];
					tempb[2] = currentb[3];
					tempb[3] = currentb[0];
				} else {
					// point right -> down
					tempb[0] = [currentb[2][0]+1, currentb[2][1]-1];
					tempb[1] = currentb[1];
					tempb[2] = currentb[3];
					tempb[3] = currentb[0];
				}
			} else {
				if(currentb[1][0]>currentb[3][0]){
					// point up -> right
					tempb[0] = [currentb[2][0]+1, currentb[2][1]+1];
					tempb[1] = currentb[1];
					tempb[2] = currentb[3];
					tempb[3] = currentb[0];
				} else {
					// point down -> left
					tempb[0] = [currentb[2][0]-1, currentb[2][1]-1];
					tempb[1] = currentb[1];
					tempb[2] = currentb[3];
					tempb[3] = currentb[0];
				}
			}
			rotateTest(tempb); break;
		case 3: // Z
			if(currentb[1][0]!=currentb[0][0]){
				// point left -> down
				tempb[0] = [currentb[0][0]+1, currentb[0][1]-2];
				tempb[1] = [currentb[1][0], currentb[1][1]-1];
				tempb[2] = [currentb[2][0]+1, currentb[2][1]];
				tempb[3] = [currentb[3][0], currentb[3][1]+1];
			} else {
				// point down -> left
				tempb[0] = [currentb[0][0]-1, currentb[0][1]+2];
				tempb[1] = [currentb[1][0], currentb[1][1]+1];
				tempb[2] = [currentb[2][0]-1, currentb[2][1]];
				tempb[3] = [currentb[3][0], currentb[3][1]-1];
			}
			rotateTest(tempb); break;
		case 4:
			if(currentb[1][0]!=currentb[0][0]){
				// point left -> down
				tempb[0] = [currentb[0][0]+1, currentb[0][1]-1];
				tempb[1] = [currentb[1][0], currentb[1][1]];
				tempb[2] = [currentb[2][0]+1, currentb[2][1]+1];
				tempb[3] = [currentb[3][0], currentb[3][1]+2];
			} else {
				// point down -> left
				tempb[0] = [currentb[0][0]-1, currentb[0][1]+1];
				tempb[1] = [currentb[1][0], currentb[1][1]];
				tempb[2] = [currentb[2][0]-1, currentb[2][1]-1];
				tempb[3] = [currentb[3][0], currentb[3][1]-2];
			}
			rotateTest(tempb); break;
		case 5: // L
			if(currentb[1][0]!=currentb[0][0]){
				if(currentb[1][1]>currentb[2][1]){
					// point left -> up
					tempb[0] = [currentb[0][0]+1, currentb[0][1]];
					tempb[1] = [currentb[1][0], currentb[1][1]-1];
					tempb[2] = [currentb[2][0]-1, currentb[2][1]];
					tempb[3] = [currentb[3][0]-2, currentb[3][1]+1];
				} else {
					// point right -> down
					tempb[0] = [currentb[0][0]-2, currentb[0][1]];
					tempb[1] = [currentb[1][0]-1, currentb[1][1]+1];
					tempb[2] = currentb[2];
					tempb[3] = [currentb[3][0]+1, currentb[3][1]-1];
				}
			} else {
				if(currentb[1][0]<currentb[2][0]){
					// point down -> left
					tempb[0] = [currentb[0][0]-1, currentb[0][1]+2];
					tempb[1] = [currentb[1][0], currentb[1][1]+1];
					tempb[2] = [currentb[2][0]-1, currentb[2][1]];
					tempb[3] = [currentb[3][0]-2, currentb[3][1]-1];
				} else {
					// point up -> right
					tempb[0] = [currentb[0][0], currentb[0][1]-2];
					tempb[1] = [currentb[1][0]-1, currentb[1][1]-1];
					tempb[2] = currentb[2];
					tempb[3] = [currentb[3][0]+1, currentb[1][1]+1];
				}
			}
			rotateTest(tempb); break;
		case 6: // J
			if(currentb[1][0]!=currentb[0][0]){
				if(currentb[1][1]>currentb[2][1]){
					// point left -> up
					tempb[0] = [currentb[0][0], currentb[0][1]-2];
					tempb[1] = [currentb[1][0]+1, currentb[1][1]-1];
					tempb[2] = currentb[2];
					tempb[3] = [currentb[3][0]-1, currentb[3][1]+1];
				} else {
					// point right -> down
					tempb[0] = [currentb[0][0]-1, currentb[0][1]+2];
					tempb[1] = [currentb[1][0]-2, currentb[1][1]+1];
					tempb[2] = [currentb[2][0]-1, currentb[2][1]];
					tempb[3] = [currentb[3][0], currentb[3][1]-1];
				}
			} else {
				if(currentb[1][0]<currentb[2][0]){
					// point down -> left
					tempb[0] = [currentb[0][0]+1, currentb[0][1]];
					tempb[1] = [currentb[1][0], currentb[1][1]+1];
					tempb[2] = [currentb[2][0]-1, currentb[2][1]];
					tempb[3] = [currentb[3][0]-2, currentb[3][1]-1];
				} else {
					// point up -> right
					tempb[0] = [currentb[0][0]-2, currentb[0][1]];
					tempb[1] = [currentb[1][0]-1, currentb[1][1]-1];
					tempb[2] = currentb[2];
					tempb[3] = [currentb[3][0]+1, currentb[1][1]+1];
				}
			}
			rotateTest(tempb); break;
		default:
	}
}

// ランダムでブロックを選ぶ
function requestNewBlock(){
	randbl = Math.floor(Math.random()*7);
	currentb = blocks[randbl];
	for(let p of currentb){
		if(grid[p[0]][p[1]]) {
			show();
			gameOver()
		};
	}
}

// ゲームオーバー画面
function gameOver(){
	// ctx.fillStyle = "#FDFEFD";
	// ctx.fillRect(40, 160, 320, 120);
	// ctx.fillStyle = "#FC2017";
	// ctx.font = "46px Arial";
	// ctx.fillText("Game Over", 80, 230);
	// ctx.font = "12px Arial";
	// ctx.fillText("Lines Cleared: "+linesCleared, 80, 260);

	if(confirm("Game Over\nYour lines cleared: "+linesCleared)){
		for(let i = 0; i < rows; i++){
			grid[i] = new Array(cols).fill(false);
		}
		linesCleared = 0;
		requestNewBlock();
	}
}

// ゲームの操作
$(document).ready(()=>{
	$("body").keyup((e)=>{
		switch(e.keyCode){
			case 13: // return key
				location.reload(); break;
			case 32: // space quick down
				speedDown(); break;
			case 37: // left arrow
			case 65: // a key left
				moveSide(-1); break;
			case 38: // up arrow spin
			case 87: // w key spin
				rotate();
				break;
			case 39: // right arrow
			case 68: // d key right
				moveSide(1); break;
			case 40: // down arrow
			case 83: //s key down
				moveDown(); break;
			default:
		}
		show();
	});
});

requestNewBlock();
setInterval(update, gameSpeed);