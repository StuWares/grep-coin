    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
    import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.9.1/firebase-auth.js'
    import { getDatabase, ref, set, onDisconnect } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-database.js"
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries
    import { createName, playerColours } from "./helpers.js"
    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDBsqbO2N5byFKoXdpV1vswuZvXIQYQPDs",
        authDomain: "coin-grepper.firebaseapp.com",
        databaseURL: "https://coin-grepper-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "coin-grepper",
        storageBucket: "coin-grepper.appspot.com",
        messagingSenderId: "234885842533",
        appId: "1:234885842533:web:39a356825611dcab5c688c"
    };
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const db = getDatabase();

    let playerId;
    let playerRef;

// Start Phaser stuff
class mainScene {

    preload() {
        this.load.image('player', 'assets/player.png');
        this.load.image('coin', 'assets/coin.png');

    }
    create() {

        // Check if user is logged in, if so set uid = user.uid
        onAuthStateChanged(auth, (user) => {
            console.log(user);
            if (user) {
              playerId = user.uid;

              const name = createName();

              set(ref(db, 'players/' + playerId), {
                id: playerId,
                name: name,
                color: playerColours(),
                x: 3,
                y: 3,
                coins: 0,
              });
              
              playerRef = ref(db, 'players/' + playerId);
              // delete player from firebase when they logout
              onDisconnect(playerRef).remove();

            } else {
              // User is signed out
              // ...
            }
        });

        signInAnonymously(auth)
            .then(() => {
        // Signed in..
        })
        .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log(errorCode, errorMessage);
        });

        this.player = this.physics.add.sprite(100,100, 'player');
        this.coin = this.physics.add.sprite(300,300, 'coin');

        this.score = 0;

        let style = { font: '20px Arial', fill: '#fff'};

        this.scoreText = this.add.text(20,20, 'score: ' + this.score, style);

        this.arrow = this.input.keyboard.createCursorKeys();

    }
    update() {

        if (this.physics.overlap(this.player, this.coin)) {
            this.hit();
        }

        // Horizontal movement
        if (this.arrow.right.isDown) {
            this.player.x += 3;
        } else if (this.arrow.left.isDown) {
            this.player.x -= 3;
        }
        // Vertical movement
        if (this.arrow.down.isDown) {
            this.player.y += 3;
        } else if (this.arrow.up.isDown) {
            this.player.y -= 3;
        }

    }

    hit() {
        this.coin.x = Phaser.Math.Between(100,600);
        this.coin.y = Phaser.Math.Between(100,300);

        this.score += 10;

        this.scoreText.setText('score: ' + this.score);

        this.tweens.add({
            targets: this.player,
            duration: 200,
            scaleX: 1.2,
            scaleY: 1.2,
            yoyo: true
        });
    }

}

new Phaser.Game({
    width: 700,
    height: 400,
    backgroundColor: '#e57200',
    scene: mainScene,
    physics: { default: 'arcade'},
    parent: 'game'
});