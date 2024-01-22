import React, {useRef} from 'react';
import './UserInfo.css';
import NavigationClose from "../../buttons/NavigationButtons/NavigationClose/NavigationClose";
import WindowBar from "../../bars/WindowBar/WindowBar";
const UserInfo = ({...props}) => {

    function closeInfo() {
        cover.current.classList.add('closing')
        cover.current.addEventListener('animationend', () => {
            props.onClose()
        })
    }

    const cover = useRef(null)

    return (
        <div ref={cover} className={'user__cover'}>
            <div className={'user__window'}>
                <WindowBar>
                    <NavigationClose onClick={closeInfo}>Закрыть</NavigationClose>
                </WindowBar>
                <h1>{props.userData.name} ({props.userData.id})</h1>
            </div>
        </div>
    );
};

export default UserInfo;