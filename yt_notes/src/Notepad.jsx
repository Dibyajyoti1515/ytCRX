import { useRef, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  IconButton,
  MenuItem,
  Menu,
  Paper
} from '@mui/material';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import CircularProgress from '@mui/material/CircularProgress';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import TitleIcon from '@mui/icons-material/Title';
import PaletteIcon from '@mui/icons-material/Palette';
// import { PDFDocument, rgb } from 'pdf-lib';

const Notepad = ({ userId }) => {
  const [title, setTitle] = useState('');
  const [transcriptData, setTranscriptData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [screenshotInterval, setScreenshotInterval] = useState(5); // Default interval is 5 seconds
  const [isScreenshotting, setIsScreenshotting] = useState(false); // Track if screenshots are being taken
  const editorRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const colors = ['black', 'red', 'green', 'blue', 'purple', 'orange'];
  console.log("userId", userId);
  const ytlink = window.location.href;
  console.log(ytlink);
  const [isUploading, setIsUploading] = useState(false);


  const handleColorClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleColorSelect = (color) => {
    document.execCommand('foreColor', false, color);
    setAnchorEl(null);
  };

  const format = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
  };
  
  const handleSave = async () => {

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!userId) {
      alert('Please login to save notes.');
      return;
    }
    

    setIsUploading(true);
  
    const input = editorRef.current;
  
    //Capture screenshot with reduced resolution
    const canvas = await html2canvas(input, {
      scale: 0.7, 
      useCORS: true 
    });
  
    //Convert canvas to compressed JPEG
    const imgData = canvas.toDataURL('image/jpeg', 0.6); // 50% quality
  
    // 📄 Create jsPDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
  
    //Screenshots to be added
    const screenshots = [
      { imgData, width: pdfWidth, height: pdfHeight },
      ...transcriptData
        .filter((item) => item.type === 'image')
        .map((item) => ({ imgData: item.data, width: pdfWidth, height: pdfHeight }))
    ];
  
    //Add 3 images per PDF page
    let y = 10;
    let count = 0;
  
    screenshots.forEach((shot) => {
      if (count === 3) {
        pdf.addPage();
        y = 10;
        count = 0;
      }
  
      pdf.addImage(shot.imgData, 'JPEG', 10, y, pdfWidth - 20, (pdfHeight - 20) / 3);
      y += (pdfHeight - 20) / 3;
      count++;
    });
  
    //Export PDF as a Blob
    const pdfBlob = pdf.output('blob');

    //DOWNLOAD the PDF locally
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(pdfUrl);

    
    if (pdfBlob.size < 20 * 1024 * 1024) {

      //Prepare data for backend
      const formData = new FormData();
      formData.append('file', pdfBlob, `${title}.pdf`);
      formData.append('user_id', userId);
      formData.append('youtube_link', ytlink);
  
      //Send to backend
      try {
        const response = await fetch('https://stream2notes-backend.onrender.com/ytnotes/pdf/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          const result = await response.json();
          alert('PDF uploaded successfully!');
          console.log(result);
        } else {
          const error = await response.json();
          alert('Upload failed: ' + error.message);
        }

      } catch (err) {
        console.error('Error uploading PDF:', err);
        alert('An error occurred while uploading.');
      }

    }
    
    setIsUploading(false);

  };

  
// const handleSave = async () => {
//   if (!title.trim()) {
//     alert('Please enter a title');
//     return;
//   }

//   const input = editorRef.current;

//   // 📸 Capture compressed screenshot
//   const canvas = await html2canvas(input, {
//     scale: 0.6,
//     useCORS: true,
//   });

//   const mainImageData = canvas.toDataURL('image/jpeg', 0.5); // JPEG base64

//   // 🧾 Collect transcript images
//   const images = [
//     mainImageData,
//     ...transcriptData
//       .filter((item) => item.type === 'image')
//       .map((item) => item.data),
//   ];

//   // 📄 Create new PDF document
//   const pdfDoc = await PDFDocument.create();

//   for (const imageData of images) {
//     const page = pdfDoc.addPage();
//     const jpgImage = await pdfDoc.embedJpg(imageData);
//     const { width, height } = jpgImage.scale(0.5); // further scale for compression

//     // Center the image
//     page.drawImage(jpgImage, {
//       x: (page.getWidth() - width) / 2,
//       y: (page.getHeight() - height) / 2,
//       width,
//       height,
//     });
//   }

//   const pdfBytes = await pdfDoc.save();

//   // 📤 Prepare upload
//   const formData = new FormData();
//   const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
//   const pdfFile = new Blob([pdfBytes], { type: 'application/pdf' });

//   formData.append('file', pdfFile, `${cleanTitle}.pdf`);
//   formData.append('user_id', userId);
//   formData.append('youtube_link', ytlink);

//   try {
//     const response = await fetch('https://stream2notes-backend.onrender.com/ytnotes/pdf/upload', {
//       method: 'POST',
//       body: formData,
//     });

