import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let model = null;

export const loadModel = async () => {
  if (!model) {
    model = await mobilenet.load();
  }
  return model;
};

export const analyzeDrawing = async (imageElement) => {
  const model = await loadModel();
  const predictions = await model.classify(imageElement);
  return predictions;
};

export const generateAnimation = async (imageElement, predictions) => {
  // Create a canvas for animation
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;

  // Draw the original image
  ctx.drawImage(imageElement, 0, 0);

  // Get the top prediction
  const topPrediction = predictions[0];
  
  // Create animation based on the prediction
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageElement, 0, 0);

    // Add some simple animation effects based on the prediction
    const time = Date.now() * 0.001;
    const scale = 1 + Math.sin(time) * 0.1;
    const x = Math.sin(time * 2) * 10;
    const y = Math.cos(time * 2) * 10;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2 + x, -canvas.height / 2 + y);
    ctx.drawImage(imageElement, 0, 0);
    ctx.restore();

    // Add some fun effects based on the prediction
    if (topPrediction.className.includes('animal')) {
      // Add animal-like movement
      const earWiggle = Math.sin(time * 4) * 5;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(earWiggle * Math.PI / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      ctx.drawImage(imageElement, 0, 0);
      ctx.restore();
    }

    requestAnimationFrame(animate);
  };

  animate();
  return canvas;
}; 