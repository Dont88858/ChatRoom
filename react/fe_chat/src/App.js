import './App.css';
import React from 'react';
import {useState} from 'react';
import ChatRoom from './ChatRoom'
import './login.css'
import $ from 'jquery'

let user = {
  name: "temp",
  id: "",
  eventSource: null
}
//let host = "http://www.88858.it:3001"
let host = "http://192.168.1.4:3001"

function App(){
  const [state, setState] = useState("login");
  const [History, setHistory] = useState(null)

  function handleLogin(){
    setState("room");
    user.name = document.getElementById("Nickname").value;
    user.id = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    user.eventSource = new EventSource(host+"/listen?id="+user.id+"&name="+user.name);
    user.eventSource.onmessage = (e) => {
      updateHistory();
      //setHistory(...History.slice(), event.data)
    };
    user.eventSource.onerror = (e) =>{
      console.log(e);
    }
    updateHistory();
  }

  function handleSend(mes){
    //post
    fetch(host+"/insert?id="+mes.id+"&user="+mes.user+"&input="+mes.input)
      .then(() => updateHistory())
  }

  function updateHistory(){
    fetch(host+"/history")
      .then(res => res.json())
      .then(res => {setHistory(res)})
  }

  if(state === "login")
    return <Login onLogin={handleLogin}/>
  else{
    return <ChatRoom user={user} data={History} onSend={handleSend} />;
  }
}

function Login({onLogin}){
  return (
    <div className="loginContainer">
      <h2>Accesso</h2>
        <label>Insersci tuo Nickname:</label>
        <input type="text" id="Nickname" name="Nickname" onKeyDown={(e) => enter(e)} required />
        <input type="button" value="Login" id="sendlogin" onClick={() => onLogin()} />
  </div>
  )
}

function enter(e) {
  if(e.key === "Enter")
      $('#sendlogin').trigger("click")
}

export default App;
