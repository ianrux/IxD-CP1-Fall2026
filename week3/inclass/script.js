let thisPage = document.getElementById("docBody")
        let colorBtn = document.getElementById("colorChange")
        let textBtn = document.getElementById("addText")
        let toggleBtn = document.getElementById("toggleBtn")
        
        let changingColor = () => {
            let redC = Math.random() * 255
            let greenC = Math.random() * 255
            let blueC = Math.random() * 255

            thisPage.style.backgroundColor = "rgb(" + redC + ", " + greenC + " , " + blueC + ")"

        }

        let addingText = () => {
            console.log("Firing!")
            let textRecepticle = document.getElementById("textArea")

            let newElem = document.createElement("p")
            console.log(newElem) //fundamental debugging strategy, not great but good enough
            newElem.innerHTML = "Do you see any Teletubbies in here? Do you see a slender plastic tag clipped to my shirt with my name printed on it? Do you see a little Asian child with a blank expression on his face sitting outside on a mechanical helicopter that shakes when you put quarters in it? No? Well, that's what you see at a toy store. And you must think you're in a toy store, because you're here shopping for an infant named Jeb."

            textRecepticle.appendChild("newElem")
        }

        let togglingImage = (event) => {
            console.log(event)

            let imgTT = document.getElementById("imagetoToggle")
            
            if(imgTT.alt == "Quokka grabbing dinner"){
                imgTT.alt = "Second Quokka Image"
                imgTT.src = "images/quokka2.jpeg"
            }
            else{
                imgTT.alt = "Quokka grabbing dinner"
                imgTT.src = "images/quokka1.jpeg"
            }

            //console.log(imgTT)
        }

        console.log(imgTT)

        imgTT.addEventListener("click",togglingImage)
        colorBtn.addEventListener("click", changingColor)
        textBtn.addEventListener("click", addingText)
        toggleBtn.addEventListener("click", togglingImage)