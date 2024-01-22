import React from 'react';
import styles from './DefaultButton.css'
const DefaultButton = ({...props}) => {
    return (
        <button className={'default__button'} {...props}>

        </button>
    );
};

export default DefaultButton;