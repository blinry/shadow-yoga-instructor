// const levelImg = document.getElementById("levelImg")

// const canvas = document.getElementById("level")
// const canvasContext = canvas.getContext("2d")
const winDiv = document.getElementById("win")
const loseDiv = document.getElementById("lose")

window.addEventListener("storage", messageReceive)

const serverURL = "http://gidonernst.de/shadow-yoga-instructor/"

function messageReceive(ev) {
    if (ev.key == "shadowlevel") {
        var message = ev.newValue
        console.log(message)

        //canvasDiv.style.backgroundImage = "url(" + message + ")"

        levelImg.src = message
        setTimeout(0, () => uploadSnapshot(message))
        // levelImg.onload = function() {
        //     canvasContext.drawImage(levelImg, 0, 0, canvas.width, canvas.height)
        // }
    } else if (ev.key == "shadowwin") {
        let percent = Math.min(Math.max(ev.newValue, 0), 1) * 100
        winDiv.style.height = percent + "vh"
        // console.log(percent)
    } else if (ev.key == "shadowlose") {
        let percent = Math.min(Math.max(ev.newValue, 0), 1) * 100
        loseDiv.style.height = percent + "vh"
        // console.log(percent)
    }
}

function uploadSnapshot(data) {
    var request = new XMLHttpRequest();
    request.open("POST", serverURL, true)
    var form = new FormData()
    form.append("image", data)
    request.send(form)
}
