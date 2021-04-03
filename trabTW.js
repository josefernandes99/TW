var board = {
	p1vspc: 0,
	p1vsp2: 0,
	pc: 0,
	p2: 0,
	drawp1vspc: 0,
	drawp1vsp2: 0,
	board: null,
	rows :8,
	cols :8,
	grids :[],
	states : {
		'empty' : { 'id' : 0, 'color' : 'empty' },
		'dark' : { 'id' : 1, 'color' : 'black' },
		'light' : { 'id' : 2, 'color' : 'white' },
		'highlight' : { 'id' : 3, 'color' : 'grey' },
	},

	initBoard(){
		var table = document.createElement('table');
		for(var row = 1; row <= this.rows; row++){
			var tr = document.createElement('tr');
			table.appendChild(tr);
			this.grids[row] = [];
			for(var col = 1; col <= this.cols; col++){
				var td = document.createElement('td');
				tr.appendChild(td);
				var span = document.createElement('span');
				this.grids[row][col] = this.initItemState(td.appendChild(span));
				this.bindMove(td, row, col);
			}
		}
		this.board.appendChild(table);
	},
	exitBoard(){
		for(var row = 1; row <= this.rows; row++){
			for(var col = 1; col <= this.cols; col++){
				this.setItemState(row, col, this.states.empty);
			}
		}
		start1.style.display = "block";
		start2.style.display = "block";
		difficulty.style.display = "block";
		areajogo.style.display = "none";
		restart.style.display = "none";
		exit.style.display = "none";
		score.style.visibility = "hidden";
	},
	resetBoard(){
		for(var row = 1; row <= this.rows; row++){
			for(var col = 1; col <= this.cols; col++){
				this.setItemState(row, col, this.states.empty);
			}
		}
		if (gamemode == 1){
			game1.initGame();
		}
		else if (gamemode == 2){
			initGame();
		}
	},
	initItemState(elem){
		return {
			'elem' : elem,
			'state' : board.states.empty
		};
	},
	bindMove(elem, row, col){
		if (gamemode == 1){
			elem.onclick = function(){
				if(game1.isValidMove(row,col)){
					game1.removeHighlight();
					game1.move(row,col);
				}
			}
		}
		else if (gamemode == 2){
			elem.onclick = function(){
				if(isValidMove(row,col)){
					move.row = row-1;
					move.column = col-1;
					notify();
				}
			}
		}
	},
	setItemState(row, col, state){
		this.grids[row][col].state = state;
		if(state.id == 0){
			this.grids[row][col].elem.style.visibility = "hidden";
		}else{
			this.grids[row][col].elem.style.visibility = "visible";
			this.grids[row][col].elem.style.background = state.color;
		}
	}
}

