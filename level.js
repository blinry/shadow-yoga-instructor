//const levelImg = document.getElementById("levelImg")

const canvasDiv = document.getElementById("level")

window.addEventListener("storage", message_receive)

function message_receive(ev) {
    if (ev.key == "shadowlevel") {
        var message = ev.newValue
        console.log(message)

        canvasDiv.style.backgroundImage = "url(" + message + ")"

        /*levelImg.src = message
        levelImg.onload = function() {
            contextLevel.drawImage(
                levelImg,
                0,
                0,
                canvasLevel.width,
                canvasLevel.height,
            )
        }*/
    }
}
