function Controls() {
    this.threshold = 100
    this.compare_mode = false
    this.win_percent = 0.95
}

controls = new Controls()
gui = new dat.GUI()
gui.add(controls, "threshold", 0, 255)
gui.add(controls, "compare_mode", false)
gui.add(controls, "win_percent", 0, 1)

const player = document.getElementById("player")

const canvasOriginal = document.getElementById("original")
const contextOriginal = canvasOriginal.getContext("2d")

const canvasThreshold = document.getElementById("threshold")
const contextThreshold = canvasThreshold.getContext("2d")

const canvasDifference = document.getElementById("difference")
const contextDifference = canvasDifference.getContext("2d")

const ratioDisplay = document.getElementById("ratio")

const levelImg = document.getElementById("levelImg")

const canvasLevel = document.getElementById("level")
const contextLevel = canvasLevel.getContext("2d")

const constraints = {
    video: true,
}

function threshold(data, level) {
    var length = data.length / 4
    var black = 0

    for (i = 0; i < length; i++) {
        var r = data[i * 4 + 0]
        var g = data[i * 4 + 1]
        var b = data[i * 4 + 2]
        var a = data[i * 4 + 3]

        var brightness = (r + g + b) / 3
        //console.log(i)
        //console.log(brightness)

        if (brightness > level) {
            r = 255
            g = 255
            b = 255
            a = 255
        } else {
            r = 0
            g = 0
            b = 0
            a = 255
            black++
        }

        data[i * 4 + 0] = r
        data[i * 4 + 1] = g
        data[i * 4 + 2] = b
        data[i * 4 + 3] = a
    }

    return black / length
}

function minimum(reference, captured, result) {
    console.assert(reference.length == captured.length)
    console.assert(reference.length == result.length)

    var length = reference.length / 4

    for (i = 0; i < length; i++) {
        result[i * 4 + 0] = Math.min(captured[i * 4 + 0], reference[i * 4 + 0])
        result[i * 4 + 1] = Math.min(captured[i * 4 + 1], reference[i * 4 + 1])
        result[i * 4 + 2] = Math.min(captured[i * 4 + 2], reference[i * 4 + 2])
        result[i * 4 + 3] = Math.min(captured[i * 4 + 3], reference[i * 4 + 3])
    }
}

function updateImageTime() {
    console.time("updateImage")
    updateImage()
    console.timeEnd("updateImage")
}

function updateImage() {
    // Draw the video frame to the canvas.
    contextOriginal.drawImage(
        player,
        0,
        0,
        canvasOriginal.width,
        canvasOriginal.height,
    )

    var brightPixels = 0

    var captured = contextOriginal.getImageData(
        0,
        0,
        canvasOriginal.width,
        canvasOriginal.height,
    )

    var reference = contextLevel.getImageData(
        0,
        0,
        canvasLevel.width,
        canvasLevel.height,
    )

    minimum(captured.data, reference.data, captured.data)
    contextDifference.putImageData(captured, 0, 0)

    var ratio = threshold(captured.data, controls.threshold)
    contextThreshold.putImageData(captured, 0, 0)

    ratioDisplay.innerHTML = ratio
    var win = ratio > controls.win_percent
    if (win) {
        ratioDisplay.className = "win"
        nextLevel()
    } else {
        ratioDisplay.className = ""
    }
}

function enableFullscreen() {
    canvasLevel.requestFullscreen()
}

function loadLevel(name) {
    levelImg.src = name
    levelImg.onload = function() {
        contextLevel.drawImage(
            levelImg,
            0,
            0,
            canvasLevel.width,
            canvasLevel.height,
        )
    }
}

function nextLevel() {
    var levels = [
        "shapes/C_shape.png",
        "shapes/F_shape.png",
        "shapes/G_shape.png",
        "shapes/SYI_shapes.ai",
        "shapes/T_shape.png",
    ]
    var level = levels[Math.floor(Math.random() * levels.length)]
    loadLevel(level)
}

// Attach the video stream to the video element and autoplay.
navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    player.srcObject = stream
})

loadLevel("shapes/G_shape.png")
setInterval(updateImage, 100)