var game1 = {
	black : 0,
	white : 0,
    empty : 0,
	turn : null,
	pcolor : null,
	flag : 0,
	blacks : 0,
	whites : 0,
	emptys : 0,

	initGame(){
		board.setItemState(4,4, board.states.light);
		board.setItemState(4,5, board.states.dark);
		board.setItemState(5,4, board.states.dark);
		board.setItemState(5,5, board.states.light);
		this.setScore(2,2,60);
		this.setTurn(board.states.dark);
	},
	setScore(dark, light, empty){
		document.getElementById("black").innerHTML = "Dark : " + dark;
		document.getElementById("white").innerHTML = "Light : " + light;
		document.getElementById("empty").innerHTML = "Empty : " + empty;
		if (empty == 0){
			this.finalizeGame();
		}
	},
	isValidMove(row,col){
		var rowCheck, colCheck,
		toCheck = (this.turn.id == board.states.dark.id) ?
		board.states.light : board.states.dark;

		if(!this.isValidPosition(row,col) || this.isVisibleItem(row,col)){
			return false;
		}
		for(var rowDir = -1; rowDir <= 1; rowDir++){
			for(var colDir = -1; colDir <= 1; colDir++){
				if(rowDir == 0 && colDir == 0){
					continue;
				}
				rowCheck = row + rowDir;
				colCheck = col + colDir;
				var found = false;

				while(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && board.grids[rowCheck][colCheck].state.id == toCheck.id){
					rowCheck += rowDir;
					colCheck += colDir;
					found = true;
				}
				if(found){
					if(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && board.grids[rowCheck][colCheck].state.id == this.turn.id){
						return true;
					}
				}
			}
		}
		return false;
	},
	isValidPosition(row,col){
		return (row >= 1 && row <= board.rows) && (col >= 1 && col <= board.cols);
	},
	isVisibleItem(row,col){
		return this.isVisible(board.grids[row][col].state);
	},
	isVisible(state){
		return (state.id == board.states.dark.id) || (state.id == board.states.light.id);
	},
	move(row,col){
		var finalItems = [];
		var rowCheck, colCheck,
		toCheck = (this.turn.id == board.states.dark.id) ?
		board.states.light : board.states.dark;

		if(!this.isValidPosition(row, col) || this.isVisibleItem(row,col)){
			return false;
		}
		for(var rowDir = -1; rowDir <= 1; rowDir++){
			for(var colDir = -1; colDir <= 1; colDir++){
				if(rowDir == 0 && colDir == 0){
					continue;
				}

				rowCheck = row + rowDir;
				colCheck = col + colDir;
				var possibleItems = [];

				while(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && board.grids[rowCheck][colCheck].state.id == toCheck.id){
					possibleItems.push([rowCheck, colCheck]);
					rowCheck += rowDir;
					colCheck += colDir;
				}
				if(possibleItems.length){
					if(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && board.grids[rowCheck][colCheck].state.id == this.turn.id){
						finalItems.push([row,col]);
						for(var item in possibleItems){
							finalItems.push(possibleItems[item]);
						}
					}
				}
			}
			if(finalItems.length){
				for(var item in finalItems){
					board.setItemState(finalItems[item][0], finalItems[item][1], this.turn);
				}
			}
		}
		this.setTurn(toCheck);
		this.recalculate();
	},
	setTurn(state){
		this.turn = state;
		if(state.id == this.pcolor){
			this.makeHighlight();
			document.getElementById("turn").innerHTML = "Your Turn";
		} else if (state.id != this.pcolor){
			document.getElementById("turn").innerHTML = "PC Turn";
			var timeout = setTimeout(function(){
				game1.moveAI();
				clearTimeout(timeout);
			},1000);
		}

	},
	makeHighlight(){
		var temp=0;
		for(var row = 1; row <= board.rows; row++){
			for(var col = 1; col <= board.cols; col++){
				if(this.isValidMove(row,col)){
					board.setItemState(row,col,board.states.highlight);
					temp = 1;
					board.bindMove(board.grids[row][col].elem, row, col);
				}
			}
		}
		if(temp == 0){
			this.flag +=1;
			if (this.flag == 2){
				this.recalculate();
				this.finalizeGame();
			}
			else {
				toCheck = (this.turn.id == board.states.dark.id) ?
				board.states.light : board.states.dark;
				this.setTurn(toCheck);

			}

		}
		else
			this.flag = 0;

	},
	removeHighlight(){
		for(var row = 1; row <= board.rows; row++){
			for(var col = 1; col <= board.cols; col++){
				if(board.grids[row][col].state.id == 3){
					board.setItemState(row,col,board.states.empty);
				}
			}
		}
	},
	recalculate(){
		var black_score = 0,
		white_score = 0,
        empty_score = 0;
		for(var row = 1; row <= board.rows; row++){
			for(var col = 1; col <= board.cols; col++){
				if(board.grids[row][col].state.id == 1){
					black_score++;
				}else if(board.grids[row][col].state.id == 2){
					white_score++;
				}
                else if(board.grids[row][col].state.id == 0 || board.grids[row][col].state.id == 3){
                    empty_score++;
                }
			}
		}
		this.blacks = black_score;
		this.whites = white_score;
		this.emptys = empty_score;
		this.setScore(black_score, white_score, empty_score);
	},
	moveAI(){
		var temp =0;
		for(var row = 1; row <= board.rows; row++){
			for(var col = 1; col <= board.cols; col++){
				if(this.isValidMove(row,col)){
					temp = 1;
					this.move(row,col);
					return;
				}
			}
		}
		if (temp == 0){
			this.flag += 1;
			if (this.flag == 2){
				this.recalculate();
				this.finalizeGame();
			}
			else{
				toCheck = (this.turn == board.states.dark) ?
				board.states.light : board.states.dark;
				this.recalculate();
				this.setTurn(toCheck);
			}
		}
		else
			flag = 0;
		this.recalculate();
	},
	finalizeGame(){
		if (this.blacks > this.whites){
			if (this.pcolor == board.states.dark.id){
				document.getElementById("turn").innerHTML = "You Win";
				board.p1vspc += 1;
			}
			else {
				document.getElementById("turn").innerHTML = "PC Wins";
				board.pc += 1;
			}
		}
		else if (this.whites > this.blacks){
			if (this.pcolor == board.states.light.id){
				document.getElementById("turn").innerHTML = "You Win";
				board.p1vspc += 1;
			}
			else {
				document.getElementById("turn").innerHTML = "PC Wins";
				board.pc += 1;
			}
		}
		else if (this.whites == this.blacks){
			document.getElementById("turn").innerHTML = "Draw"
			board.drawp1vspc += 1;
		}
		endgame.style.display = "block";
		//keepscorestable
		endgame.onclick = function(){
			board.exitBoard();
			start1.style.display = "block";
			start2.style.display = "block";
			difficulty.style.display = "block";
			areajogo.style.display = "none";
			restart.style.display = "none";
			exit.style.display = "none";
			score.style.visibility = "hidden";
			endgame.style.display = "none";

		}

	}

}

