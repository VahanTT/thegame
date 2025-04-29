import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { analyzeDrawing, generateAnimation } from './utils/animationUtils';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [animatedResult, setAnimatedResult] = useState(null);
  const [error, setError] = useState(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setAnimatedResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  const handleAnimate = async () => {
    if (!image || !imageRef.current) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      // Analyze the drawing
      const predictions = await analyzeDrawing(imageRef.current);
      console.log('Predictions:', predictions);

      // Generate animation
      const canvas = await generateAnimation(imageRef.current, predictions);
      setAnimatedResult(canvas.toDataURL());
    } catch (err) {
      setError('Failed to process the image. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Drawing Animator
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          Upload a child's drawing and watch it come to life!
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            my: 4,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
            border: '2px dashed',
            borderColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'action.hover',
              borderColor: 'primary.dark',
            }
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Upload a Drawing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isDragActive
              ? "Drop your image here"
              : "Drag and drop an image here, or click to browse"}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Supported formats: JPG, JPEG, PNG
          </Typography>
        </Paper>

        {image && (
          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              Original Drawing
            </Typography>
            <img
              ref={imageRef}
              src={image}
              alt="Uploaded drawing"
              style={{ maxWidth: '100%', maxHeight: '400px', display: 'none' }}
              crossOrigin="anonymous"
            />
            <img
              src={image}
              alt="Uploaded drawing preview"
              style={{ maxWidth: '100%', maxHeight: '400px' }}
            />
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={handleAnimate}
                disabled={isProcessing}
                startIcon={isProcessing ? <CircularProgress size={20} /> : null}
              >
                {isProcessing ? 'Animating...' : 'Animate Drawing'}
              </Button>
            </Box>
          </Box>
        )}

        {animatedResult && (
          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              Animated Result
            </Typography>
            <img
              src={animatedResult}
              alt="Animated result"
              style={{ maxWidth: '100%', maxHeight: '400px' }}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default App;
