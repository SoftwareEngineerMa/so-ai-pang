import { ScatterGL } from 'scatter-gl'; 
const NUM_KEYPOINTS = 468;
const NUM_IRIS_KEYPOINTS = 5;
const RED = '#FF2C35';
const BLUE = '#72B8FF';

export default function() {
    let scatterGLHasInitialized = false
    let scatterGL = new ScatterGL(document.querySelector('#face'),{'rotateOnStart': false, 'selectEnabled': false, 'styles': { point: { scaleDefault: 0.5 }, axesVisible: false, backgroundColor: '#373736'}});

    return function drawFace (predictions) {
        if (scatterGL != null) {
            const pointsData = predictions.map(prediction => {
            let scaledMesh = prediction.scaledMesh;
            return scaledMesh.map(point => ([-point[0], -point[1], -point[2]]));
        });

        let flattenedPointsData = [];
        for (let i = 0; i < pointsData.length; i++) {
            flattenedPointsData = flattenedPointsData.concat(pointsData[i]);
        }
        const dataset = new ScatterGL.Dataset(flattenedPointsData);

        if (!scatterGLHasInitialized) {
            scatterGL.setPointColorer((i) => {
            if (i % (NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS * 2) > NUM_KEYPOINTS) {
                return RED;
            }
            return BLUE;
            });
            scatterGL.render(dataset);
        } else {
            scatterGL.updateDataset(dataset);
        }
        scatterGLHasInitialized = true;
        }
    }
}
