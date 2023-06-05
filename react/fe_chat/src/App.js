import './App.css';
import React, { useEffect } from 'react';
import {useState, useRef} from 'react';
import ChatRoom from './ChatRoom'
import * as utility from './utility'
import './login.css'
import $ from 'jquery'

let user = {
  name: "temp",
  id: "",
  eventSource: null
}
let host = "http://192.168.40.135:3001"
//let host = "http://www.88858.it:3001"

function App(){
  const [state, setState] = useState("login");
  const [History, setHistory] = useState(null);
  const [Users, setUsers] = useState(null);
  const NicknameRef = useRef(null);

  function handleLogin(){
    user.name = $("#Nickname").val();
    if(!user.name){
      utility.showPopup("Nickname non può essere vuoto", 3000)
      if(NicknameRef.current)
        NicknameRef.current.focus();
      return
    }else if(/[/"'{}$\\]/.test(user.name)){
      utility.showPopup("Nickname contiene carattere non valido", 3000)
      if(NicknameRef.current)
        NicknameRef.current.focus();
      return
    }

    setState("room");
    user.id = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    user.eventSource = new EventSource(host+"/listen?id="+user.id+"&name="+user.name);
    user.eventSource.onmessage = (e) => {
      let json = JSON.parse(e.data)
      if (json.type === "messaggio"){
        let newMes = {
          userid: json.userid,
          username: json.username,
          said: json.said,
          data: json.data
        }
        setHistory(prev => {return [...prev, newMes]})
      }else if (json.type === "user"){
        setUsers(json.inRoom);
      }
    };

    user.eventSource.onerror = (e) =>{
      console.log(e);
    }
    
    updateHistory();
  }

  function handleSend(mes){
    if(!mes.input){
      utility.showPopup("Messaggio non può essere vuoto", 3000);
      return
    }
    let messaggio = {
      userid: mes.id,
      username: mes.user,
      said: mes.input,
      data: new Date()
    }
    
    fetch(host+"/insert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messaggio)
    }).then((res) => {
      if (res.status === 500){
        utility.showPopup("Avuto un problema sul server, il messaggio non è stato inviato", 7000);
      }else
        setHistory(prev => {return [...prev, messaggio]})
    });
  }

  function updateHistory(){
    fetch(host+"/history")
      .then(res => res.json())
      .then(res => {setHistory(res)})
  }

  useEffect(() => {
    if(NicknameRef.current)
      NicknameRef.current.focus()
  }, [])

  if(state === "login")
    return <Login onLogin={handleLogin} />
  else{
    return <ChatRoom user={user} data={History} onSend={handleSend} usersList={Users} />;
  }

  function Login({onLogin}){
    return (
      <div className="loginContainer">
        <h2>Accesso</h2>
        <label>Insersci tuo Nickname:</label>
        <div className="popup" id="popup"></div>
        <input type="text" id="Nickname" name="Nickname" ref={NicknameRef} onKeyDown={(e) => enter(e)} required />
        <input type="button" value="Login" id="sendlogin" onClick={() => onLogin()} />
      </div>
    )
  }
}

export default App;

function enter(e) {
  if(e.key === "Enter")
      $('#sendlogin').trigger("click")
}
