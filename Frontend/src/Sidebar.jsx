import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext";
import { v1 as uuidv1 } from "uuid";

function SideBar() {
    const { 
        setCurrThreadId, 
        setNewChat, 
        prevChats, 
        setPrevChats, 
        setMessages,
        user,
        token
    } = useContext(MyContext);

    const [menuOpenId, setMenuOpenId] = useState(null);

    const fetchThreads = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/thread", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if(res.ok) {
                const data = await res.json();
                setPrevChats(data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if(token) fetchThreads();
    }, [token]);

    const loadThread = async (threadId) => {
        try {
            const res = await fetch(`http://localhost:3001/api/thread/${threadId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if(res.ok) {
                const data = await res.json();
                const historyMessages = data.map(msg => ({ ...msg, isHistory: true }));
                setMessages(historyMessages);
                setCurrThreadId(threadId);
                setNewChat(false);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const deleteThread = async (e, threadId) => {
        e.stopPropagation();
        try {
            const res = await fetch(`http://localhost:3001/api/thread/${threadId}`, { 
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            });
            if(res.ok) {
                fetchThreads(); 
                setNewChat(true);
                setMessages([]);
                setCurrThreadId(uuidv1());
                setMenuOpenId(null);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleNewChat = () => {
        setCurrThreadId(uuidv1());
        setMessages([]);
        setNewChat(true);
    };

    const toggleMenu = (e, threadId) => {
        e.stopPropagation();
        setMenuOpenId(menuOpenId === threadId ? null : threadId);
    };

    return (
        <section className="sidebar" onClick={() => setMenuOpenId(null)}>
            <button className="newChatBtn" onClick={handleNewChat}>
                <h4 className="logo">SigmaChat</h4>
                <span><i className="fa-regular fa-pen-to-square"></i></span>
            </button>
            
            <div className="historyWrapper">
                <ul className="history">
                    {prevChats && prevChats.map((thread) => (
                        <li key={thread.threadId} onClick={() => loadThread(thread.threadId)}>
                            <span className="threadTitle">{thread.title || thread.threadId}</span>
                            
                            <div className="threadOptions" style={{position: 'relative'}}>
                                <i 
                                    className="fa-solid fa-ellipsis-vertical optionsIcon" 
                                    onClick={(e) => toggleMenu(e, thread.threadId)}
                                ></i>
                                
                                {menuOpenId === thread.threadId && (
                                    <div className="threadDropdown">
                                        <div className="threadDropdownItem deleteOption" onClick={(e) => deleteThread(e, thread.threadId)}>
                                            <i className="fa-solid fa-trash"></i> Delete
                                        </div>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="sign">
                {user && (
                    <div className="userInfo">
                        <p>{user.name}</p>
                    </div>
                )}
            </div>
        </section>
    );
}
export default SideBar;