let express = require('express');
let app = express();
let mysql = require('mysql');
let url = require('url');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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
        if(err) console.log(err)
        res.end(JSON.stringify(result));
    })
    connection.end();
})

app.post("/insert", (req, res) => {
    let params = req.body;
    let query = "insert into chats values(?,?,?,?)"
    let data = [params.userid, params.username, params.said, mysqlTime(new Date(params.data))]
    
    var connection = mysql.createConnection(db);
    connection.connect();
    connection.query(query, data, function(err, result, fields){
        if(err) {
            console.log(err)
            res.writeHead(500)
            res.end("ko")
        }else{
            res.end("ok");
            sendToAllMes(params);
        }
    })
    connection.end();
    info("User: " + params.username + " write message: " + params.said, 2)
})

let users = new Map();

app.get("/listen", (req, res) => {
    const header = {
        'Content-Type': 'text/event-stream',
        'Connection': 'Keep-alive',
        'Cache-Control': 'no-cache',
    };
    res.writeHead(200, header);
    let params = url.parse(req.url, true).query;
    info("User: " + params.name + " entered the room", 1)
    users.set(params.id, {'name': params.name, 'res': res})
    res.write("event: open\n")
    res.write("data: Opening the SSE connection\n\n");
    sendToAllRoom()

    req.on('close', () =>{
        res.write("event: close\n");
        res.write("data: Closing the SSE connection\n\n");
        users.delete(params.id)
        info("User: " + params.name +" has left the room", 1)
        sendToAllRoom()
    })
})

function sendToAllMes(params){
    let messaggio = {
                type: "messaggio",
                userid: params.userid,
                username: params.username,
                said: params.said,
                data: params.data
                };
    users.forEach((val, key) => {
        if(key !== params.userid){
            val.res.write("event: message\n");
            val.res.write("data: " + JSON.stringify(messaggio)+"\n\n")
            info("Send message of " + params.username + " to: " + val.name, 3)
        }
    })
}

function sendToAllRoom(){
    let inRoom = Array.from(users.values()).map(item => item.name)
    users.forEach((val, key) => {
        val.res.write("event: message\n");
        val.res.write("data: " + JSON.stringify({type: "user", inRoom: inRoom})+"\n\n")
    })
}

function mysqlTime(date){
    return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function info(mes, n){
    console.log(new Date().toLocaleTimeString() + " ".repeat(n) + " [" + mes + "]")
}

app.listen(3001, () => info("server listening in port 3001", 0));