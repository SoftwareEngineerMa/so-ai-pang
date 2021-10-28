import { Finger, FingerCurl, FingerDirection } from '../FingerDescription';
import GestureDescription from '../GestureDescription';

// describe shoot gesture
const shootDescription = new GestureDescription('shoot');

// thumb:
// - not curled
// - vertical up (best) or diagonal up left / right
shootDescription.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
shootDescription.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
shootDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.25);
shootDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.25);

shootDescription.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
shootDescription.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 1.0);
shootDescription.addDirection(Finger.Index, FingerDirection.HorizontalRight, 1.0);

// all other fingers:
// - curled
// - horizontal left or right
for(let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
  shootDescription.addCurl(finger, FingerCurl.FullCurl, 1.0);
  // shootDescription.addDirection(finger, FingerDirection.HorizontalLeft, 1.0);
  // shootDescription.addDirection(finger, FingerDirection.HorizontalRight, 1.0);
}

shootDescription.setWeight(Finger.Thumb, 2);
shootDescription.setWeight(Finger.Index, 2);
export default shootDescription;
