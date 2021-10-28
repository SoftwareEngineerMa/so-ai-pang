import { Finger, FingerCurl, FingerDirection } from '../FingerDescription';
import GestureDescription from '../GestureDescription';

// describe fist gesture
const fistDescription = new GestureDescription('fist');

// thumb:
fistDescription.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
fistDescription.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.5);
fistDescription.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
fistDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 1.0);


for(let finger of [Finger.Index,Finger.Middle, Finger.Ring, Finger.Pinky]) {
    fistDescription.addCurl(finger, FingerCurl.FullCurl, 1.0);
    fistDescription.addDirection(finger, FingerDirection.VerticalUp, 0.2);
    fistDescription.addDirection(finger, FingerDirection.DiagonalUpLeft, 1.0);
    fistDescription.addDirection(finger, FingerDirection.HorizontalLeft, 0.2);
}
export default fistDescription;
