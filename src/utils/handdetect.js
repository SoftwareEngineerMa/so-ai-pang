const handpose = require('@tensorflow-models/handpose');
require('@tensorflow/tfjs-backend-webgl');
import * as THREE from 'three';
import * as fp from 'fingerpose';

const knownGestures = [
  fp.Gestures.VictoryGesture,
  fp.Gestures.ThumbsUpGesture
];
const GE = new fp.GestureEstimator(knownGestures);

export default async function main() {

  const model = await handpose.load();

  return async function () {
    const predictions = await model.estimateHands(document.querySelector("video"));
    if (predictions.length > 0) {
      // for (let i = 0; i < predictions.length; i++) {
      //   const keypoints = predictions[i].landmarks;

      //   for (let i = 0; i < keypoints.length; i++) {
      //     const [x, y, z] = keypoints[i];
      //     console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
      //   }
      // }
      let result = mzmJudge(predictions[0].landmarks, predictions[0].annotations);
      if (result !== 'hand-normal') {
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
    return 'hand-normal';
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
  const isZhan = checkZhan();
  if (isZhan) {
    // console.log('展开');
    return 'zhan';
  }

  // 判断手掌收状态
  let fingerTipsDistance = 0;
  let fingerTipsList = [keypoints[4], keypoints[8], keypoints[12], keypoints[16], keypoints[20]];
  for (let i = 1; i < fingerTipsList.length; i++) {
    const vec1 = new THREE.Vector3(...fingerTipsList[i]);
    const vec2 = new THREE.Vector3(...fingerTipsList[i - 1]);
    fingerTipsDistance += vec1.distanceTo(vec2);
  }
  fingerTipsDistance += (new THREE.Vector3(...fingerTipsList[0])).distanceTo(new THREE.Vector3(...fingerTipsList[fingerTipsList.length - 1]));
  // console.log(fingerTipsDistance);
  if (!isZhan && fingerTipsDistance < 180) {
    // console.log('收');
    return 'shou';
  }
  return 'hand-normal';
}