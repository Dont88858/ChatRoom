import $ from 'jquery'
import './ChatRoom.css'

function ChatRoom(props){
    return (
        <div className="container">
            <h2>Chatroom</h2>
            <div id="chat-messages">
                <Chat data={props.data} user={props.user} />
            </div>
            <div className="input-container">
                <input type="text" id="input" placeholder="Inserisci il tuo messaggio" onKeyDown={(e) => enter(e)} />
                <input type="button" value="send" id="send" onClick={() => {props.onSend(props.user, $("#input").val()); $("#input").val("")}} />
            </div>
      </div>
    )
}

function Chat(props){
    if (props.data === null) return
    return props.data.map((data, i) => {
        if(data.user === props.user){
            return (
                <div key={i} className="message-container">
                    <span style={{float: "left"}} className="timestamp">{new Date(data.data).getHours()+":"+new Date(data.data).getMinutes()}</span>
                    <span style={{float: "right"}} className="user">{" :"+data.user}</span>
                    <span style={{float: "right"}} className="message">{data.said}</span>
                </div>)
        }else{
            return (
                <div key={i} className="message-container">
                    <span className="user">{data.user+": "}</span>
                    <span className="message">{data.said}</span>
                    <span style={{float: "right"}} className="timestamp">{new Date(data.data).getHours()+":"+new Date(data.data).getMinutes()}</span>
                </div>)
        }
    })
}

function enter (e) {
    if(e.key === "Enter")
        $('#send').trigger("click")
}

export default ChatRoom;