var game2 = {

	black : 0,
	white : 0,
    empty : 0,
	turn : null,
	flag : 0,
	blacks : 0,
	whites : 0,
	emptys : 0,
	firstpcolor : null,

	initGame(){
		board.setItemState(4,4, board.states.white);
		board.setItemState(4,5, board.states.black);
		board.setItemState(5,4, board.states.black);
		board.setItemState(5,5, board.states.white);
		this.setScore(2,2,60);
		this.setTurn(board.states.black);
	},
	setScore(black, white, empty){
		document.getElementById("black").innerHTML = "Black : " + black;
		document.getElementById("white").innerHTML = "White : " + white;
		document.getElementById("empty").innerHTML = "Empty : " + empty;
		if (empty == 0){
			this.finalizeGame();
		}
	},
	isValidMove(row,col){
		var rowCheck, colCheck,
		toCheck = (this.turn.id == board.states.black.id) ?
		board.states.white : board.states.black;

		if(!this.isValidPosition(row,col) || this.isVisibleItem(row,col)){
			return false;
		}
		for(var rowDir = -1; rowDir <= 1; rowDir++){
			for(var colDir = -1; colDir <= 1; colDir++){
				if(rowDir == 0 && colDir == 0){
					continue;
				}
				rowCheck = row + rowDir;
				colCheck = col + colDir;
				var found = false;

				while(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && board.grids[rowCheck][colCheck].state.id == toCheck.id){
					rowCheck += rowDir;
					colCheck += colDir;
					found = true;
				}
				if(found){
					if(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && board.grids[rowCheck][colCheck].state.id == this.turn.id){
						return true;
					}
				}
			}
		}
		return false;
	},
	isValidPosition(row,col){
		return (row >= 1 && row <= board.rows) && (col >= 1 && col <= board.cols);
	},
	isVisibleItem(row,col){
		return this.isVisible(board.grids[row][col].state);
	},
	isVisible(state){
		return (state == board.states.black) || (state == board.states.white);
	},
	move(row,col){
		var finalItems = [];
		var rowCheck, colCheck,
		toCheck = (this.turn.id == board.states.black.id) ?
		board.states.white : board.states.black;

		if(!this.isValidPosition(row, col) || this.isVisibleItem(row,col)){
			return false;
		}
		for(var rowDir = -1; rowDir <= 1; rowDir++){
			for(var colDir = -1; colDir <= 1; colDir++){
				if(rowDir == 0 && colDir == 0){
					continue;
				}
				rowCheck = row + rowDir;
				colCheck = col + colDir;
				var possibleItems = [];
				while(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && board.grids[rowCheck][colCheck].state.id == toCheck.id){
					possibleItems.push([rowCheck, colCheck]);
					rowCheck += rowDir;
					colCheck += colDir;
				}
				if(possibleItems.length){
					if(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && board.grids[rowCheck][colCheck].state.id == this.turn.id){
						finalItems.push([row,col]);
						for(var item in possibleItems){
							finalItems.push(possibleItems[item]);
						}
					}
				}
			}
			if(finalItems.length){
				for(var item in finalItems){
					board.setItemState(finalItems[item][0], finalItems[item][1], this.turn);
				}
			}
		}
		this.setTurn(toCheck);
		this.recalculate();
	},
	setTurn(state){
		this.turn = state;
		if(state.id == this.firstpcolor)
			document.getElementById("turn").innerHTML = "Player1 Turn";
		else if (state != this.firstpcolor)
			document.getElementById("turn").innerHTML = "Player2 Turn";
		this.makeHighlight();

	},
	makeHighlight(){
		var temp=0;
		for(var row = 1; row <= board.rows; row++){
			for(var col = 1; col <= board.cols; col++){
				if(this.isValidMove(row,col)){
					board.setItemState(row,col,board.states.highlight);
					temp = 1;
					board.bindMove(board.grids[row][col].elem, row, col);
				}
			}
		}
		if(temp == 0){
			this.flag +=1;
			if (this.flag == 2){
				this.recalculate();
				this.finalizeGame();
			}
			else {
				toCheck = (this.turn == board.states.black) ?
				board.states.white : board.states.black;
				this.setTurn(toCheck);

			}

		}
		else
			this.flag = 0;

	},
	removeHighlight(){
		for(var row = 1; row <= board.rows; row++){
			for(var col = 1; col <= board.cols; col++){
				if(board.grids[row][col].state.id == 3){
					board.setItemState(row,col,board.states.empty);
				}
			}
		}
	},
	recalculate(){
		var black_score = 0,
		white_score = 0,
        empty_score = 0;
		for(var row = 1; row <= board.rows; row++){
			for(var col = 1; col <= board.cols; col++){
				if(board.grids[row][col].state.id == 1){
					black_score++;
				}else if(board.grids[row][col].state.id == 2){
					white_score++;
				}
                else if(board.grids[row][col].state.id == 0 || board.grids[row][col].state.id == 3){
                    empty_score++;
                }
			}
		}
		this.blacks = black_score;
		this.whites = white_score;
		this.emptys = empty_score;
		this.setScore(black_score, white_score, empty_score);
	},
	finalizeGame(){
		if (this.blacks > this.whites){
			if (this.firstpcolor == board.states.black.id){
				document.getElementById("turn").innerHTML = "Player1 Wins"
				board.p1vsp2 += 1;
			}
			else{
				board.p2 += 1;
				document.getElementById("turn").innerHTML = "Player2 Wins"
			}
		}
		else if (this.whites > this.blacks){
			if (this.firstpcolor == board.states.white.id){
				document.getElementById("turn").innerHTML = "Player1 Wins"
				board.p1vsp2 += 1;
			}
			else{
				document.getElementById("turn").innerHTML = "Player2 Wins"
				board.p2 += 1;
			}
		}
		else if (this.whites == this.blacks){
			document.getElementById("turn").innerHTML = "Draw";
			board.drawp1vsp2 += 1;
		}
		endgame.style.display = "block";
		//keepscorestable
		endgame.onclick = function(){
			board.exitBoard();
			start1.style.display = "block";
			start2.style.display = "block";
			difficulty.style.display = "block";
			areajogo.style.display = "none";
			restart.style.display = "none";
			exit.style.display = "none";
			score.style.visibility = "hidden";
			endgame.style.display = "none";
		}
	}
}

