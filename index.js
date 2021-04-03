"use strict"

const PORT = 8111
const http = require('http')
const url = require('url')
const fs = require('fs')
const crypto = require('crypto')

console.log("olaoi")

var headers = {
    plain: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    },
    sse: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive'
    }
}

var server = http.createServer(function (request, response){
    var parsedURL = url.parse(request.url,true);
    var pathname = parsedURL.pathname;
    switch(request.method){
        case "POST": doPost(pathname,request,response)
        case "GET": doGet(pathname,request,response)
        default:
    }
})

server.listen(PORT);

function doPost(pathname, request, response){
    var body = "";
    var resposta;
    response.setHeader('Access-Control-Allow-Origin','*');
    switch(pathname) {
        case "/register":
        request
        .on("data", function(data) {body += data})
        .on("end", function() {
            try {
                var query = JSON.parse(body);
                var flag = 0;
                var estadoatual;
                var obj;
                var answer;
                var ser = "";
                if(query.nick === ser || query.pass === ser){
                    response.writeHead(400,{'Content-Type':"application/json"})
                    response.end();
                }
                else{
                    fs.readFile("users.json",function(err,data){
                        if(!err){
                            obj = JSON.parse(data);
                            var hash = crypto.createHash('md5')
                                             .update(query.pass)
                                             .digest('hex');
                            for(var i=0;i<obj.users.length;i++){
                                if(obj.users[i].nick === query.nick && obj.users[i].pass !== hash){
                                    console.log("Register: Error Login In");
                                    response.writeHead(400,{'Content-Type':"application/json"})
                                    response.end();
                                    flag = 1;
                                    answer = 400;
                                    break;
                                }
                                if(obj.users[i].nick === query.nick && obj.users[i].pass === hash){
                                    console.log("Register: Found User, Login In Now");
                                    response.writeHead(200,{'Content-Type':"application/json"})
                                    response.end(JSON.stringify({}));
                                    answer = 200
                                    flag = 1;
                                    break;
                                }
                            }
                            if(flag === 0){
                                obj.users.push({nick:query.nick,pass:hash});
                                fs.writeFile("users.json", JSON.stringify(obj),function(err){
                                    if(!err){
                                        console.log("Register: New user registered successfully")
                                        response.writeHead(200,{'Content-Type':"application/json"})
                                        response.end(JSON.stringify({}));
                                        answer = 200;
                                    }
                                })
                            }
                        }
                    })
                }
            }
            catch(err) {}
        })
        .on("error", function(err) {console.log(err.message);})
        break;

        case "/ranking":
        request
        .on("data",function(data) {body += data})
        .on("end",function(){
            try{
                var ranking;
                fs.readFile("ranking.json",function(err,data){
                    if(!err){
                        ranking = JSON.parse(data);
                        console.log(ranking);
                        console.log("Loaded Rankings");
                        response.writeHead(200,{'Content-Type':"application/json"})
                        response.end(JSON.stringify(ranking));
                    }
                    else {throw err}
                })
            }
            catch(err) {}
        })
        .on("error",function(err) {console.log(err.message);})
        break;

        case "/join":
        request
        .on("data",function(data) {body += data})
        .on("end",function(){
            try{
                var query = JSON.parse(body);
                var hash1 = crypto.createHash('md5')
                                  .update(query.pass,query.nick)
                                  .digest('hex');
                var obj;
                var flag;
                var ser = "";
                console.log("QUERY:")
                console.log(query);
                fs.readFile("users.json",function(err,data){
                    obj = JSON.parse(data);
                    console.log("HASH1:")
                    console.log(hash1)
                    console.log("OBJ:");
                    console.log(obj);
                    for(var i = 0;i<obj.users.length;i++){
                        if(query.nick === obj.users[i].nick && hash1 === obj.users[i].pass){
                            flag = 2;
                            console.log("entrei")
                            break;
                        }
                    }
                    if(flag !== 2){
                        response.writeHead(400,{'Content-Type':"application/json"})
                        response.end();
                    }
                    if (flag === 2){
                        fs.readFile("lobbies.json", function(err, data){
                            var lobbies = JSON.parse(data)
                            if (lobbies.joins.length % 2 == 0){
                                /////////////////////////////////////
                                var hash = crypto.createHash('md5')
                                                 .update(query.nick)
                                                 .digest('hex');
                                /////////////////////////////////////
                                console.log("HASH1")
                                console.log(hash)
                                console.log("QUERY.NICK")
                                console.log(query.nick)
                                lobbies.joins.push({nick:query.nick, game:hash});
                                fs.writeFile("lobbies.json", JSON.stringify(lobbies), function(err){if(err) throw err})
                                response.writeHead(200,{'Content-Type':"application/json"})
                                var object = {game:hash, color:"dark"}
                                response.end(JSON.stringify(object))
                            }
                            else if (lobbies.joins.length % 2 == 1){
                                /////////////////////////////////////
                                var hash = lobbies.joins[(lobbies.joins.length)-1].game
                                /////////////////////////////////////
                                console.log("HASH2")
                                console.log(hash)
                                lobbies.joins.push({nick:query.nick, game:hash});
                                fs.writeFile("lobbies.json", JSON.stringify(lobbies), function(err){if(err) throw err})
                                response.writeHead(200,{'Content-Type':"application/json"})
                                fs.readFile("boards.json", function(err,data){
                                    var object = {game:hash, color:"light"}
                                    var tabuleiro = {row1:[{col1:"empty"},{col2:"empty"},{col3:"empty"},{col4:"empty"},{col5:"empty"},{col6:"empty"},{col7:"empty"},{col8:"empty"}],
                                                     row2:[{col1:"empty"},{col2:"empty"},{col3:"empty"},{col4:"empty"},{col5:"empty"},{col6:"empty"},{col7:"empty"},{col8:"empty"}],
                                                     row3:[{col1:"empty"},{col2:"empty"},{col3:"empty"},{col4:"empty"},{col5:"empty"},{col6:"empty"},{col7:"empty"},{col8:"empty"}],
                                                     row4:[{col1:"empty"},{col2:"empty"},{col3:"empty"},{col4:"light"},{col5:"dark" },{col6:"empty"},{col7:"empty"},{col8:"empty"}],
                                                     row5:[{col1:"empty"},{col2:"empty"},{col3:"empty"},{col4:"dark" },{col5:"light"},{col6:"empty"},{col7:"empty"},{col8:"empty"}],
                                                     row6:[{col1:"empty"},{col2:"empty"},{col3:"empty"},{col4:"empty"},{col5:"empty"},{col6:"empty"},{col7:"empty"},{col8:"empty"}],
                                                     row7:[{col1:"empty"},{col2:"empty"},{col3:"empty"},{col4:"empty"},{col5:"empty"},{col6:"empty"},{col7:"empty"},{col8:"empty"}],
                                                     row8:[{col1:"empty"},{col2:"empty"},{col3:"empty"},{col4:"empty"},{col5:"empty"},{col6:"empty"},{col7:"empty"},{col8:"empty"}]}
                                    var board = JSON.parse(data);
                                    board.boards.push({game:hash, board:tabuleiro});
                                    fs.writeFile("boards.json", JSON.stringify(board), function(err){if(err) throw err})
                                    response.end(JSON.stringify(object))
                                })
                            }
                            else{
                                response.writeHead(400,{'Content-Type':"application/json"})
                                response.end();
                            }
                        })
                    }
                })
            }
            catch(err) {}
        })
        .on("error",function(err) {console.log(err.message);})
        break;

        case "/leave":
        request
        .on("data",function(data) {body += data})
        .on("end",function(){
            try{
                var flag1;
                var flag2;
                var query = JSON.parse(body);
                fs.readFile("lobbies.json",function(err,data){
                    var pos;
                    var obj = JSON.parse(data);
                    var count = 0;
                    for(var i=0;i<obj.joins.length;i++){
                        if(count === 2){
                            break;
                        }
                        if(query.game === obj.joins[i].game){
                            count ++;
                            pos = i;
                            if(query.nick === obj.joins[i].nick){
                                flag1 = i;
                            }
                            else
                                flag2 = i;
                        }
                    }
                    if(count === 1){
                        console.log("pos: " + pos)
                        obj.joins.splice(pos,1);
                        console.log(JSON.stringify(obj))
                        fs.writeFile("lobbies.json", JSON.stringify(obj),function(err){if(err) throw err;})
                        response.writeHead(200,{'Content-Type':"application/json"});
                        response.end();
                    }
                    else if(count == 2){
                        //give loss to player who left
                        if(flag1 < flag2)
                            obj.joins.splice(flag1,2);
                        else if(flag2 < flag1)
                            obj.joins.splice(flag2,2);
                        fs.writeFile("lobbies.json", JSON.stringify(obj),function(err){if(err) throw err;})
                        response.writeHead(200,{'Content-Type':"application/json"})
                        response.end();
                    }
                })
            }
            catch(err) {}
        })
        .on("error",function(err) {console.log(err.message);})
        break;
        return;

        case "/notify":
        request
        .on("data",function(data) {body += data})
        .on("end",function(){
            try{
                var query = JSON.parse(body);
                var nick = query.nick;
                var pass = query.pass;
                var game = query.game;
                var move = query.move;
                if (name === null){
                    response.writeHead(400,{'Content-Type':"application/json"});
                    response.end();
                    return;
                }
                else if (pass === null){
                    response.writeHead(400,{'Content-Type':"application/json"});
                    response.end();
                    return;
                }
                else if (game === null){
                    response.writeHead(400,{'Content-Type':"application/json"});
                    response.end();
                    return;
                }
                else if(name === "" || pass === ""){
                    response.writeHead(401,{'Content-Type':"application/json"})
                    response.end();
                    return;
                }
                else{
                    var notRegistered = -1;
                    fs.readFile("users.json", function(err, data){
                        var obj = JSON.parse(data);
                        for(var i=0; i<obj.users.length; i++){
                            var hash = crypto.createHash('md5')
                                             .update(pass)
                                             .digest('hex');
                            if(obj.users[i].nick === nick && obj.users[i].pass !== hash){
                                notRegistered = 0;
                                response.writeHead(401,{'Content-Type':"application/json"})
                                response.end();
                                return;
                            }
                            else if(obj.users[i].nick === name && obj.users[i].pass === hash){
                                notRegistered = 0;
                                break;
                            }
                        }
                        if(notRegistered == -1){
                            response.writeHead(401,{'Content-Type':"application/json"})
                            response.end();
                            return;
                        }
                    })
                }
                var roomPlaying = -1;
                fs.readFile("lobbies.json", function(err, data){
                    var obj = JSON.parse(data);
                    for(var i=0; i<obj.joins.length; i++){
                        if(obj.joins[i].game === game){
                            roomPlaying = i;
                            break;
                        }
                    }
                })
                //clear timeout nao faço a minima
                //falta o codigo do move
            }
            catch(err) {}
        })
        .on("error",function(err) {console.log(err.message);})
        break;
        return;
    }
}

