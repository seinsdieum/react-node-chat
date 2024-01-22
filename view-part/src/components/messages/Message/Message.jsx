import React from 'react';
import './Message.css'

const Message = ({connectionId, userName,upperMessage, lastMessage, currentId, message, ...props}) => {
    return (
        <div {...props}
             className={`message ${currentId ? (currentId === connectionId ? 'user' : 'anonymous') : ''} ${lastMessage ? 'last__message' : ''} ${upperMessage ? 'upper__message' : ''}`}>
            {currentId === 0 ? '' : <p>{userName}</p>}
            <div>
                {props.children}
            </div>
            {
                props.reaction === 'n'
                    ? ''
                    : <p className={'message__reaction'}>{props.reaction}</p>
            }
        </div>
    );
};

export default Message;