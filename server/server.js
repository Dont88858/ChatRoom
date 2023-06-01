let express = require('express');
let app = express();
let mysql = require('mysql');
let url = require('url');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get("/history", (req, res)=>{
    /*const header = {
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    };
    res.writeHead(200, header);*/
    var connection = mysql.createConnection({
        host: '82.165.30.63',
        user: 'test1',
        password: 'test1',
        database: 'myDB'
    });
    connection.connect();
    connection.query("select * from chats;", function(err, result, fields){
        if(err) console.log(err)
        res.end(JSON.stringify(result));
    })
    connection.end();
})

app.get("/insert", (req, res) => {
    let params = url.parse(req.url, true).query;
    let query = "insert into chats values(?,?,?)"
    let now = new Date().toLocaleString();
    let data = [params.user, params.input, now]
    
    var connection = mysql.createConnection({
        host: '82.165.30.63',
        user: 'test1',
        password: 'test1',
        database: 'myDB'
    });
    connection.connect();
    connection.query(query, data, function(err, result, fields){
        if(err) console.log(err)
        res.send("ok");
        sendToAll(params.user, params.input, now);
    })
    connection.end();
})

let users = [];

app.get("/listen", (req, res) => {
    const header = {
        'Content-Type': 'text/event-stream',
        'Connection': 'Keep-alive',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
    };
    res.writeHead(200, header);
    res.flushHeaders();
    let name = url.parse(req.url, true).query.name;
    console.log("add user: "+name)
    users.push({'id': name, 'res':res})
    req.on('close' ,() =>{
        console.log("remove user: "+name)
        users = users.filter(user => user.id !== name)
    })
})

function sendToAll(name, said, time){
    users.forEach((user) => {
        if(user.id !== name){
            user.res.write("event: message\n");
            user.res.write("data: {"
                + "user:" + name + ","
                + "said:" + said + ","
                + "data:" + time 
                + "}\n\n")
            console.log("send mes to: " + user.id)
        }
    })
}

app.listen(3001, () => console.log("server listening in port 3001"));