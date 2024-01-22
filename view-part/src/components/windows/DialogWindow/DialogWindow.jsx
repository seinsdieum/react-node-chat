import React, {useEffect, useRef, useState} from 'react';
import './DialogWindow.css'
import Message from "../../messages/Message/Message";

import DefaultButton from "../../buttons/DefaultButton/DefaultButton";
import MessagePrompt from "../../inputs/MessagePrompt";
import DefaultNavbar from "../../bars/DefaultNavbar/DefaultNavbar";
import ContextMenu from "../../inputs/ContextMenu/ContextMenu";
import UserInfo from "../UserInfo/UserInfo";


const DialogWindow = ({...props}) => {

    const [messages, setMessages] = useState([{message: 'Вы подключены'}])
    const [connected, setConnected] = useState(false)
    const [input, setInput] = useState('');
    const [caughtError, setCaughtError] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [isSelfTyping, setSelfTyping] = useState(false)
    const [username, setUsername] = useState('anonymous')
    const [connectionId, setConnectionId] = useState(null)
    const [animate, setAnimate] = useState(false);
    const [messageContextOpened, setMessageContextOpened] = useState(false)
    const [cursor, setCursor] = useState({x: 0, y: 0})
    const [userFocus, setUserFocus] = useState(null)
    const [companionInfo, setCompanionInfo] = useState(null)
    const [reacts, setReacts] = useState([])

    const reactions = []
    let idd = -1

    function changeId(newId) {
        setConnectionId(newId)
        idd = newId;
    }

    const messagesEndRef = useRef(null)

    /*const componentDidMount = () => {
        scrollToBottom()
    }
    const componentDidUpdate = () => {
        scrollToBottom()
    }*/
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
    }

    function toggleAnimate() {
        setAnimate(true)
        setTimeout(() => {
            setAnimate(false)
        }, 200)
    }

    const sendData = () => {

        if (connected) {
            if (!input) return
            if (input.includes('KICKUSR')) {
                kickUser(+input.split(' ')[1])
            } else socket.current.send(JSON.stringify({
                id: connectionId,
                message: input,
                event: 'message',
                name: username
            }))


            setInput('')
        }
    }

    const sendReaction = () => {
        if(connected) {
            socket.current.send(JSON.stringify({
                id: userFocus.id,
                message: userFocus.message,
                event: 'reaction',
                reaction_id: 2
            }))
        }
    }

    function kickUser(id) {
        socket.current.send(JSON.stringify({id: connectionId, message: id, event: 'kick'}))
    }

    const socket = useRef()

    ///et ipAddr = '192.168.100.4' // временная хуета
    let ipAddr = '192.168.100.10' || '192.168.20.81' // временная хуета

    const stopTyping = () => {
        setSelfTyping(false)
        socket.current.send(JSON.stringify({id: connectionId, event: 'message', isTyping: false}))
    }

    function notifyTyping(e) {
        setInput(e.target.value)
        if (!isSelfTyping) {
            setSelfTyping(true)
            socket.current.send(JSON.stringify({id: connectionId, event: 'message', isTyping: true}))
            setTimeout(stopTyping, 3000)
        }
    }

    function changeUsername(e) {
        setUsername(e.target.value)
    }

    function openUserContextMenu(msg) {
        setMessageContextOpened(false)
        setMessageContextOpened(true)

        setUserFocus(msg)
    }

    function connect() {
        socket.current = new WebSocket(ipAddr ? ('ws://' + ipAddr + ':3001') : 'ws://localhost:3001')
        socket.current.onopen = () => {
            setCaughtError(false)
            setConnected(true)
        }

        socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data)

            if(message.event === 'reaction') {

                setReacts(reacts => [ ...reacts, {message: message.message, reaction: message.reaction}])
                console.log(reacts)
                return;
            }

            if (message.event === 'identifying') {
                changeId(message.id)
            } else if (message.event === 'connection') {
                socket.current.send(JSON.stringify({id: 0, message: (message.id + ' зашел в чат'), event: 'message'}))
            } else if (message.event === 'disconnection') {
                socket.current.send(JSON.stringify({id: 0, message: (message.id + ' вышел из чата'), event: 'message'}))
            } else if (message.event === 'kick' && message.message === idd) {
                // eslint-disable-next-line no-restricted-globals
                location.replace('')
            }
            if ((typeof message.isTyping !== 'boolean' && message.event === 'message')) {
                setMessages(prev => [...prev, message])
                setIsTyping(false)
                toggleAnimate()
            } else if (!message.isTyping) {
                setIsTyping(false)
            } else if (message.isTyping && message.id !== idd) {
                setIsTyping(true)
            }
        }

        socket.current.onclose = () => {
            socket.current.close()
            setConnected(false)
        }

        socket.current.onerror = () => {
            socket.current.close()
            setCaughtError(true)
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    if (!connected) {

        return (
            <div>
                {caughtError ? <h1>Ошибка соеднения</h1> : <h1>Вы не подключены</h1>}
                <DefaultButton onClick={connect}>Найти чат</DefaultButton>
            </div>
        );
    }

    return (
        <div>

            {
                companionInfo ?
                    <UserInfo onClose={() => setCompanionInfo(null)} userData={companionInfo}></UserInfo> : ''
            }

            {
                messageContextOpened
                    ? <ContextMenu
                        onContextLeave={() => {
                            setMessageContextOpened(false)
                        }}
                        x={cursor.x}
                        y={cursor.y}
                        options={[
                            {name: 'Kick user', action: () => kickUser(userFocus.id)},
                            {name: 'Show profile', action: () => setCompanionInfo({name: userFocus.name, id: userFocus.id})},
                            {name: 'Send reaction', action: () => sendReaction()}
                        ]}>
                    </ContextMenu>
                    : ''
            }
            <div {...props} className={'dialog__window'}>
                {messages ? messages.map((msg, index) => <Message
                    lastMessage={(index === messages.length - 1) && (animate)}
                    connectionId={connectionId}
                    key={msg.message + msg.id + Math.random()}
                    userName={msg.name}
                    onContextMenu={e => {
                        e.preventDefault()
                        openUserContextMenu(msg)
                        setCursor({x: e.pageX, y: e.pageY})
                    }
                    }
                    reaction={reacts.find((rec) => msg.message === rec.message)?.reaction || msg.reaction || 'n'}
                    onMouseDown={() => {setUserFocus(msg)}}
                    currentId={msg.id}>{msg.message}</Message>) : 'Подключение...'}
                {isTyping ? <Message upperMessage={true}>Печатает...</Message> : ''}
                <div ref={messagesEndRef}/>
            </div>
            <DefaultNavbar>
                <MessagePrompt value={input} onChange={(e) => notifyTyping(e)}>

                </MessagePrompt>
                <DefaultButton onClick={sendData}>
                    Отправить
                </DefaultButton>
            </DefaultNavbar>

        </div>
    );
};

export default DialogWindow;