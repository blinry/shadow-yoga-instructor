const player = document.getElementById("player")
const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")

const constraints = {
    video: true,
}

navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    player.srcObject = stream
})


function uploadSnapshotFromCamera() {
    context.drawImage(
        player,
        0,
        0,
        canvas.width,
        canvas.height,
    )
    console.log("snapshot")
    var data = canvas.toDataURL("image/png");
    uploadSnapshot(data)
}
