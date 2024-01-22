import React, {useEffect, useRef, useState} from 'react';
import './ContextMenu.css'

const ContextMenu = ({onContextLeave, x, y, options,...props}) => {


    const position = {
        transform: `translate(${x-10}px, ${y-10}px)`
    }
    useEffect(() => {

    }, [])

    const context = useRef(null)
    const closeContext = function() {
        context.current.classList.add('closed')
        context.current.addEventListener('animationend', () => {
            onContextLeave()
        })
    }

    return (
        <div ref={context} onMouseLeave={() => {
            closeContext()
        }} style={position}  className={'context'} {...props}>
            {options.map(opt => <button onClick={() => {opt.action(); closeContext()}}>{opt.name}</button>) }
        </div>
    );
};

export default ContextMenu;