var gamemode = 0;
window.onload = function(){
	board.board = document.getElementById('game');
	document.getElementById("username").value = '';
	document.getElementById("password").value = '';
	board.initBoard();
	addListenerLogin();
	addListenerLogout();
}
start1.onclick = function(){
	start1.style.display = "none";
	start2.style.display = "none";
	difficulty.style.display = "none";
	bblack.style.display = "inline-block";
	bwhite.style.display = "inline-block";
	gamemode = 1;
}
start2.onclick = function(){
	start1.style.display = "none";
	start2.style.display = "none";
	difficulty.style.display = "none";
	gamemode = 2;
	addListenerJoin();
}
bblack.onclick = function(){
	bblack.style.display = "none";
	bwhite.style.display = "none";
	firsttoplay.style.display = "none";
	areajogo.style.display = "block";
	restart.style.display = "block";
	exit.style.display = "block";
	game1.pcolor = board.states.dark.id;
	game2.firstpcolor = board.states.dark.id;
	score.style.visibility = "visible";
	if(gamemode == 1){
		game1.initGame();
	}
}
bwhite.onclick = function() {
	bblack.style.display = "none";
	bwhite.style.display = "none";
	firsttoplay.style.display = "none";
	areajogo.style.display = "block";
	restart.style.display = "block";
	exit.style.display = "block";
	game1.pcolor = board.states.light.id;
	game2.firstpcolor = board.states.light.id;
	score.style.visibility = "visible";
	if(gamemode == 1){
		game1.initGame();
	}
}
instructions.onclick = function(){
	instructions.style.display = "none";
	instruct.style.display = "block";
	instructb.style.display = "block";
}
instructb.onclick = function(){
	instructions.style.display = "block";
	instruct.style.display = "none";
	instructb.style.display = "none";
}
restart.onclick = function(){
	document.getElementById("turn").innerHTML = "Restarting";
		setTimeout(() => { board.resetBoard(); }, 1000);
}
scores.onclick = function(){
	classificacao.style.display = "block";
	scorebutton.style.display = "block";
	scorebutton.style.position = "relative";
	scorebutton.style.top = "77vh";
}
scorebutton.onclick = function(){
	classificacao.style.display = "none";
	scorebutton.style.display = "none";
}
difficulty.onclick = function(){
	start1.style.display = "none";
	start2.style.display = "none";
	difficulty.style.display = "none";
	easy.style.display = "block";
	medium.style.display = "block";
	hard.style.display = "block";
}
easy.onclick = function(){
	start1.style.display = "block";
	start2.style.display = "block";
	difficulty.style.display = "block";
	easy.style.display = "none";
	medium.style.display = "none";
	hard.style.display = "none";
}
medium.onclick = function(){
	start1.style.display = "block";
	start2.style.display = "block";
	difficulty.style.display = "block";
	easy.style.display = "none";
	medium.style.display = "none";
	hard.style.display = "none";
}
hard.onclick = function(){
	start1.style.display = "block";
	start2.style.display = "block";
	difficulty.style.display = "block";
	easy.style.display = "none";
	medium.style.display = "none";
	hard.style.display = "none";
}
exit.onclick = function(){
	document.getElementById("turn").innerHTML = "Exiting";
	setTimeout(() => { board.exitBoard();}, 1000);
}

