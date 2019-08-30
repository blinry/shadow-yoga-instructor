//const levelImg = document.getElementById("levelImg")

const canvasDiv = document.getElementById("level")
const winDiv = document.getElementById("win")
//const loseDiv = document.getElementById("lose")

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
    } else if (ev.key == "shadowwin") {
        let percent = Math.min(Math.max(ev.newValue, 0), 1) * 100
        winDiv.style.height = percent + "vh"
        console.log(percent)
    }
}
