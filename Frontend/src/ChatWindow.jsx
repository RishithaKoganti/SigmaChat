import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useRef } from "react";
import { BounceLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { v1 as uuidv1 } from "uuid";

function ChatWindow() {
  const { 
    prompt, setPrompt, 
    currThreadId, setCurrThreadId,
    messages, setMessages,
    theme, setTheme,
    user, setUser,
    token, setToken,
    setNewChat, newChat,
    setPrevChats,
    isTyping, setIsTyping
  } = useContext(MyContext);
  
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  const getReply = async () => {
    if (!prompt.trim()) return;

    abortControllerRef.current = new AbortController();
    const currentPrompt = prompt;
    setPrompt("");
    setMessages(prev => [...prev, { role: "user", content: currentPrompt }]);
    
    // Immediately show thread in sidebar if it's new
    if (newChat) {
      setPrevChats(prev => [{ threadId: currThreadId, title: currentPrompt }, ...prev]);
      setNewChat(false);
    }
    
    setLoading(true);

    const options = {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ message: currentPrompt, threadId: currThreadId }),
      signal: abortControllerRef.current.signal
    };

    try {
      const response = await fetch("http://localhost:3001/api/chat", options);
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Error: No response from assistant" }]);
    } catch (error) {
       console.log("Fetch error or abort:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    setLoading(false);
    setIsTyping(false);
  };

  const handleNewChat = () => {
    setCurrThreadId(uuidv1());
    setMessages([]);
    setNewChat(true);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <div className="chatWindow">
      <div className="navbar">
        <span onClick={handleNewChat} style={{ cursor: 'pointer' }} title="New Chat">
          SigmaChat <i className="fa-solid fa-chevron-down"></i>
        </span>

        <div className="userIconDiv" style={{ position: 'relative' }}>
          <span className="userIcon" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: 'pointer' }}>
            {user ? <i className="fa-solid fa-user"></i> : <i className="fa-solid fa-robot"></i>}
          </span>
          
          {dropdownOpen && (
            <div className="dropdownMenu">
              <div className="dropdownItem" onClick={toggleTheme}>
                 {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </div>
              <div className="dropdownItem" onClick={handleLogout}>
                 Logout
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chatWrapper">
        <Chat />
        {(loading || isTyping) && (
          <div className="loaderContainer" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px'}}>
            {loading && <BounceLoader color="var(--text-color)" size={40} />}
            <div className="stopBtn" onClick={handleStop} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-color)', border: '1px solid var(--border-color)', padding: '5px 15px', borderRadius: '15px', backgroundColor: 'var(--sidebar-bg)'}}>
                <i className="fa-regular fa-circle-stop"></i> Stop generating
            </div>
          </div>
        )}
      </div>

      <div className="chatInput">
        <div className="userInput">
          <input
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading && !isTyping) getReply();
            }}
          />
          <div className="submit" onClick={() => (loading || isTyping) ? handleStop() : getReply()} style={{cursor: 'pointer'}}>
            {(loading || isTyping) ? <i className="fa-solid fa-stop"></i> : <i className="fa-solid fa-paper-plane"></i>}
          </div>
        </div>
        <p className="info">
          SigmaChat can make mistakes. Check important info. See Cookie Preferences.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;