// const levelImg = document.getElementById("levelImg")

// const canvas = document.getElementById("level")
// const canvasContext = canvas.getContext("2d")
const winDiv = document.getElementById("win")
//const loseDiv = document.getElementById("lose")

window.addEventListener("storage", message_receive)

function message_receive(ev) {
    if (ev.key == "shadowlevel") {
        var message = ev.newValue
        console.log(message)

        //canvasDiv.style.backgroundImage = "url(" + message + ")"

        levelImg.src = message
        // levelImg.onload = function() {
        //     canvasContext.drawImage(levelImg, 0, 0, canvas.width, canvas.height)
        // }
    } else if (ev.key == "shadowwin") {
        let percent = Math.min(Math.max(ev.newValue, 0), 1) * 100
        winDiv.style.height = percent + "vh"
        console.log(percent)
    }
}
