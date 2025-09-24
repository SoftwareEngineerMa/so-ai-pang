import { Finger, FingerCurl, FingerDirection } from '../FingerDescription';
import GestureDescription from '../GestureDescription';


// describe gesture ✌
const indexUpDescription = new GestureDescription('point');


// thumb:
indexUpDescription.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
indexUpDescription.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.5);
indexUpDescription.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
indexUpDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 1.0);

// index:
indexUpDescription.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
indexUpDescription.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.75);
indexUpDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 1.0);

// middle:
indexUpDescription.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
indexUpDescription.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.2);
indexUpDescription.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 1.0);
indexUpDescription.addDirection(Finger.Middle, FingerDirection.HorizontalLeft, 0.2);

// ring:
indexUpDescription.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
indexUpDescription.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.2);
indexUpDescription.addDirection(Finger.Ring, FingerDirection.DiagonalUpLeft, 1.0);
indexUpDescription.addDirection(Finger.Ring, FingerDirection.HorizontalLeft, 0.2);

// pinky:
indexUpDescription.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
indexUpDescription.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.2);
indexUpDescription.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 1.0);
indexUpDescription.addDirection(Finger.Pinky, FingerDirection.HorizontalLeft, 0.2);

// give additional weight to index and ring fingers
indexUpDescription.setWeight(Finger.Index, 2);

export default indexUpDescription;
