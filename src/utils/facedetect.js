const faceLandmarksDetection = require('../../face-landmarks-detection/dist/face-landmarks-detection.esm');
require('@tensorflow/tfjs-backend-webgl');
import faceshow from './faceShow';

export default async function main(video) {
  const model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, {maxFaces: 1});
  const drawFace = faceshow()
  // 返回值类型字符串
  // 'top'|'bottom'|'leanLeft'|'leanRight'|'turnLeft'|'turnRight'|'normal'
  return async function () {
    if(!video.paused && !video.ended) {
      const predictions = await model.estimateFaces({
        input: video
      });

      if ( predictions.length > 0 ) {
        //drawface
        drawFace(predictions)

        const nose = predictions[0].annotations.noseTip[0];
        const faceRight = predictions[0].scaledMesh[132];
        const faceLeft = predictions[0].scaledMesh[361];
        const faceTop = predictions[0].scaledMesh[10];
        const faceBottom = predictions[0].scaledMesh[152];

        if (predictions[0].faceInViewConfidence > 0.99) {
          if (faceRight[1] - faceLeft[1] > 60) {
            // console.log('向右倒');
            return 'leanRight';
          }
          
          if (faceRight[1] - faceLeft[1] < -60) {
            // console.log('向左倒');
            return 'leanLeft';
          }

          if (faceTop[2] > faceBottom[2] && Math.abs(faceTop[2]-faceBottom[2]) > 40) {
            // console.log('向上看');
            return 'top';
          }

          if (faceBottom[2] > faceTop[2] && Math.abs(faceBottom[2]-faceTop[2]) > 30) {
            // console.log('向下看');
            return 'bottom';
          }

          if (nose[0] <= faceRight[0]) {
            // console.log('向右转');
            return 'turnRight';
          }

          if (nose[0] >= faceLeft[0]) {
            // console.log('向左转');
            return 'turnLeft';
          }
        } else {
          // console.log('模糊数据');
          return 'normal';
        }
      }
      return 'normal';
    }
  }
}