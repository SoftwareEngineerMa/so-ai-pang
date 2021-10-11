const faceLandmarksDetection = require('@tensorflow-models/face-landmarks-detection');
require('@tensorflow/tfjs-backend-webgl');

export default async function main() {
  const model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, {maxFaces: 1});
  
  // 返回值类型字符串
  // 'top'|'bottom'|'left'|'right'|'normal'
  return async function () {
      const predictions = await model.estimateFaces({
        input: document.querySelector("video")
      });

      if ( predictions.length > 0 ) {

        const nose = predictions[0].annotations.noseTip[0];
        const faceRight = predictions[0].scaledMesh[132];
        const faceLeft = predictions[0].scaledMesh[361];
        const faceTop = predictions[0].scaledMesh[10];
        const faceBottom = predictions[0].scaledMesh[152];

        if (predictions[0].faceInViewConfidence>0.99) {
          if (nose[0] <= faceRight[0]) {
            // console.log('向右看');
            return 'right';
          }

          if (nose[0] >= faceLeft[0]) {
            // console.log('向左看');
            return 'left';
          }

          if (faceTop[2] > faceBottom[2] && Math.abs(faceTop[2]-faceBottom[2]) > 60) {
            // console.log('向上看');
            return 'top';
          }

          if (faceBottom[2] > faceTop[2] && Math.abs(faceBottom[2]-faceTop[2]) > 60) {
            // console.log('向下看');
            return 'bottom';
          }
        } else {
          // console.log('模糊数据');
          return 'normal';
        }
      }
      return 'normal';
  }
}