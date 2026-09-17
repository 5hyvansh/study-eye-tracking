const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");
const eyeStatus = document.getElementById("eyeStatus");
const video = document.getElementById("video");

let faceLandmarker;
let lastVideoTime = -1;

async function setupFaceTracker() {
    const vision = await window.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
    );

    faceLandmarker = await window.FaceLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
            },

            runningMode: "VIDEO",

            numFaces: 1,

            minFaceDetectionConfidence: 0.5,
            minFacePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5
        }
    );
}

async function startCamera() {
    try {

        status.textContent = "Status: Starting camera...";

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480,
                facingMode: "user"
            },
            audio: false
        });

        video.srcObject = stream;

        await video.play();

        status.textContent = "Status: AI Tracking ON 🟢";

        startBtn.disabled = true;
        startBtn.textContent = "Monitoring...";

        detectFace();

    } catch (error) {

        console.error(error);

        status.textContent =
            "Camera error: Please allow camera permission ❌";
    }
}

async function detectFace() {

    if (!faceLandmarker) {
        requestAnimationFrame(detectFace);
        return;
    }

    if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {

        lastVideoTime = video.currentTime;

        const results =
            faceLandmarker.detectForVideo(
                video,
                performance.now()
            );

        if (
            results.faceLandmarks &&
            results.faceLandmarks.length > 0
        ) {

            const landmarks = results.faceLandmarks[0];

            /*
             * MediaPipe has 478 face landmarks.
             * For now we only confirm that a face
             * is successfully detected.
             */

            eyeStatus.textContent =
                "Eyes: Face detected 👤";

        } else {

            eyeStatus.textContent =
                "Eyes: Face not detected ⚠️";
        }
    }

    requestAnimationFrame(detectFace);
}

startBtn.addEventListener("click", async () => {

    startBtn.disabled = true;

    try {

        await setupFaceTracker();

        await startCamera();

    } catch (error) {

        console.error(error);

        status.textContent =
            "AI tracker failed to load ❌";

        startBtn.disabled = false;
    }
});