//____________________________________________________________________________________

var url = 'http://localhost:8111/';
var group = 'sempresigaistoetudonosso';
var jogo = [];
var color;
var count;
var username = "";
var password = "";
var jogoId = "";
var tabuleiro = [];
var turn;
var winner;
var flag = 0;
var black = 0;
var white = 0;
var empty = 0;
var blacks = 0;
var whites = 0;
var emptys = 0;
var movec ={
	row: 0,
	column: 0
}

function addListenerLogin(){
	document.getElementById("login").addEventListener("click", login);
}

function login(){
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	conta = {
		nick : username,
		pass : password
	}
	fetch (url + "register",{
		method: "POST",
		body: JSON.stringify(conta)
	})
	.then(function(r){
		return r.text();
	})
	.then(function(t){
		if (t!="{}"){
			window.alert("Wrong user/pass combination, try again");
		}
		else{
			document.getElementById("username").style.display = "none";
			document.getElementById("password").style.display = "none";
			document.getElementById("login").style.display = "none";
			document.getElementById("welcome").style.display = "block";
			document.getElementById("welcome").innerHTML = "Welcome " + username;
			document.getElementById("logout").style.display = "block";
			document.getElementById("start1").style.display = "block";
			document.getElementById("start2").style.display = "block";
			document.getElementById("difficulty").style.display = "block";
			document.getElementById("other").style.display = "block";
			addListenerJoin();
			addListenerGiveUp();
		}
	})
}

