import './App.css';
import React from 'react';
import {useState} from 'react';
import ChatRoom from './ChatRoom'
import './login.css'
import $ from 'jquery'

let name = "temp";
let eventSource;

function App(){
  const [state, setState] = useState("login");
  const [History, setHistory] = useState(null)

  function handleLogin(){
    setState("room");
    name = document.getElementById("Nickname").value;
    eventSource = new EventSource("http://192.168.40.135:3001/listen?name="+name);
    eventSource.onmessage = (event) => {
      updateHistory();
      //setHistory(...History.slice(), event.data)
    };
    eventSource.onerror = (e) =>{
      console.log(e);
    }
    updateHistory();
  }

  function handleSend(user, input){
    fetch("http://192.168.40.135:3001/insert?user="+user+"&input="+input)
      .then(() => updateHistory())
  }

  function updateHistory(){
    fetch("http://192.168.40.135:3001/history")
      .then(res => res.json())
      .then(res => {setHistory(res)})
  }

  if(state === "login")
    return <Login onLogin={handleLogin}/>
  else{
    return <ChatRoom user={name} data={History} onSend={handleSend}/>;
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
function enter (e) {
  if(e.key === "Enter")
      $('#sendlogin').trigger("click")
}

export default App;
