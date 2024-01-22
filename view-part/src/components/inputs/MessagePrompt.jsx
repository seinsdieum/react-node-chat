import React from 'react';
import styles from './MessagePrompt.css'
const MessagePrompt = ({...props}) => {
    return (
        <input className={'message__prompt'} {...props}>

        </input>
    );
};

export default MessagePrompt;