// 将摄像头获取到的内容给到页面展示
export default async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('启动摄像头失败');
        return false;
    }
    const video = document.getElementById('video');
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
    video.srcObject = stream;
    video.onloadedmetadata = () => {
        video.play();
    };
    return true;
}