function addListenerLogout() {
	document.getElementById("logout").addEventListener("click", logout);
}

function logout(){
	document.getElementById("username").style.display = "block";
	document.getElementById("password").style.display = "block";
	document.getElementById("login").style.display = "block";
	document.getElementById("welcome").style.display = "none";
	document.getElementById("logout").style.display = "none";
	document.getElementById("start1").style.display = "none";
	document.getElementById("start2").style.display = "none";
	document.getElementById("difficulty").style.display = "none";
	document.getElementById("other").style.display = "none";
	document.getElementById("username").value = '';
	document.getElementById("password").value = '';
	leave();
}

function addListenerGiveUp(){
	document.getElementById("giveup").addEventListener("click", giveUp);
}

function giveUp(){
	document.getElementById("start1").style.display = "block";
	document.getElementById("start2").style.display = "block";
	document.getElementById("difficulty").style.display = "block";
	document.getElementById("areajogo").style.display = "none";
	document.getElementById("restart").style.display = "none";
	document.getElementById("exit").style.display = "none";
	document.getElementById("score").style.visibility = "hidden";
	leave();
}

function addListenerJoin(){
	document.getElementById("start2").addEventListener("click", join);
}

function join(){
	document.getElementById("start1").style.display = "none";
	document.getElementById("start2").style.display = "none";
	document.getElementById("difficulty").style.display = "none";
	document.getElementById("giveup").innerHTML = "Leave Lobby";
	document.getElementById("giveup").style.display = "block";
	document.getElementById("turn").innerHTML = "Waiting for Opponent";
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	game = {
		group: group,
		nick: username,
		pass: password,
	}
	fetch(url + "join" , {
		method: "POST",
		body: JSON.stringify(game)
	})
	.then(function(r) {
		return r.json();
	})
	.then(function(t) {
		jogoId = t.game;
		if (t.color == "dark"){
			color = board.states.dark;
			turn = username;
		}
		else if (t.color == "light"){
			color = board.states.light;
		}
		if (color == null){
			leave();
			join();
		}
		else{
			areajogo.style.display = "block";
			update();
		}
	})
}

function setTurn(){
	var username = document.getElementById("username").value;
	if(turn == username){
		document.getElementById("turn").innerHTML = "Your Turn";
		makeHighlight();
	}
	else {
		document.getElementById("turn").innerHTML = "Opponents Turn";
	}

}

function makeHighlight(){
	var temp=0;
	for(var row = 1; row <= board.rows; row++){
		for(var col = 1; col <= board.cols; col++){
			if(isValidMove(row,col)){
				board.setItemState(row,col,board.states.highlight);
				temp = 1;
				board.bindMove(board.grids[row][col].elem, row, col);
			}
		}
	}
}

