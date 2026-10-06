
// constant (cannot be reassigned) then the variable name
// Remember variables start at 0, not 1
// Do camelCase for variables with multiple words *make sure no spaces (space is a character)

const rounds = [
    {
        correct: 2, // Where Chicken Photo
        images: [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSik3FSIpyCYpb4qFO-CweieGjgadhKxEYiF54TP8LjlqiYB5KrV4tJ41E&s=10",
            "https://elements-resized.envatousercontent.com/elements-video-cover-images/files/fdf8fedc-5b7a-468a-8de0-3b83c32b0976/inline_image_preview.jpg?w=500&cf_fit=cover&q=85&format=auto&s=2d54f3f48d27ad6c4979db4c385bdbaf8f401f695834ae9e2c000dddb7d1e022",
            "https://cdn.britannica.com/07/183407-050-C35648B5/Chicken.jpg"
        ]
    },
    {
        correct: 0, // Where Chicken Photo
        images: [
            "https://t4.ftcdn.net/jpg/05/97/75/29/360_F_597752965_kt6hxPlxgSHcFL5I0h0bMzRHIjjsUOb9.jpg",
            "https://graphdes.com/wp-content/uploads/2012/02/tumblr_lyuhqb3e9n1ro09hco1_500.jpg?w=595",
            "https://i.pinimg.com/originals/68/1c/6f/681c6fe99d869c29caf0c75d91941e75.jpg?nii=t"
        ]
    },
    {
        correct: 1, // Where Chicken Photo
        images: [
            "https://i.pinimg.com/736x/97/df/c4/97dfc4611a90c3cca3399b46b692933a.jpg",
            "https://i.etsystatic.com/42668798/r/il/3e3c2d/5341306656/il_1588xN.5341306656_ja22.jpg",
            "https://m.media-amazon.com/images/I/81Yapp1x97L._AC_UF894,1000_QL80_.jpg"
        ]
    }
    ];

// Wrong Responses (10 so far)
const wrongSentences = [
"Have you ever seen a chicken before?",
"I'm actually starting to get worried about you",
"Oh so close... besides those 16 differences you would've had it!",
"Are we for real?",
"Just close the page. I won't tell anybody..",
"Cluck, cluck... out of luck",
"Would your parents be proud of that pick?",
"Hint: Chickens have a beak, feathers, and not whatever you picked",
"I once had confidence in you.",
"Ach komm schon, Mann, Scheiße!"
];

let currentRound = 0;

function loadRound() {
    const container = document.getElementById("imageContainer");
    const message = document.getElementById("message");
    message.textContent = "";
    container.innerHTML = "";

    // All rounds finished
    if (currentRound >= rounds.length) {
        document.getElementById("roundLabel").textContent = "";
        message.textContent = "🎉 You Know Your Chickens!";
        return;
    }

    document.getElementById("roundLabel").textContent =
        "Round " + (currentRound + 1) + " of " + rounds.length;

    rounds[currentRound].images.forEach(function (src, index) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "Image " + (index + 1);
        img.onclick = function () { checkAnswer(index, src); };
        container.appendChild(img);
    });
}


// Response sounds
const bellSound1 = new Audio("correct.mp3")
const bellSound2 = new Audio("wrong.mp3")

// Time before image switch when correct (milliseconds)
const CORRECT_DELAY = 2000;

// Blocks extra clicks while we're waiting to move to the next round
let locked = false;

// Remembers which wrong-answer reply was shown last
let lastWrongIndex = -1; //-1 because

function checkAnswer(clickedIndex, imageSrc) {
    if (locked) return;

    // Show the clicked image in the box at the bottom
    document.getElementById("largeImage").src = imageSrc;

    
    // All If statements for true (Response and Sound)
    // Sounds from Pixabay
    if (clickedIndex === rounds[currentRound].correct) {
        locked = true;
        
        //Right answer sound
        bellSound1.currentTime = 0;
        bellSound1.play();
        document.getElementById("message").textContent = "✅ Correct! Next round coming up...";

        // Wait, then go to the next set of 3 images
        setTimeout(function () {
            currentRound++; // ++ means
            locked = false;
            loadRound();
        }, CORRECT_DELAY);

    } 
    
    // All If statements for false (Response and Sound)
    else {
        
        // Wrong answer sound
        bellSound2.currentTime = 0;
        bellSound2.play();

        // Pick a random reply, but never the same one twice in a row
        let random;
        do {
            random = Math.floor(Math.random() * wrongSentences.length);
        } while (random === lastWrongIndex);
        lastWrongIndex = random;
        document.getElementById("message").textContent = wrongSentences[random];
    }

    //Play correct sound
    if (index === rounds[currentRound].correct) {
        bellSound1.play();
        currentRound++;
        loadRound()
    }

    //Play wrong sound
    else {
       bellSound2.play(); 

    }
}

loadRound();