//     if (response.ok) {
//       const result = await response.json();
//       alert('✅ PDF uploaded successfully!');
//       console.log(result);
//     } else {
//       const error = await response.json();
//       alert('❌ Upload failed: ' + error.message);
//     }
//   } catch (err) {
//     console.error('Upload error:', err);
//     alert('❌ An error occurred while uploading.');
//   }
// };
  
  

  const fetchTranscript = async () => {
    const videoId = new URL(window.location.href).searchParams.get('v');
    if (!videoId) {
      alert('Video ID not found in URL.');
      return;
    }

    if (!userId) {
      alert('Please login to save notes.');
      return;
    }
    

    setIsLoading(true);

    try {
      const response = await fetch('https://stream2notes-backend.onrender.com/ytnotes/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }

      const data = await response.json();
      setTranscriptData(data.transcript || []);
    } catch (error) {
      console.error('Failed to fetch transcript', error);
      setTranscriptData(['Failed to load transcript. Please try again later.']);
    } finally {
      setIsLoading(false);
    }
  };

  const takeScreenshot = async () => {
    const videoElement = document.querySelector('video'); // Get the video element

    if (videoElement) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL('image/png');

      setTranscriptData((prevData) => [
        ...prevData,
        { type: 'image', data: imgData, time: new Date().toLocaleTimeString() }
      ]);
    } else {
      console.log("No video element found!");
    }
  };

  const startScreenshotting = () => {
    setIsScreenshotting(true);
    const intervalId = setInterval(() => {
      takeScreenshot();
    }, screenshotInterval * 1000); // Interval in milliseconds

    // Store the interval ID to clear it later
    setScreenshotIntervalId(intervalId);
  };

  const stopScreenshotting = () => {
    clearInterval(screenshotIntervalId);
    setIsScreenshotting(false);
  };

  const [screenshotIntervalId, setScreenshotIntervalId] = useState(null); // Store interval ID

  return (
    <Box
      sx={{
        maxWidth: '900px',
        mx: 'auto',
        mt: 4,
        p: 3,
        borderRadius: 2,
        margin: '0 auto',
        backgroundColor: 'transparent'
      }}
    >

      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', margin: 0, padding: 0 }}>
        Notepad
      </Typography>

      <TextField
        fullWidth
        label="Note Title"
        variant="outlined"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Button startIcon={<TitleIcon />} onClick={() => format('formatBlock', 'H1')}>
          H1
        </Button>
        <Button onClick={() => format('formatBlock', 'H2')}>H2</Button>
        <IconButton onClick={() => format('bold')}>
          <FormatBoldIcon />
        </IconButton>
        <IconButton onClick={() => format('italic')}>
          <FormatItalicIcon />
        </IconButton>
        <IconButton onClick={() => format('underline')}>
          <FormatUnderlinedIcon />
        </IconButton>
        <IconButton onClick={handleColorClick}>
          <PaletteIcon />
        </IconButton>
        <Button variant="contained" onClick={handleSave} disabled={isUploading}>
          {isUploading ? (
          <>
            Uploading... <CircularProgress size={20} sx={{ ml: 1 }} />
          </>
          ) : (
          'Save as PDF'
        )}
        </Button>
        <Button variant="outlined" onClick={fetchTranscript} disabled={isLoading}>
        {isLoading ? 'Loading Transcript...' : 'Load Transcript'}
        </Button>
      </Stack>

      <TextField
        label="Screenshot Interval (seconds)"
        type="number"
        value={screenshotInterval}
        onChange={
          (e) => {
            const value = Number(e.target.value);
            if (value > 0) {
              setScreenshotInterval(value);
            }
          }
        }
        inputProps={{ min: 1 }}
        sx={{ mb: 2, width: '100px'}}
      />

      {!isScreenshotting ? (
        <Button variant="outlined" onClick={startScreenshotting}>
          Start Taking Screenshots
        </Button>
      ) : (
        <Button variant="outlined" onClick={stopScreenshotting}>
          Stop Taking Screenshots
        </Button>
      )}

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {colors.map((color) => (
          <MenuItem key={color} onClick={() => handleColorSelect(color)}>
            <Box sx={{ width: 20, height: 20, bgcolor: color, borderRadius: '50%', mr: 1 }} />
            {color}
          </MenuItem>
        ))}
      </Menu>

      <Paper
        ref={editorRef}
        contentEditable
        sx={{
          minHeight: 300,
          maxHeight: 500, 
          p: 2,
          border: '1px solid #ccc',
          bgcolor: '#fff',
          overflow: 'auto',
          mb: 2,
          overflowY: 'auto',
          scrollbarColor: '#888 #f1f1f1',
          scrollbarWidth: 'thin',
        }}
        suppressContentEditableWarning={true}
      >
        {Array.isArray(transcriptData) ? (
          transcriptData.map((item, index) => {
            if (item.type === 'image') {
              return (
                <div key={index}>
                  <img src={item.data} alt={`screenshot-${index}`} style={{ maxWidth: '100%' }} />
                  <p>{item.time}</p>
                </div>
              );
            } else {
              const minutes = Math.floor(item.offset / 60000);
              const seconds = Math.floor((item.offset % 60000) / 1000).toString().padStart(2, '0');
              const timeTag = `[${minutes}:${seconds}]`;
              return (
                <div key={index}>
                  <strong>{timeTag}</strong> {item.text}
                </div>
              );
            }
          })
        ) : (
          <div>{transcriptData}</div>
        )}
      </Paper>
    </Box>
  );
};

export default Notepad;
