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
        if(err) console.log(err)
        res.end(JSON.stringify(result));
    })
    connection.end();
})

app.get("/insert", (req, res) => {
    let params = url.parse(req.url, true).query;
    let query = "insert into chats values(?,?,?,?)"
    let now = new Date().toJSON().slice(0, 19).replace('T', ' ')
    let data = [params.id, params.user, params.input, now]
    
    var connection = mysql.createConnection(db);
    connection.connect();
    connection.query(query, data, function(err, result, fields){
        if(err) console.log(err)
        res.send("ok");
        sendToAll(params.id, params.user, params.input, now);
    })
    connection.end();
    info("User: " + params.user + " write message: " + params.input)
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
    info("User: " + params.name + " entered the room")
    users.set(params.id, {'name': params.name, 'res': res})
    res.write("event: open\n")
    res.write("data: Opening the SSE connection\n\n");

    req.on('close', () =>{
        res.write("event: close\n");
        res.write("data: Closing the SSE connection\n\n");
        users.delete(params.id)
        info("User: " + params.name +" has left the room")
    })
})

function sendToAll(id, name, said, time){
    users.forEach((val, key) => {
        if(key !== id){
            val.res.write("event: message\n");
            val.res.write("data: {"
                + "id" + id + ","
                + "user:" + name + ","
                + "said:" + said + ","
                + "data:" + time 
                + "}\n\n")
            info("Send message of " + name + " to: " + val.name)
        }
    })
}

function info(mes){
    console.log(new Date().toLocaleTimeString() + " [" + mes + "]\n")
}

app.listen(3001, () => info("server listening in port 3001"));