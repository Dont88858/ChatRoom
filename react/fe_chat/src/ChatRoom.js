import $ from 'jquery'
import './ChatRoom.css'

function ChatRoom(props){
    return (
        <div className="chatRoom-container">
            <input type="button" className="logout-btn" onClick={() => {props.user.eventSource.close(); window.location.reload()}} value="Logout" />
            <div className="welcome">Welcome, {props.user.name}</div>
            <h2>Chatroom</h2>
            <div id="chat-messages">
                <Chat user={props.user} data={props.data}/>
            </div>
            <div className="input-container">
                <input type="text" id="input" placeholder="Inserisci il tuo messaggio" onKeyDown={(e) => enter(e)} />
                <input type="button" value="send" id="send" onClick={() => {props.onSend({id: props.user.id, user: props.user.name, input: $("#input").val()}); $("#input").val("")}} />
            </div>
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
                    <span className="user">{" :"+mes.username}</span>
                </div>)
        }else{
            return (
                <div key={i} className="message-container other-message">
                    <span className="user">{mes.username+": "}</span>
                    <span className="message">{mes.said}</span>
                    <span style={{float: "right"}} className="timestamp">{new Date(mes.data).getHours().toString().padStart(2, '0')+":"+new Date(mes.data).getMinutes().toString().padStart(2, '0')}</span>
                </div>)
        }
    })
}

function enter(e) {
    if(e.key === "Enter")
        $('#send').trigger("click")
}

export default ChatRoom;