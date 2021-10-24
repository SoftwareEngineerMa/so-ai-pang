import handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';
// import * as THREE from 'three';
import fp from './static/fingerpose/index';

const knownGestures = [
  fp.Gestures.VictoryGesture,
  fp.Gestures.ThumbsUpGesture,
  fp.Gestures.IndexUpGesture,
  fp.Gestures.OKGesture,
  fp.Gestures.FistGesture,
  fp.Gestures.ShootGesture,
];
const GE = new fp.GestureEstimator(knownGestures);

export default async function main() {

  const model = await handpose.load();

  // 返回值类型字符串
  // 'zhan'|'victory'|'great'|'fist'|'index_up'|'ok'|'shoot'|'normal'
  return async function () {
    const predictions = await model.estimateHands(document.querySelector("video"), true);
    if (predictions.length > 0) {
      let result = mzmJudge(predictions[0].landmarks, predictions[0].annotations);
      if (result) {
        return result;
      }

      const est = GE.estimate(predictions[0].landmarks, 7.5);
      if (est.gestures.length > 0) {
        // find gesture with highest confidence
        const gest = est.gestures.reduce((p, c) => {
          return (p.confidence > c.confidence) ? p : c;
        });

        return gest.name;
      }

    }
    return 'normal';
  }
}
function mzmJudge(keypoints, annotations) {
  const checkZhan = () => {
    for (let finger in annotations) {
      for (let i = 1; i < annotations[finger].length; i++) {
        if (annotations[finger][i][1] > annotations[finger][i - 1][1]) {
          return false;
        }
      }
    }
    return true;
  };

  if (checkZhan()) {
    // console.log('展开');
    return 'zhan';
  }
}