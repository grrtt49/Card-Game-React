

export default function Message(props) {

    return (
        <div className={'chat-message from-' + (props.isOther ? "other" : "self")}>
            <div className='message-label'>{props.from}</div>
            <div className='message'>{props.text}</div>
        </div>
    );
}