import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './Chat.css';

const socket = io('http://localhost:3001');

function Chat() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    // Socket event listeners
    socket.on('receive_message', (data) => {
      setChat((prev) => [...prev, data]);
    });

    socket.on('users_count', (count) => {
      setOnlineUsers(count);
    });

    return () => {
      socket.off('receive_message');
      socket.off('users_count');
    };
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogin = () => {
    if (username.trim() !== '') {
      setLoggedIn(true);
    }
  };

  const sendMessage = () => {
    if (message.trim() === '') return;
    const msgData = { user: username, message };
    socket.emit('send_message', msgData);
    setChat((prev) => [...prev, msgData]);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    socket.disconnect();
    navigate('/');
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <h2>💬 ChitChats</h2>
          <div className="header-info">
            <span className="online-count">{onlineUsers} online</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>

        {!loggedIn ? (
          <div className="username-form">
            <h3>Enter your name to join the chat</h3>
            <div className="input-row">
              <input
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="username-input"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button onClick={handleLogin} className="join-btn">
                Join Chat
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="chat-messages">
              {chat.length === 0 ? (
                <div className="welcome-msg">
                  <h3>Welcome {username}! 👋</h3>
                  <p>Start a conversation by sending your first message</p>
                </div>
              ) : (
                chat.map((msg, index) => (
                  <div key={index} className={`message ${msg.user === username ? 'own' : ''}`}>
                    <strong>{msg.user}:</strong> {msg.message}
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="message-input-container">
              <input
                type="text"
                value={message}
                placeholder="Type a message..."
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="message-input"
              />
              <button onClick={sendMessage} className="send-btn">
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;
