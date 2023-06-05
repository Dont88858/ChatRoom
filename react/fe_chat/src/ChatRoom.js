import $ from 'jquery'
import './ChatRoom.css'
import {useRef, useEffect} from 'react'
import * as utility from './utility'

let roomHeight = 450;

function ChatRoom(props){
    const chatRef = useRef(null);
    const scrollY = useRef(true);
    const inputRef = useRef(null);
    
    useEffect(() => {
        scrollBottom();
    }, [props.data])

    useEffect(() => {
        if(inputRef.current)
            inputRef.current.focus();
    }, [])

    function scrollBottom(){
        if(chatRef.current){
            if(scrollY.current)
                chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }

    function oldScrollY(){
        scrollY.current = (chatRef.current.scrollTop + roomHeight) === chatRef.current.scrollHeight;
    }

    return (
        <div className="chatRoom-container">
            <div className="popup" id="popup"></div>
            <input type="button" className="logout-btn" onClick={() => {if(props.user.eventSource) props.user.eventSource.close(); window.location.reload()}} value="Logout" />
            <div className="welcome">Welcome, {props.user.name}</div>
            <h2>Chatroom</h2>
            <div className="chat-messages" ref={chatRef} onScroll={oldScrollY} style={{height: roomHeight+"px"}}>
                <Chat user={props.user} data={props.data}/>
            </div>
            <div className="input-container">
                <input type="text" id="input" ref={inputRef} placeholder="Inserisci il tuo messaggio" onKeyDown={(e) => enter(e)} />
                <input type="button" value="Send" id="send" onClick={() => {props.onSend({id: props.user.id, user: props.user.name, input: $("#input").val()}); $("#input").val(""); if(inputRef.current) inputRef.current.focus();}} />
            </div>
      </div>
    )
}

function Chat(props){
    if (props.data === null) return
    return props.data.map((mes, i) => {
        if(props.user.name === mes.username){
            return (
                <div key={i} className="message-container own-message">
                    <span style={{float: "left"}} className="timestamp">{new Date(mes.data).getHours().toString().padStart(2, '0')+":"+new Date(mes.data).getMinutes().toString().padStart(2, '0')}</span>
                    <span className="message">{mes.said}</span>
                    <span className="user">{" :"+mes.username}</span>
                </div>)
        }else{
            return (
                <div key={i} className="message-container other-message">
                    <span className="user">{mes.username+": "}</span>
                    <span className="message">{mes.said}</span>
                    <span style={{float: "right"}} className="timestamp">{utility.TimeString(mes.data)}</span>
                </div>)
        }
    })
}

function enter(e) {
    if(e.key === "Enter")
        $('#send').trigger("click")
}

export default ChatRoom;