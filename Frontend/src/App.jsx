import './App.css'
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { MyContext } from "./MyContext";
import { useState, useEffect } from 'react';
import { v1 as uuidv1 } from "uuid";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./Login";
import Signup from "./Signup";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);

  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load user from localstorage on mount
  useEffect(() => {
    if (token) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) setUser(storedUser);
      } catch (e) {
        console.error(e);
      }
    }
  }, [token]);

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    theme, setTheme,
    user, setUser,
    token, setToken,
    messages, setMessages,
    isTyping, setIsTyping
  };

  return (
    <Router>
      <MyContext.Provider value={providerValues}>
        <div className='app'>
          <Routes>
            <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/" />} />
            <Route path="/" element={
              token ? (
                <>
                  <Sidebar />
                  <ChatWindow />
                </>
              ) : (
                <Navigate to="/login" />
              )
            } />
          </Routes>
        </div>
      </MyContext.Provider>
    </Router>
  )
}

export default App