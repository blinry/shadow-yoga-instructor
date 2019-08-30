function Controls() {
    this.threshold = 220
    this.compare_mode = false
    this.win_percent = 0.99
}

controls = new Controls()
gui = new dat.GUI()
gui.add(controls, "threshold", 0, 255)
gui.add(controls, "compare_mode", false)
gui.add(controls, "win_percent", 0, 1)

const player = document.getElementById("player")

const canvasOriginal = document.getElementById("original")
const contextOriginal = canvasOriginal.getContext("2d")

const canvasReference = document.getElementById("reference")
const contextReference = canvasReference.getContext("2d")

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

var captured = null;

function thresholdPerChannel(data, level) {
    var length = data.length / 4
    var result = {
        red   : 0,
        green : 0,
        blue  : 0
    }

    for (i = 0; i < length; i++) {
        if(data[i * 4 + 0] > level) { data[i * 4 + 0] = 255; result.red   ++ } else { data[i * 4 + 0] = 0 }
        if(data[i * 4 + 1] > level) { data[i * 4 + 1] = 255; result.green ++ } else { data[i * 4 + 1] = 0 }
        if(data[i * 4 + 2] > level) { data[i * 4 + 2] = 255; result.blue  ++ } else { data[i * 4 + 2] = 0 }
        data[i * 4 + 3] = 255
    }

    return result
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

function difference(left, right, result) {
    console.assert(left.length == right.length)
    console.assert(left.length == result.length)

    var length = left.length / 4

    for (i = 0; i < length; i++) {
        result[i * 4 + 0] = Math.max(0, right[i * 4 + 0] - left[i * 4 + 0])
        result[i * 4 + 1] = Math.max(0, right[i * 4 + 1] - left[i * 4 + 1])
        result[i * 4 + 2] = Math.max(0, right[i * 4 + 2] - left[i * 4 + 2])
        result[i * 4 + 3] = 255
    }
}

function minimum(left, right, result) {
    console.assert(left.length == right.length)
    console.assert(left.length == result.length)

    var length = left.length / 4

    for (i = 0; i < length; i++) {
        result[i * 4 + 0] = Math.min(right[i * 4 + 0], left[i * 4 + 0])
        result[i * 4 + 1] = Math.min(right[i * 4 + 1], left[i * 4 + 1])
        result[i * 4 + 2] = Math.min(right[i * 4 + 2], left[i * 4 + 2])
        result[i * 4 + 3] = 255
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

    if(captured != null) {
        var image = contextOriginal.getImageData(
            0,
            0,
            canvasOriginal.width,
            canvasOriginal.height,
        )

        thresholdPerChannel(image.data, controls.threshold)
        contextThreshold.putImageData(image, 0, 0)

        ratioDisplay.innerHTML = ratio

        // var win = ratio >= controls.win_percent
        // if (win) {
        //     ratioDisplay.className = "win"
        //     // nextLevel();
        // } else {
        //     ratioDisplay.className = ""
        // }
    }
}

function enableFullscreen() {
    canvasLevel.requestFullscreen()
}

function captureReference() {
    captured = contextOriginal.getImageData(
        0,
        0,
        canvasOriginal.width,
        canvasOriginal.height,
    )

    console.log("capture reference")

    contextReference.putImageData(captured, 0, 0)

    thresholdPerChannel(captured.data, controls.threshold)
    contextDifference.putImageData(captured, 0, 0)
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
