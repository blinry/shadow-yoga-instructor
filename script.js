function Controls() {
    this.threshold = 125
    this.update = true
    this.winPercent = 0.95
    this.losePercent = 0.20
}

controls = new Controls()
gui = new dat.GUI()
gui.add(controls, "threshold", 0, 255)
gui.add(controls, "update", true)
gui.add(controls, "winPercent", 0, 1)
gui.add(controls, "losePercent", 0, 1)

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

const levels = [
    "shapes/T.png", // very easy
    "shapes/P.png",
    "shapes/C.png",
    "shapes/L.png",
    "shapes/X.png",

    "shapes/F.png", // gut und einfach
    "shapes/E.png", // gut und einfach

    "shapes/ri.png", // introduce 2
    "shapes/Punkt.png", // introduce 2

    "shapes/A.png",
    "shapes/H.png",
    "shapes/i.png",
    "shapes/M.png",
    "shapes/N.png",
    "shapes/O.png",

    "shapes/S.png",
    "shapes/u.png",
    "shapes/V.png",

    "shapes/K.png", // hard

    "shapes/i_red.png",
    "shapes/T_red.png",
    "shapes/o_red.png",
    "shapes/K_red.png",
    "shapes/c_red.png",
]

const startSpeech = [
    "Viel Glück!",
    "Und los!",
    "Los!",
    "Los, los!",
    "Hop, hop!",
    "Tu, was ich sage!",
    "Folge mir!",
    "Hör zu!",
    "Gehorche, Mensch!",
    "Guten Tag!",
    "Hallo!",
    "Ich möchte ein Spiel spielen!",
]
const winSpeech = [
    "Gut gemacht!",
    "Nicht schlecht!",
    "OK!",
    "Na endlich...",
    "Ja.",
    "Korrekt.",
    "Danke.",
    "Hm-hm.",
    "Ganz OK.",
    "Nagut",
    "Naja...",
    "Das hat aber lange gedauert...",
]

var currentLevel = 0

var references = []
var goals = []

var isRunning = false
var hasWon = false

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

    if (isRunning) {
        var image = contextOriginal.getImageData(
            0,
            0,
            canvasOriginal.width,
            canvasOriginal.height,
        )

        covered = thresholdPerChannel(image.data, controls.threshold)
        contextThreshold.putImageData(image, 0, 0)

        if (!hasWon) {
            var goal = goals[currentLevel]

            var npixels = canvasOriginal.width * canvasOriginal.height

            whiteCoveredPercent =
                (goal.white - covered.white) / (goal.white + 1)

            redCoveredPercent =
                goal.red < 0.01 * npixels
                    ? 0
                    : (goal.red - covered.red) / (goal.red + 1)

            winBar = whiteCoveredPercent / controls.winPercent
            loseBar = redCoveredPercent / controls.losePercent

            localStorage.setItem("shadowwin", winBar)
            localStorage.setItem("shadowlose", loseBar)

            ratioDisplay.innerHTML =
                "win: " + whiteCoveredPercent + ", lose: " + redCoveredPercent

            var win = whiteCoveredPercent >= controls.winPercent
            var lose = redCoveredPercent >= controls.losePercent

            if (win && !lose) {
                ratioDisplay.className = "win"
                hasWon = true
                localStorage.setItem("shadowlevel", "shapes/green.png")
                sayRandom(winSpeech)
                setTimeout(takeSnapshot, 500)
                setTimeout(loadNextLevel, 500+5000)
            } else {
                ratioDisplay.className = ""
            }
        }
    }
}

function takeSnapshot() {
    console.log("taking snapshot")
    var dataURL = canvasThreshold.toDataURL("image/png")
    // localStorage.setItem("shadowlevel", dataURL.replace(/^data:image\/(png|jpg);base64,/, ""))
    localStorage.setItem("shadowlevel", dataURL)
}

function resetGame() {
    localStorage.setItem("shadowwin", 0)
    localStorage.setItem("shadowlose", 0)

    hasWon = false
    isRunning = false

    controls.update = true
    references = []
    goals = []
    captureNextLevel()
}

function captureNextLevel() {
    loadCurrentLevel()
    setTimeout(captureReference, 1000)
}

function captureReference() {
    var reference = contextOriginal.getImageData(
        0,
        0,
        canvasOriginal.width,
        canvasOriginal.height,
    )

    //contextReference.putImageData(reference, 0, 0)
    var goal = thresholdPerChannel(reference.data, controls.threshold)
    references.push(reference)
    console.log("?")
    console.log(reference)
    goals.push(goal)
    //contextDifference.putImageData(reference, 0, 0

    if (currentLevel + 1 == levels.length) {
        startGame()
    } else {
        currentLevel++
        captureNextLevel()
    }
}

function startGame() {
    currentLevel = 0
    loadCurrentLevel()
    isRunning = true
}

function loadNextLevel() {
    hasWon = true
    currentLevel = (currentLevel + 1) % levels.length
    loadCurrentLevel()
    sayRandom(startSpeech)
    setTimeout(function() {hasWon = false}, 1000)
}

function loadLevel(name) {
    localStorage.setItem("shadowlevel", name)
    console.log(name)
}

function loadCurrentLevel() {
    var level = levels[currentLevel]
    loadLevel(level)

    var reference = references[currentLevel]
    if (reference) {
        contextReference.putImageData(reference, 0, 0)
    }
}

function sayRandom(texts) {
    say(texts[Math.floor(Math.random()*texts.length)])
}

function say(text) {
    responsiveVoice.speak(text, "Deutsch Female", {rate: 0.4, pitch: 0.2});
}

// Attach the video stream to the video element and autoplay.
navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    player.srcObject = stream
})

//loadLevel("shapes/G_shape.png")
setInterval(updateImage, 100)
