// 将摄像头获取到的内容给到页面展示
export default async function setupCamera(video) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('启动摄像头失败');
        return false;
    }

    const VIDEO_SIZE = 500;
    const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
        facingMode: 'user',
        // Only setting the video to a specified size in order to accommodate a
        // point cloud, so on mobile devices accept the default size.
        width: VIDEO_SIZE,
        height: VIDEO_SIZE,
    },
    });
    const mediaStreamTrack = typeof stream.stop === 'function' ? stream : stream.getTracks()[0];
    video.srcObject = stream;
    video.onloadedmetadata = () => {
        video.play();
    };
    return mediaStreamTrack;
}
