function Controls() {
    this.threshold = 150
    this.update = true
    this.win_percent = 0.95
}

controls = new Controls()
gui = new dat.GUI()
gui.add(controls, "threshold", 0, 255)
gui.add(controls, "update", true)
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

const constraints = {
    video: true,
}

var reference = null
var goal = {white: 0, red: 0}

function thresholdPerChannel(data, level) {
    var length = data.length / 4

    var white = 0
    var red = 0

    for (i = 0; i < length; i++) {
        if (data[i * 4 + 0] > level) {
            data[i * 4 + 0] = 255
        } else {
            data[i * 4 + 0] = 0
        }
        if (data[i * 4 + 1] > level) {
            data[i * 4 + 1] = 255
        } else {
            data[i * 4 + 1] = 0
        }
        if (data[i * 4 + 2] > level) {
            data[i * 4 + 2] = 255
        } else {
            data[i * 4 + 2] = 0
        }
        data[i * 4 + 3] = 255

        if (data[i * 4 + 0] && data[i * 4 + 1] && data[i * 4 + 2]) white++
        if (data[i * 4 + 0] && !data[i * 4 + 1] && !data[i * 4 + 2]) red++
    }

    return {white: white, red: red}
}

function threshold(data, level) {
    var length = data.length / 4
    var white = 0

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
            white++
        } else {
            r = 0
            g = 0
            b = 0
            a = 255
        }

        data[i * 4 + 0] = r
        data[i * 4 + 1] = g
        data[i * 4 + 2] = b
        data[i * 4 + 3] = a
    }

    return {white: white, red: 0}
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
    if (!controls.update) return

    // Draw the video frame to the canvas.
    contextOriginal.drawImage(
        player,
        0,
        0,
        canvasOriginal.width,
        canvasOriginal.height,
    )

    var brightPixels = 0

    if (reference != null) {
        var image = contextOriginal.getImageData(
            0,
            0,
            canvasOriginal.width,
            canvasOriginal.height,
        )

        covered = thresholdPerChannel(image.data, controls.threshold)
        contextThreshold.putImageData(image, 0, 0)

        white = 1 - covered.white / (goal.white + 1)
        red = 1 - covered.red / (goal.red + 1)

        whiteCoveredPercent = (goal.white - covered.white) / (goal.white + 1)

        ratio = whiteCoveredPercent
        ratioBar = ratio / controls.win_percent
        localStorage.setItem("shadowwin", ratioBar)
        ratioDisplay.innerHTML =
            "ratio: " +
            ratio +
            " (white: " +
            covered.white +
            "/" +
            goal.white +
            ", red: " +
            covered.red +
            "/" +
            goal.red +
            ")"

        var win = ratio >= controls.win_percent
        if (win) {
            ratioDisplay.className = "win"
            // nextLevel();
        } else {
            ratioDisplay.className = ""
        }
    }
}

function resetGame() {
    nextLevel()
    setTimeout(captureReference, 1000)
    controls.update = true
}

function captureReference() {
    reference = contextOriginal.getImageData(
        0,
        0,
        canvasOriginal.width,
        canvasOriginal.height,
    )

    contextReference.putImageData(reference, 0, 0)
    goal = thresholdPerChannel(reference.data, controls.threshold)
    contextDifference.putImageData(reference, 0, 0)
}

function loadLevel(name) {
    localStorage.setItem("shadowlevel", name)
    console.log(name)
}

function nextLevel() {
    var levels = [
        "shapes/A.png",
        "shapes/C.png",
        "shapes/E.png",
        "shapes/F.png",
        "shapes/H.png",
        "shapes/i.png",
        "shapes/i_red.png",
        "shapes/K.png",
        "shapes/L.png",
        "shapes/M.png",
        "shapes/N.png",
        "shapes/O.png",
        "shapes/P.png",
        "shapes/Punkt.png",
        "shapes/ri.png",
        "shapes/S.png",
        "shapes/T.png",
        "shapes/u.png",
        "shapes/V.png",
        "shapes/X.png",
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
