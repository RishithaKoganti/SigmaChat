import "./Chat.css";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Typewriter = ({ text, delay = 5 }) => {
    const { isTyping, setIsTyping } = useContext(MyContext);
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Initial mount hook
    useEffect(() => {
        setIsTyping(true);
        return () => setIsTyping(false);
    }, []);

    // Main typewriter interval
    useEffect(() => {
        if (!isTyping) {
            // User interrupted, fast-forward to end
            setCurrentText(text);
            setCurrentIndex(text.length);
            return;
        }

        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText(prevText => prevText + text[currentIndex]);
                setCurrentIndex(prevIndex => prevIndex + 1);
            }, delay);
            return () => clearTimeout(timeout);
        } else {
            setIsTyping(false);
        }
    }, [currentIndex, delay, text, isTyping, setIsTyping]);

    // Fast-forward to the end if the text abruptly changes completely
    useEffect(() => {
        if (!text.startsWith(currentText)) {
            setCurrentText(text);
            setCurrentIndex(text.length);
        }
    }, [text]);

    return <ReactMarkdown components={markdownComponents}>{currentText}</ReactMarkdown>;
};

const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        const codeContent = String(children).replace(/\n$/, '');
        
        const copyToClipboard = () => {
            navigator.clipboard.writeText(codeContent);
            alert("Copied to clipboard!");
        };

        return !inline && match ? (
            <div className="codeBlockWrapper">
                <div className="codeHeader">
                    <span className="codeLang">{match[1]}</span>
                    <button className="copyBtn" onClick={copyToClipboard} title="Copy code">
                        <i className="fa-regular fa-copy"></i> Copy
                    </button>
                </div>
                <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                >
                    {codeContent}
                </SyntaxHighlighter>
            </div>
        ) : (
            <code className={className} {...props}>
                {children}
            </code>
        );
    }
};

function Chat() {
    const { newChat, messages } = useContext(MyContext);

    return (
        <div className="chatsContainer">
            {newChat && <h1>Start a new Chat</h1>}
            <div className="chats">
                {messages && messages.map((msg, index) => {
                    const isLastAssistantMessage = index === messages.length - 1 && msg.role === "assistant" && !msg.isHistory;
                    
                    return (
                        <div key={index} className={msg.role === "user" ? "userDiv" : "gptDiv"}>
                            <div className={msg.role === "user" ? "userMessage" : "gptMessage"}>
                                {msg.role === "user" ? (
                                    <p>{msg.content}</p>
                                ) : isLastAssistantMessage ? (
                                    <Typewriter text={msg.content} />
                                ) : (
                                    <ReactMarkdown components={markdownComponents}>
                                        {msg.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default Chat;