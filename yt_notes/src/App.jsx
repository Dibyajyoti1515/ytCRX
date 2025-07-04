import './App.css';
import Notepad from './Notepad';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography } from '@mui/material';

function App() {
  const [googleData, setGoogleData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  // Meta tag data
  const metaTags = {
    title: "YouTube NoteMaker - Take notes from YouTube videos",
    description: "Create notes from YouTube videos easily with our YouTube NoteMaker tool. Perfect for students and professionals.",
    keywords: "YouTube, notes, note-taking, video, YouTube videos, educational",
    author: "Dibya",
  };

  // Adding meta tags dynamically
  useEffect(() => {
    // Add meta tags when the component mounts
    const metaTitle = document.createElement("meta");
    metaTitle.setAttribute("name", "title");
    metaTitle.setAttribute("content", metaTags.title);
    document.head.appendChild(metaTitle);

    const metaDescription = document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    metaDescription.setAttribute("content", metaTags.description);
    document.head.appendChild(metaDescription);

    const metaKeywords = document.createElement("meta");
    metaKeywords.setAttribute("name", "keywords");
    metaKeywords.setAttribute("content", metaTags.keywords);
    document.head.appendChild(metaKeywords);

    const metaAuthor = document.createElement("meta");
    metaAuthor.setAttribute("name", "author");
    metaAuthor.setAttribute("content", metaTags.author);
    document.head.appendChild(metaAuthor);

    // Clean up: Remove meta tags when the component unmounts
    return () => {
      document.head.removeChild(metaTitle);
      document.head.removeChild(metaDescription);
      document.head.removeChild(metaKeywords);
      document.head.removeChild(metaAuthor);
    };
  }, [metaTags]);
  
  useEffect(() => {
    axios.get('https://stream2notes-backend.onrender.com/ytnotes/auto-login', { 
        withCredentials: true 
    })
    .then(response => {
        setGoogleData(response.data);
        setIsLoggedIn(true);
        console.log("Auto-login response:", response.data);
        setUserId(response.data.user.id);
        
    })
    .catch(() => {
      console.log("Auto-login failed.");
    });
  }, []);

  const handleClose = () => {
    const container = document.getElementById("ytnotes-container");
    if (container) {
      container.remove();
      console.log("YTNotes container removed.");
    }
  };

  return (
    <div className="askify-container">
      <div className="login_info">
      <Typography 
      sx={{
        color: 'white',
        fontSize: '14px',
        backgroundColor: isLoggedIn ? '#4CAF50' : '#f44336',
        padding: '5px 10px',
        borderRadius: '5px',
        textAlign: 'center',
      }}>
        {isLoggedIn ? <p>{googleData.user.email}</p> : <p className='notLoginsetup'><button><a href="https://youtubenotemaker.vercel.app/">Login to your google account</a></button></p>}
      </Typography>
      </div>
      <div className="header">
        <button id="inject-btn">Open Note</button>
        <h1>Youtube NoteMaker</h1>
        <button onClick={handleClose} className='close-btn'>✕</button>
      </div>
      <br />
      <div className="notes_tem">
        <Notepad userId={userId} />
      </div>
    </div>
  );
}

export default App;