function doGet(pathname, request, response){
    var body = "";
    response.setHeader('Access-Control-Allow-Origin','*');
    switch(pathname){
        case "/update":
            request
            .on("data",function(data) {body += data})
            .on("end",function(){
                try{
                    var query = JSON.parse(body);
                    var nome = query.nick;
                    var game = query.game;
                    if (name === null){
                        response.writeHead(400,{'Content-Type':"application/json"});
                        response.end();
                        return
                    }
                    else if(game === null){
                        response.writeHead(400,{'Content-Type':"application/json"});
                        response.end();
                    }
                    var roomPlaying = -1;
                    fs.readFile("lobbies.json", function(err,data){
                        var obj = JSON.parse(data);
                        for(var i=0; i<obj.joins.length; i++){
                            if(obj.joins[i].game === game){
                                roomPlaying = i;
                                if(obj.joins[i].nick === name /*&& nao faço a minima*/){
                                    //nao faço a minima
                                    response.writeHead(200,{'Content-Type':"application/json"})
                                    return;
                                }
                                else if(obj.joins[i+1].nick === name && obj.joins[i+1].game === game /*&& nao faço a minima*/) {
                                    //nao faço a minima
                                    response.writeHead(200,{'Content-Type':"application/json"})
                                    //nao faço a minima
                                    return;
                                }
                            }
                        }
                        if(roomPlaying == -1){
                            response.writeHead(200,{'Content-Type':"application/json"})
                            response.end();
                            return;
                        }
                        else{
                            //nao faço a minima;
                        }
                    })
                    //falta o update da board, o skip, o winner, etc etc
                }
                catch(err) {}
            })
            .on("error",function(err) {console.log(err.message);})
            break;
            return;
        default:
    }
}
