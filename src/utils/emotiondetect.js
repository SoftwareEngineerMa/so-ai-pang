const faceapi = require('@vladmandic/face-api');

export default async function main(video) {
 const minConfidenceFace = 0.5;
    const faceapiOptions = new faceapi.SsdMobilenetv1Options({minConfidenceFace});

    await faceapi.loadSsdMobilenetv1Model('/model');
    await faceapi.loadFaceLandmarkModel('/model');
    await faceapi.loadFaceExpressionModel('/model');

    // 返回值类型对象 {expression:string, ratio:number}
    // expression范围：'happy'|'angry'|'sad'|'surprised'|'disgusted'|'fearful'|'normal'
    return async function () {
      let result = {};
      const detectionWithExpressions = await faceapi.detectSingleFace(video, faceapiOptions).withFaceLandmarks().withFaceExpressions();
      if(detectionWithExpressions && detectionWithExpressions.expressions) {
        const expression = Object.entries(detectionWithExpressions.expressions).sort((a,b) => b[1] - a[1]);
        // result = `expression: ${Math.round(100 * expression[0][1])}% ${expression[0][0]}`;
        result.expression = expression[0][0];
        result.ratio = Math.round(100 * expression[0][1]);
      }
      
      return result;
  }
}
