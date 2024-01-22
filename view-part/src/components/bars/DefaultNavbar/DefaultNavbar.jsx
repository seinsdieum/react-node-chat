import React from 'react';
import styles from './DefaultNavbar.css'
const DefaultNavbar = ({...props}) => {
    return (
        <form onSubmit={e => e.preventDefault()} className={'default__navbar'} {...props}>

        </form>
    );
};

export default DefaultNavbar;