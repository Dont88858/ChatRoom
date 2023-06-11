import $ from 'jquery'
import './ChatRoom.css'
import {useRef, useEffect} from 'react'
import * as utility from './utility'
import { ToastContainer} from 'react-toastify';
import { host } from './App'

let roomHeight = 480;

export default function ChatRoom(props){
    const chatRef = useRef(null);
    const scrollY = useRef(true);
    const inputRef = useRef(null);
    const logoutHandle = useRef(() => {
        if(props.user.eventSource) {
            $.ajax({
                async: false,
                url: host+"/logout",
                method: "POST",
                headers: { 'Connection': 'close', "Content-Type": "application/json"},
                data: JSON.stringify({id: props.user.id, name: props.user.name}),
                keepalive: true
            })
            props.user.eventSource.close();
            props.user.eventSource = null;
            sessionStorage.clear();
        }
    })
    
    useEffect(() => {
        scrollBottom();
    }, [props.data])

    function scrollBottom(){
        if(chatRef.current){
            if(scrollY.current)
                chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }    
    
    function oldScrollY(){
        //per qualche browser che ha una differenza più o meno di 1 //sopratutto Chrome!!!!
        scrollY.current = Math.abs((chatRef.current.scrollTop + roomHeight) - chatRef.current.scrollHeight) < 1;
    }

    useEffect(() => {
        let foo = () => logoutHandle.current();
        window.addEventListener("beforeunload", foo)
        if(inputRef.current)
            inputRef.current.focus();
        return () => {
            window.removeEventListener("beforeunload", foo)
        }
    }, [])

    return (
        <div className="chatRoom-container">
            <div className="popup" id="popup"></div>
            <input type="button" className="logout-btn" onClick={() => {if(props.user.eventSource) {
                        props.onLogout(props.user)
                            .then(() => {
                                props.user.eventSource.close();
                                props.user.eventSource = null;
                                sessionStorage.clear();
                                window.location.href = "/"
                            })
                    }
                }
            } value="Logout" />
            <div className="welcome">Welcome, {props.user.name}</div>
            <h2>Chatroom</h2>
            <div className="chat-messages" ref={chatRef} onScroll={oldScrollY} style={{height: roomHeight+"px"}}>
                <Chat user={props.user} data={props.data}/>
            </div>
            <div className="input-container">
                <input type="text" id="input" ref={inputRef} placeholder="Inserisci il tuo messaggio" onKeyDown={(e) => enter(e)} />
                <label className="custom-file-upload">
                    <input id="file-upload" type="file" name="image" size="50" />
                    <img src="/file_log.png" width="20" height="20" alt="file" />
                </label>
                <input type="button" value="Send" id="send" onClick={() => {props.onSend({type: "messaggio", id: props.user.id, user: props.user.name, input: $("#input").val()}); $("#input").val(""); if(inputRef.current) inputRef.current.focus();}} />
            </div>

            <div className="user-list">
                Numero di user in stanza: {(props.usersList === null) ? 0 : props.usersList.length}
                <ul><ListUser usersList={props.usersList}/></ul>
            </div>
            <ToastContainer />
      </div>
    )
}

function Chat(props){
    if (props.data === null) return
    return props.data.map((mes, i) => {
        if(props.user.id === mes.userid){
            return (
                <div key={i} className="message-container own-message">
                    <span style={{float: "left"}} className="timestamp">{new Date(mes.data).getHours().toString().padStart(2, '0')+":"+new Date(mes.data).getMinutes().toString().padStart(2, '0')}</span>
                    <span className="message">{mes.said}</span>
                    <span className="user">Tu</span>
                    <Profilo src={mes.imgName} />
                </div>)
        }else{
            return (
                <div key={i} className="message-container other-message">
                    <Profilo src={mes.imgName} />
                    <span className="user">{mes.username}</span>
                    <span className="message">{mes.said}</span>
                    <span style={{float: "right"}} className="timestamp">{utility.TimeString(mes.data)}</span>
                </div>)
        }
    })
}

function ListUser(props){
    if (props.usersList === null){
        return
    }
    return (
        props.usersList.map((item) => <li key={item.userid}>{item.username}</li>)
    )
}

function Profilo(src){
    if (src.src)
        return (<img src={"/cat/"+src.src} alt="cat" width="40" height="40"></img>)
    else
        return (<img src={"/cat/senza titolo.jpg"} alt="balck" width="40" height="40"></img>)
}

function enter(e) {
    if(e.key === "Enter")
        $('#send').trigger("click")
}