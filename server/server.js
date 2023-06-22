const express = require('express');
const app = express();
const mysql = require('mysql');
const url = require('url');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

app.use(cors());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../file');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({storage: storage});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const db = {
    host: '82.165.30.63',
    user: 'test1',
    password: 'test1',
    database: 'myDB'
};

/*const connection = mysql.createConnection(db);
connection.connect();
process.on('SIGINT', () => {
    connection.end();
});*/

app.get("/history", (req, res)=>{
    const connection = mysql.createConnection(db);
    connection.connect();
    connection.query("select * from chats;", function(err, result, fields){
        if(err) {
            console.log(err);
            res.status(500).end("ko");
        }else
            res.status(200).end(JSON.stringify(result));
    })
    connection.end();
})

app.post("/insert", (req, res) => {
    let params = req.body;
    let query = "insert into chats values(?,?,?,?,?,?)"
    let data = [params.userid, params.username, params.input, mysqlTime(new Date(params.data)), params.imgName, params.type]
    
    var connection = mysql.createConnection(db);
    connection.connect();
    connection.query(query, data, function(err, result, fields){
        if(err) {
            console.log(err)
            res.writeHead(500)
            res.end("ko")
        }else{
            res.status(200).end("ok");
            sendToAllMes(params);
        }
    })
    connection.end();
    
    let userCurr = users.get(params.userid);
    clearTimeout(userCurr.timer);
    userCurr.timer = setTimeout(() => {
        timerSession(params.userid);
    }, 1000*60*60);
    users.set(params.userid, userCurr);
    info("User: " + params.username + " write message: " + params.input, 2)
})

app.post("/uploadFile", upload.single("file"), (req, res) => {
    let params = req.body;
    let file = req.file;
    params.input = file.filename;

    let query = "insert into chats values(?,?,?,?,?,?)"
    let data = [params.userid, params.username, file.filename, mysqlTime(new Date(params.data)), params.imgName, params.type]
    
    var connection = mysql.createConnection(db);
    connection.connect();
    connection.query(query, data, function(err, result, fields){
        if(err) {
            console.log(err)
            res.writeHead(500)
            res.end("ko")
        }else{
            res.status(200).end(file.filename);
            sendToAllMes(params);
        }
    })
    connection.end();
    
    let userCurr = users.get(params.userid);
    clearTimeout(userCurr.timer);
    userCurr.timer = setTimeout(() => {
        timerSession(params.userid);
    }, 1000*60*60);
    users.set(params.userid, userCurr);
    info("User: " + params.username + " update file: " + file.filename.split("-")[1], 2)
})

let users = new Map();

app.get("/listen", (req, res) => {
    const header = {
        'Content-Type': 'text/event-stream',
        'Connection': 'Keep-alive',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no'
    };
    res.writeHead(200, header);
    let params = url.parse(req.url, true).query;
    info("User: " + params.name + " entered the room", 1);

    let timeOut = setTimeout(() => {
        timerSession(params.id);
    }, 1000*60*60);
    users.set(params.id, {name: params.name, res: res, timer: timeOut})

    fs.readdir('../react/fe_chat/public/cat', function(err, files) {
        if (err) {
            console.error(err);
            res.write("event: open\n")
            res.write("data: " + '{"img": "Senza titolo.jpg"}\n\n');
        }else{
            let n = Math.floor(Math.random() * files.length) + 1
            res.write("event: open\n")
            res.write("data: " + '{"img": "' + files[n] + '"}\n\n"');
        }
        sendToAllRoom()
    });
})

app.post("/logout", (req, res) => {
    let params = req.body;
    let userCurr = users.get(params.id)
    if(userCurr && userCurr.res){
        let resSSE = userCurr.res;
        resSSE.write("event: close\n");
        resSSE.write("data: Closing the SSE connection\n\n");
        if (userCurr)
            clearTimeout(userCurr.timer);
        users.delete(params.id)
    }
    res.sendStatus(200);
    info("User: " + params.name +" has left the room", 1)
    sendToAllRoom()
})

function sendToAllMes(params){
    let messaggio = JSON.stringify({
        type: params.type,
        userid: params.userid,
        username: params.username,
        input: params.input,
        data: params.data,
        imgName: params.imgName
    });
    users.forEach((val, key) => {
        if(key !== params.userid){
            val.res.write("event: message\n");
            val.res.write("data: " + messaggio + "\n\n")
            info("Send message of " + params.username + " to: " + val.name, 3)
        }
    })
}

function sendToAllRoom(){
    let inRoom = Array.from(users.entries()).map((entry) => {return {userid: entry[0], username: entry[1].name}})
    users.forEach((val, key) => {
        val.res.write("event: message\n");
        val.res.write("data: " + JSON.stringify({type: "user", inRoom: inRoom}) + "\n\n")
    })
}

function timerSession(id) {
    let userCurr = users.get(id);
    if(userCurr && userCurr.res){
        userCurr.res.write("event: message\n");
        userCurr.res.write("data: " + JSON.stringify({type: "close", messaggio: "Closing the SSE connection"}) + "\n\n");
        info("User: " + userCurr.name + " session expired", 1)
    }
    users.delete(id)
    sendToAllRoom()
}

function mysqlTime(date){
    return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function info(mes, n){
    console.log(new Date().toLocaleTimeString() + " ".repeat(n) + " [" + mes + "]")
}

app.listen(3001, () => info("server listening in port 3001", 0));