const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");

startBtn.addEventListener("click", async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        const video = document.createElement("video");

        video.autoplay = true;
        video.playsInline = true;
        video.srcObject = stream;

        video.style.width = "400px";
        video.style.maxWidth = "90%";
        video.style.borderRadius = "15px";
        video.style.display = "block";
        video.style.margin = "20px auto";

        document.body.appendChild(video);

        status.textContent = "Status: Camera is ON 🟢";
        startBtn.textContent = "Camera Running";
        startBtn.disabled = true;

    } catch (error) {
        console.error(error);
        status.textContent = "Status: Camera permission denied ❌";
    }
});
