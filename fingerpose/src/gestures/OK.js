import { Finger, FingerCurl, FingerDirection } from '../FingerDescription';
import GestureDescription from '../GestureDescription';


// describe ok gesture 
const okDescription = new GestureDescription('ok');


// thumb:
okDescription.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
okDescription.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 0.2);
okDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 1.0);
okDescription.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.2);


// index:
okDescription.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
okDescription.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.2);
okDescription.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 1.0);
okDescription.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 0.2);

// middle:
okDescription.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
okDescription.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
okDescription.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.75);

// ring:
okDescription.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
okDescription.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1.0);
okDescription.addDirection(Finger.Ring, FingerDirection.DiagonalUpLeft, 0.75);
// pinky:
okDescription.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
okDescription.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);
okDescription.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 0.75);

okDescription.setWeight(Finger.ring, 2);
okDescription.setWeight(Finger.Middle, 2);
okDescription.setWeight(Finger.Pinky, 2);

export default okDescription;
