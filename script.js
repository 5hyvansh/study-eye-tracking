import {
    FaceLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm";

const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");
const eyeStatus = document.getElementById("eyeStatus");
const video = document.getElementById("video");

let faceLandmarker = null;
let lastVideoTime = -1;


// Load AI model
async function setupFaceTracker() {

    status.textContent = "Status: Loading AI model...";

    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(
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

    console.log("Face tracker loaded!");
}


// Start webcam
async function startCamera() {

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

    startBtn.textContent = "Monitoring...";
    startBtn.disabled = true;

    detectFace();
}


// Detect face
function detectFace() {

    if (
        video.readyState >= 2 &&
        video.currentTime !== lastVideoTime
    ) {

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

            eyeStatus.textContent =
                "Face: Detected 👤";

        } else {

            eyeStatus.textContent =
                "Face: Not detected ⚠️";
        }
    }

    requestAnimationFrame(detectFace);
}


// Start button
startBtn.addEventListener("click", async () => {

    startBtn.disabled = true;

    try {

        await setupFaceTracker();

        await startCamera();

    } catch (error) {

        console.error(error);

        status.textContent =
            "Error: AI tracker failed to load ❌";

        eyeStatus.textContent =
            "Check browser console for details.";

        startBtn.disabled = false;
    }
});
