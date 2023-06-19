import './App.css';
import React, { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatRoom from './ChatRoom'
import './login.css'
import $ from 'jquery'
let user = {
  name: "temp",
  id: "",
  eventSource: null,
  imgName: ""
}

//export let host = "http://localhost:3001"
export let host = "https://www.88858.it/chat"

export default function App(){
  if (!sessionStorage.getItem("username")){
    sessionStorage.clear();
    window.location.href = "/"
  }
  const [History, setHistory] = useState(null);
  const [Users, setUsers] = useState(null);
  user.name = sessionStorage.getItem("username");
  user.id = sessionStorage.getItem("userid");

  useEffect(() => {
    if (sessionStorage.getItem("userid")){
      user.eventSource = new EventSource(host+"/listen?id="+user.id+"&name="+user.name);
      sessionStorage.setItem("eventSource", user.eventSource);
      user.eventSource.onopen = (e) =>{
        if (e !== null && e.data !== undefined){
          user.imgName = JSON.parse(e.data).img;
          sessionStorage.setItem("imgName", user.imgName);
        }
      }
      
      user.eventSource.onmessage = (e) => {
        let json = JSON.parse(e.data)
        if (json.type === "messaggio"){
          let newMes = {
            userid: json.userid,
            username: json.username,
            said: json.said,
            data: json.data,
            imgName: json.imgName
          }
          setHistory(prev => {return [...prev, newMes]})
          notify(newMes);
        }else if (json.type === "user"){
          setUsers(json.inRoom);
        }
      };
      
      updateHistory();
    }
  }, [])

  function handleSend(mes){
    if(!mes.input){
      toast.warning('Messaggio non può essere vuoto!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000
      });
      return
    }

    let messaggio = {
      userid: mes.id,
      username: mes.user,
      said: mes.input.replace("\\n", "\n"),
      data: new Date(),
      imgName: user.imgName
    }
    
    fetch(host+"/insert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messaggio)
    }).then((res) => {
      if (res.status === 500){
        toast.error('Avuto un problema sul server, il messaggio non è stato inviato!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 7000
        });
      }else
        setHistory(prev => {return [...prev, messaggio]})
    });
  }

  function updateHistory(){
    fetch(host+"/history")
      .then(res => res.json())
      .then(res => {setHistory(res)})
  }

  function handleLogout(user){
    return fetch(host+"/logout", {
      method: "POST",
      headers: { 'Connection': 'close', "Content-Type": "application/json"},
      body: JSON.stringify({id: user.id, name: user.name}),
      keepalive: true
    })
  }

  if (sessionStorage.getItem("userid")){
    return <ChatRoom user={user} data={History} onSend={handleSend} usersList={Users} onLogout={handleLogout} />;
  }else
    return
}

export function Login(){

  const NicknameRef = useRef(null);

  function handleLogin(){
    user.name = NicknameRef.current.value
    if(!user.name){
      toast.warning('Nickname non può essere vuoto!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000
      });
      if(NicknameRef.current)
        NicknameRef.current.focus();
      return
    }else if(/[/"'{}$\\]/.test(user.name)){
      toast.warning('Nickname contiene carattere non valido!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000
      });
      if(NicknameRef.current)
        NicknameRef.current.focus();
      return
    }else if("null" === user.name){
      toast.warning('Non puoi utilizzare nome "null"', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000
      });
      if(NicknameRef.current)
        NicknameRef.current.focus();
      return
    }
    user.id = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    sessionStorage.setItem("username", user.name);
    sessionStorage.setItem("userid", user.id);
    window.location.href = "/ChatRoom"
  }

  useEffect(() => {
    if(NicknameRef.current){
      NicknameRef.current.focus();
    }
  }, [])

  return (
    <div className="loginContainer">
      <h2>Accesso</h2>
      <label>Insersci tuo Nickname:</label>
      <div className="popup" id="popup"></div>
      <input type="text" id="Nickname" name="Nickname" ref={NicknameRef} onKeyDown={(e) => enter(e)} required />
      <input type="button" value="Login" id="sendlogin" onClick={handleLogin} />
      <ToastContainer />
    </div>
  )
}

function enter(e) {
  if(e.key === "Enter")
      $('#sendlogin').trigger("click")
}

let focus = true;
window.onblur = () => {
  focus = false;
};

window.onfocus = function () {
  focus = true;
};

function notify(Mes){
  if(!focus){
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        
        if (permission === "granted") {
          var notification = new Notification(Mes.username, {
            body:  Mes.said,
            icon: "/cat/" + Mes.imgName
          });
    
          notification.onclick = () => {
            window.focus();
          };
  
          setTimeout(() => {
            notification.close();
          }, 5000);
        }
      });
    }
  }
}