function isValidMove(row,col){
	var rowCheck, colCheck,
	toCheck = (color == board.states.dark) ?
	board.states.light : board.states.dark;


	if(!isValidPosition(row,col) || isVisibleItem(row,col)){
		return false;
	}
	for(var rowDir = -1; rowDir <= 1; rowDir++){
		for(var colDir = -1; colDir <= 1; colDir++){
			if(rowDir == 0 && colDir == 0){
				continue;
			}
			rowCheck = row + rowDir;
			colCheck = col + colDir;
			var found = false;

			while(isValidPosition(rowCheck, colCheck) && isVisibleItem(rowCheck, colCheck) && board.grids[rowCheck][colCheck].state.id == toCheck.id){
				rowCheck += rowDir;
				colCheck += colDir;
				found = true;
			}
			if(found){
				if(isValidPosition(rowCheck, colCheck) && isVisibleItem(rowCheck, colCheck) && board.grids[rowCheck][colCheck].state.id == color.id){
					return true;
				}
			}
		}
	}
	return false;
}
function isValidPosition(row,col){
	return (row >= 1 && row <= board.rows) && (col >= 1 && col <= board.cols);
}
function isVisibleItem(row,col){
	return isVisible(board.grids[row][col].state);
}
function isVisible(state){
	return (state == board.states.dark) || (state == board.states.light);
}

function leave(){
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	jjogo = {
		game: jogoId,
		nick: username,
		pass: password
	}
	fetch(url + "leave" , {
		method: "POST",
		body: JSON.stringify(jjogo),
	})
	.then(function(r){
		return r.text();
	})
	.then(function(t){
		areajogo.style.display = "none";
	})
}

function update(){
	var username = document.getElementById("username").value;
	up = {
		game: jogoId,
		nick: username
	}
	var evtSource = new EventSource(encodeURI(url + "update?nick=" + username + "&game=" + up.game));
	evtSource.onmessage = function(event){
		const info = JSON.parse(event.data);
		turn = info.turn;
		document.getElementById("giveup").innerHTML = "Give Up";
		if(info.winner !== undefined){
			if(info.winner == username){
				document.getElementById("giveup").style.display = "none";
				document.getElementById("turn").innerHTML = "You Win";
			}
			else if (info.winner == null && info.count.light == 32 && info.count.dark == 32){
				document.getElementById("giveup").style.display = "none";
				document.getElementById("turn").innerHTML = "Draw";
			}
			else{
				document.getElementById("giveup").style.display = "none";
				document.getElementById("turn").innerHTML = "You Lose";
			}
			setTimeout(() => { board.exitBoard(); }, 2000);
			evtSource.close();
			return;
		}
		if(info.count !== undefined){
			document.getElementById("score").style.visibility = "visible";
			document.getElementById("black").innerHTML = "Black : " + info.count.dark;
			document.getElementById("white").innerHTML = "White : " + info.count.light;
			document.getElementById("empty").innerHTML = "Empty : " + info.count.empty;
		}
		if(info.skip == true){
			move = null;
			notify();
		}
		else if (info.skip == undefined){
			move = movec;
		}
		if(info.board!== undefined){
			console.log(info.board);
			for (var i=0; i<8; i++){
				for (var j=0; j<8; j++){
					if (info.board[i][j] == "dark"){
						board.setItemState(i+1,j+1,board.states.dark);
					}
					else if (info.board[i][j] == "light"){
						board.setItemState(i+1,j+1,board.states.light);
					}
					else if (info.board[i][j] == "empty"){
						board.setItemState(i+1,j+1,board.states.empty);
					}
				}
			}
		}
		setTurn();
	}
}
function notify(){
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	notifyc = {
		nick : username,
		pass : password,
		game: jogoId,
		move: movec
	}
	fetch(url + "notify",{
		method:"POST",
		body: JSON.stringify(notifyc)
	})
	.then(function(r){
		return r.json();
	})
	.then(function(t){
	})
}

// ranking, update, skip
