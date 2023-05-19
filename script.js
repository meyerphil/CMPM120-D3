class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }
    preload(){

    }
    create(){
        this.cameras.main.setBackgroundColor(0x00aa00);
        this.add.text(200, 100, ("Wacky Pins!")).setFontSize(200);
        this.add.text(450, 300, ("Knock them all Down!")).setFontSize(50);
        this.add.text(600, 400, ("4 levels included.")).setFontSize(25);
        this.add.text(50, 900, ("Drag from ball, then release to launch in opposite direction.")).setFontSize(40);

            let start = this.add.text(550, 600, ("Start Game")).setFontSize(75);
            start.setInteractive();

            start.on('pointerdown', ()=>{
                this.game.results.level = 1;
                console.log("level " + this.game.results.level + " start");
                this.scene.stop();
                this.scene.start('Level' + this.game.results.level);
            });
    }
    update(){
        //this.player.update();
    }
}


class Ball extends Phaser.GameObjects.Arc {
    constructor(scene, x, y, radius, color) {
        super(scene, x, y, radius, 0, 360, false, color);
        scene.add.existing(this);
        scene.matter.add.gameObject(this, { shape: 'circle' });
        this.setBounce(0.8);
        this.setDepth(10);
        this.setInteractive();
        let initPos = null;
        let endPos = null;
        // Set up click event listener
        this.on('pointerdown', (pointer)=>{
            initPos = {x: pointer.x, y: pointer.y};
            console.log(initPos);
        });
        this.scene.input.on('pointerup', (pointer)=>{
            if(initPos){
            endPos = {x: pointer.x, y: pointer.y};
            console.log(endPos);
            const distanceX = initPos.x - endPos.x;
            const distanceY = initPos.y - endPos.y;
            let launchSpeed = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            launchSpeed = Phaser.Math.Clamp(launchSpeed, 0, 250);

            const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.x, pointer.y);
            const velocityX = launchSpeed * Math.cos(angle);
            const velocityY = launchSpeed * Math.sin(angle);
            
            console.log(-velocityX + " " + -velocityY);
            this.setVelocityX(velocityX * -0.1);
            this.setVelocityY(velocityY * -0.1);
            initPos = null;

            this.scene.launch();
            }
        });
    }
  
  }

  

// Scene 1 class
class Level1 extends Phaser.Scene {
    constructor() {
      super('Level1');
    }
    
    create(){

        this.cameras.main.setBackgroundColor(0xffffff);
        
        this.matter.world.setBounds(0, 0, game.config.width, game.config.height); // Set the bounds of the Matter world

        // create ball
        this.ballsLeft = 2;
        this.ball = new Ball(this, 400, 450, 40, 0x6666ff);

        
        // // create world
        this.add.rectangle(200,200,1200,500, 0x00aa00).setOrigin(0,0);
        this.matter.add.gameObject(this.add.rectangle(1400,450,60,500, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        this.matter.add.gameObject(this.add.rectangle(200,450,60,500, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        this.matter.add.gameObject(this.add.rectangle(800,700,1200,50, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        this.matter.add.gameObject(this.add.rectangle(800,200,1200,50, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        
        // // create pins
        this.createPins(600,100,90);



    }

    createPins(x,y,deg){
        // Create a group to hold the circles
        this.circlesGroup = this.add.group();
        this.pinsLeft = 10;

        // Define default pin formation
        const circlePositions = [
            { x: 400, y: 300 },
            { x: 375, y: 250 },
            { x: 425, y: 250 },
            { x: 350, y: 200 },
            { x: 400, y: 200 },
            { x: 450, y: 200 },
            { x: 325, y: 150 },
            { x: 375, y: 150 },
            { x: 425, y: 150 },
            { x: 475, y: 150 }
        ];
        const circleRadius = 20;

        
        // Rotate the circle positions by 90 degrees and transform
        const rotationAngle = Phaser.Math.DegToRad(deg);
        circlePositions.forEach(position => {
            const rotatedX = Math.cos(rotationAngle) * (position.x - 400) - Math.sin(rotationAngle) * (position.y - 350) + 400;
            const rotatedY = Math.sin(rotationAngle) * (position.x - 400) + Math.cos(rotationAngle) * (position.y - 350) + 350;
            position.x = rotatedX + x;
            position.y = rotatedY + y;
        });

        // Add the circles to the scene
        for (let i = 0; i < circlePositions.length; i++) {
            const circle = this.add.circle(circlePositions[i].x, circlePositions[i].y, circleRadius, 0xffffff).setStrokeStyle(4, 0xff0000);
            this.circlesGroup.add(circle);
            this.matter.add.gameObject(circle, { shape: 'circle', mass: 2 });
        }
    }

    launch(){
        // get init. pos
        let initialPositions = [];

        this.circlesGroup.getChildren().forEach(circle => {
            initialPositions.push({ x: circle.x, y: circle.y });
            //console.log(`Circle at (${circle.x}, ${circle.y})`);
        });

        setTimeout(()=> {
            let toDelete = [];
            this.circlesGroup.getChildren().forEach((circle, index) => {
                const initialPos = initialPositions[index];
                const currentPos = { x: circle.x, y: circle.y };
                const distance = Phaser.Math.Distance.Between(initialPos.x, initialPos.y, currentPos.x, currentPos.y);
                console.log(`Circle ${index + 1}: Initial position (${initialPos.x}, ${initialPos.y}), Current position (${currentPos.x}, ${currentPos.y}), Distance: ${distance}`);
                if (distance > 20) { //delete pin
                    toDelete.push(circle);
                    console.log(`Circle ${index + 1} marked to be deleted.`);
                } else { // reset pin
                    circle.x = initialPos.x;
                    circle.y = initialPos.y;
                    circle.setVelocityX(0);
                    circle.setVelocityY(0);
                }
            });

            toDelete.forEach(pin => {
                pin.destroy();
                this.pinsLeft--;
            });

            console.log(this.pinsLeft + 'pins left');
            this.resetBall();
            if(this.pinsLeft == 0){
                this.resultScreen();
            }

        }, 3000);
    }

    resetBall(){
        this.ballsLeft--;
        console.log("balls left:" + this.ballsLeft);
        if(this.ballsLeft == 0){
            this.resultScreen();
        }

        this.ball.x = 400;
        this.ball.y = 450;
        this.ball.setVelocityX(0);
        this.ball.setVelocityY(0);

    }

    resultScreen(){
        this.scene.stop();
        this.scene.start('Results', {pinsLeft: this.pinsLeft, ballsLeft: this.ballsLeft});
    }

    update(){

    }

}

// Scene 2 class
class Level2 extends Phaser.Scene {
    constructor() {
      super('Level2');
    }
    
    create(){

        this.cameras.main.setBackgroundColor(0xffffff);
        
        this.matter.world.setBounds(0, 0, game.config.width, game.config.height); // Set the bounds of the Matter world

        // create ball
        this.ballsLeft = 2;
        this.ball = new Ball(this, 400, 600, 40, 0x6666ff);

        
        // // create world
        this.add.rectangle(70,500,900,500, 0x00aa00).setOrigin(0,0).setAngle(-32);
        this.add.rectangle(900,100,800,500, 0x00aa00).setOrigin(0,0).setAngle(32);
        this.matter.add.gameObject(this.add.rectangle(450,300,60,900, 0xaaaaaa), {isStatic: true, angle: 45});
        this.matter.add.gameObject(this.add.rectangle(550,780,60,700, 0xaaaaaa), {isStatic: true, angle: 45});
        
        this.matter.add.gameObject(this.add.rectangle(1150,300,60,900, 0xaaaaaa), {isStatic: true, angle: -45});
        this.matter.add.gameObject(this.add.rectangle(1100,780,60,700, 0xaaaaaa), {isStatic: true, angle: -45});

        this.matter.add.gameObject(this.add.rectangle(1400,730,60,500, 0xaaaaaa), {isStatic: true, angle: 10});
        this.matter.add.gameObject(this.add.rectangle(200,730,60,500, 0xaaaaaa), {isStatic: true, angle: -10});


        // // create pins
        this.createPins(800,400,0);



    }

    createPins(x,y,deg){
        // Create a group to hold the circles
        this.circlesGroup = this.add.group();
        this.pinsLeft = 10;

        // Define default pin formation
        const circlePositions = [
            { x: 400, y: 300 },
            { x: 375, y: 250 },
            { x: 425, y: 250 },
            { x: 350, y: 200 },
            { x: 400, y: 200 },
            { x: 450, y: 200 },
            { x: 325, y: 150 },
            { x: 375, y: 150 },
            { x: 425, y: 150 },
            { x: 475, y: 150 }
        ];
        const circleRadius = 20;

        
        // Rotate the circle positions by 90 degrees and transform
        const rotationAngle = Phaser.Math.DegToRad(deg);
        circlePositions.forEach(position => {
            const rotatedX = Math.cos(rotationAngle) * (position.x - 400) - Math.sin(rotationAngle) * (position.y - 350) + 400;
            const rotatedY = Math.sin(rotationAngle) * (position.x - 400) + Math.cos(rotationAngle) * (position.y - 350) + 350;
            position.x = rotatedX + x;
            position.y = rotatedY + y;
        });

        // Add the circles to the scene
        for (let i = 0; i < circlePositions.length; i++) {
            const circle = this.add.circle(circlePositions[i].x, circlePositions[i].y, circleRadius, 0xffffff).setStrokeStyle(4, 0xff0000);
            this.circlesGroup.add(circle);
            this.matter.add.gameObject(circle, { shape: 'circle', mass: 2 });
        }
    }

    launch(){
        // get init. pos
        let initialPositions = [];

        this.circlesGroup.getChildren().forEach(circle => {
            initialPositions.push({ x: circle.x, y: circle.y });
            //console.log(`Circle at (${circle.x}, ${circle.y})`);
        });

        setTimeout(()=> {
            let toDelete = [];
            this.circlesGroup.getChildren().forEach((circle, index) => {
                const initialPos = initialPositions[index];
                const currentPos = { x: circle.x, y: circle.y };
                const distance = Phaser.Math.Distance.Between(initialPos.x, initialPos.y, currentPos.x, currentPos.y);
                console.log(`Circle ${index + 1}: Initial position (${initialPos.x}, ${initialPos.y}), Current position (${currentPos.x}, ${currentPos.y}), Distance: ${distance}`);
                if (distance > 20) { //delete pin
                    toDelete.push(circle);
                    console.log(`Circle ${index + 1} marked to be deleted.`);
                } else { // reset pin
                    circle.x = initialPos.x;
                    circle.y = initialPos.y;
                    circle.setVelocityX(0);
                    circle.setVelocityY(0);
                }
            });

            toDelete.forEach(pin => {
                pin.destroy();
                this.pinsLeft--;
            });

            console.log(this.pinsLeft + 'pins left');
            this.resetBall();
            if(this.pinsLeft == 0){
                this.resultScreen();
            }

        }, 3000);
    }

    resetBall(){
        this.ballsLeft--;
        console.log("balls left:" + this.ballsLeft);
        if(this.ballsLeft == 0){
            this.resultScreen();
        }

        this.ball.x = 400;
        this.ball.y = 600;
        this.ball.setVelocityX(0);
        this.ball.setVelocityY(0);

    }

    resultScreen(){
        this.scene.stop();
        this.scene.start('Results', {pinsLeft: this.pinsLeft, ballsLeft: this.ballsLeft});
    }

    update(){

    }

}

// Scene 3 class
class Level3 extends Phaser.Scene {
    constructor() {
      super('Level3');
    }
    
    create(){

        this.cameras.main.setBackgroundColor(0xffffff);
        
        this.matter.world.setBounds(0, 0, game.config.width, game.config.height); // Set the bounds of the Matter world

        // create ball
        this.ballsLeft = 2;
        this.ball = new Ball(this, 550, 250, 40, 0x6666ff);

        
        // // create world
        this.add.rectangle(200,50,1200,900, 0x00aa00).setOrigin(0,0);
        this.matter.add.gameObject(this.add.rectangle(1400,500,60,900, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        this.matter.add.gameObject(this.add.rectangle(200,500,60,900, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        this.matter.add.gameObject(this.add.rectangle(575,500,700,50, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        this.matter.add.gameObject(this.add.rectangle(800,925,1200,50, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        this.matter.add.gameObject(this.add.rectangle(800,50,1200,50, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        
        // // create pins
        this.createPins(300,375,-90);



    }

    createPins(x,y,deg){
        // Create a group to hold the circles
        this.circlesGroup = this.add.group();
        this.pinsLeft = 10;

        // Define default pin formation
        const circlePositions = [
            { x: 400, y: 300 },
            { x: 375, y: 250 },
            { x: 425, y: 250 },
            { x: 350, y: 200 },
            { x: 400, y: 200 },
            { x: 450, y: 200 },
            { x: 325, y: 150 },
            { x: 375, y: 150 },
            { x: 425, y: 150 },
            { x: 475, y: 150 }
        ];
        const circleRadius = 20;

        
        // Rotate the circle positions by 90 degrees and transform
        const rotationAngle = Phaser.Math.DegToRad(deg);
        circlePositions.forEach(position => {
            const rotatedX = Math.cos(rotationAngle) * (position.x - 400) - Math.sin(rotationAngle) * (position.y - 350) + 400;
            const rotatedY = Math.sin(rotationAngle) * (position.x - 400) + Math.cos(rotationAngle) * (position.y - 350) + 350;
            position.x = rotatedX + x;
            position.y = rotatedY + y;
        });

        // Add the circles to the scene
        for (let i = 0; i < circlePositions.length; i++) {
            const circle = this.add.circle(circlePositions[i].x, circlePositions[i].y, circleRadius, 0xffffff).setStrokeStyle(4, 0xff0000);
            this.circlesGroup.add(circle);
            this.matter.add.gameObject(circle, { shape: 'circle', mass: 2 });
        }
    }

    launch(){
        // get init. pos
        let initialPositions = [];

        this.circlesGroup.getChildren().forEach(circle => {
            initialPositions.push({ x: circle.x, y: circle.y });
            //console.log(`Circle at (${circle.x}, ${circle.y})`);
        });

        setTimeout(()=> {
            let toDelete = [];
            this.circlesGroup.getChildren().forEach((circle, index) => {
                const initialPos = initialPositions[index];
                const currentPos = { x: circle.x, y: circle.y };
                const distance = Phaser.Math.Distance.Between(initialPos.x, initialPos.y, currentPos.x, currentPos.y);
                console.log(`Circle ${index + 1}: Initial position (${initialPos.x}, ${initialPos.y}), Current position (${currentPos.x}, ${currentPos.y}), Distance: ${distance}`);
                if (distance > 20) { //delete pin
                    toDelete.push(circle);
                    console.log(`Circle ${index + 1} marked to be deleted.`);
                } else { // reset pin
                    circle.x = initialPos.x;
                    circle.y = initialPos.y;
                    circle.setVelocityX(0);
                    circle.setVelocityY(0);
                }
            });

            toDelete.forEach(pin => {
                pin.destroy();
                this.pinsLeft--;
            });

            console.log(this.pinsLeft + 'pins left');
            this.resetBall();
            if(this.pinsLeft == 0){
                this.resultScreen();
            }

        }, 3000);
    }

    resetBall(){
        this.ballsLeft--;
        console.log("balls left:" + this.ballsLeft);
        if(this.ballsLeft == 0){
            this.resultScreen();
        }

        this.ball.x = 550;
        this.ball.y = 250;
        this.ball.setVelocityX(0);
        this.ball.setVelocityY(0);

    }

    resultScreen(){
        this.scene.stop();
        this.scene.start('Results', {pinsLeft: this.pinsLeft, ballsLeft: this.ballsLeft});
    }

    update(){

    }

}

// Scene 4 class
class Level4 extends Phaser.Scene {
    constructor() {
      super('Level4');
    }
    
    create(){

        this.cameras.main.setBackgroundColor(0xffffff);
        
        this.matter.world.setBounds(0, 0, game.config.width, game.config.height); // Set the bounds of the Matter world

        // create ball
        this.ballsLeft = 2;
        this.ball = new Ball(this, 1150, 250, 40, 0x6666ff);

        
        // // create world
        this.add.rectangle(900,50, 500,325, 0x00aa00).setOrigin(0,0);
        this.add.rectangle(200,370,1200,325, 0x00aa00).setOrigin(0,0);
        this.add.rectangle(200,600, 500,325, 0x00aa00).setOrigin(0,0);

        this.matter.add.gameObject(this.add.rectangle(1400,400,60,650, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        this.matter.add.gameObject(this.add.rectangle(200,650,60,600, 0xaaaaaa).setOrigin(0,0), {isStatic: true});

        this.matter.add.gameObject(this.add.rectangle(550,350,700,50, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        this.matter.add.gameObject(this.add.rectangle(1050,700,700,50, 0xaaaaaa).setOrigin(0,0), {isStatic: true});

        this.matter.add.gameObject(this.add.rectangle(725,820,60,250, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        this.matter.add.gameObject(this.add.rectangle(870,200,60,275, 0xaaaaaa).setOrigin(0,0), {isStatic: true});

        this.matter.add.gameObject(this.add.rectangle(450,925,500,50, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        this.matter.add.gameObject(this.add.rectangle(1150,50,500,50, 0xaaaaaa).setOrigin(0,0), {isStatic: true});
        
        // // create pins
        this.createPins(70,250,180);



    }

    createPins(x,y,deg){
        // Create a group to hold the circles
        this.circlesGroup = this.add.group();
        this.pinsLeft = 10;

        // Define default pin formation
        const circlePositions = [
            { x: 400, y: 300 },
            { x: 375, y: 250 },
            { x: 425, y: 250 },
            { x: 350, y: 200 },
            { x: 400, y: 200 },
            { x: 450, y: 200 },
            { x: 325, y: 150 },
            { x: 375, y: 150 },
            { x: 425, y: 150 },
            { x: 475, y: 150 }
        ];
        const circleRadius = 20;

        
        // Rotate the circle positions by 90 degrees and transform
        const rotationAngle = Phaser.Math.DegToRad(deg);
        circlePositions.forEach(position => {
            const rotatedX = Math.cos(rotationAngle) * (position.x - 400) - Math.sin(rotationAngle) * (position.y - 350) + 400;
            const rotatedY = Math.sin(rotationAngle) * (position.x - 400) + Math.cos(rotationAngle) * (position.y - 350) + 350;
            position.x = rotatedX + x;
            position.y = rotatedY + y;
        });

        // Add the circles to the scene
        for (let i = 0; i < circlePositions.length; i++) {
            const circle = this.add.circle(circlePositions[i].x, circlePositions[i].y, circleRadius, 0xffffff).setStrokeStyle(4, 0xff0000);
            this.circlesGroup.add(circle);
            this.matter.add.gameObject(circle, { shape: 'circle', mass: 2 });
        }
    }

    launch(){
        // get init. pos
        let initialPositions = [];

        this.circlesGroup.getChildren().forEach(circle => {
            initialPositions.push({ x: circle.x, y: circle.y });
            //console.log(`Circle at (${circle.x}, ${circle.y})`);
        });

        setTimeout(()=> {
            let toDelete = [];
            this.circlesGroup.getChildren().forEach((circle, index) => {
                const initialPos = initialPositions[index];
                const currentPos = { x: circle.x, y: circle.y };
                const distance = Phaser.Math.Distance.Between(initialPos.x, initialPos.y, currentPos.x, currentPos.y);
                console.log(`Circle ${index + 1}: Initial position (${initialPos.x}, ${initialPos.y}), Current position (${currentPos.x}, ${currentPos.y}), Distance: ${distance}`);
                if (distance > 20) { //delete pin
                    toDelete.push(circle);
                    console.log(`Circle ${index + 1} marked to be deleted.`);
                } else { // reset pin
                    circle.x = initialPos.x;
                    circle.y = initialPos.y;
                    circle.setVelocityX(0);
                    circle.setVelocityY(0);
                }
            });

            toDelete.forEach(pin => {
                pin.destroy();
                this.pinsLeft--;
            });

            console.log(this.pinsLeft + 'pins left');
            this.resetBall();
            if(this.pinsLeft == 0){
                this.resultScreen();
            }

        }, 3000);
    }

    resetBall(){
        this.ballsLeft--;
        console.log("balls left:" + this.ballsLeft);
        if(this.ballsLeft == 0){
            this.resultScreen();
        }

        this.ball.x = 1150;
        this.ball.y = 250;
        this.ball.setVelocityX(0);
        this.ball.setVelocityY(0);

    }

    resultScreen(){
        this.scene.stop();
        this.scene.start('Results', {pinsLeft: this.pinsLeft, ballsLeft: this.ballsLeft});
    }

    update(){

    }

}

class Results extends Phaser.Scene {
    constructor() {
      super('Results');
      
    }
    init(data) {
        console.log(data);
        this.ballsThrown = 2 - data.ballsLeft; 
        this.pinsHit = 10 - data.pinsLeft; 
    }
    
    create(){
        this.cameras.main.setBackgroundColor(0x00aa00);
        this.add.text(600, 100, ("Level " + this.game.results.level + " complete.")).setFontSize(50);
        this.add.text(600, 300, ("Pins hit: " + this.pinsHit + "/10")).setFontSize(50);
        this.add.text(600, 400, ("Balls thrown: " + this.ballsThrown)).setFontSize(50);

        if(this.game.results.level == 4){
            this.add.text(200, 600, ("Congrats! You beat all 4 levels!")).setFontSize(50);
            let menu = this.add.text(900, 800, ("Main Menu")).setFontSize(75);
            let restart = this.add.text(200, 800, ("Restart Level")).setFontSize(75);
            menu.setInteractive();

            menu.on('pointerdown', ()=>{
                this.scene.stop();
                this.scene.start('Start');
            });

            restart.setInteractive();

            restart.on('pointerdown', ()=>{
                console.log("level " + this.game.results.level + " restart");
                this.scene.stop();
                this.scene.start('Level' + this.game.results.level);
            });
        } else {
            let next = this.add.text(900, 800, ("Next Level")).setFontSize(75);
            let restart = this.add.text(200, 800, ("Restart Level")).setFontSize(75);
            next.setInteractive();

            next.on('pointerdown', ()=>{
                this.game.results.level++;
                console.log("level " + this.game.results.level + " start");
                this.scene.stop();
                this.scene.start('Level' + this.game.results.level);
            });

            restart.setInteractive();

            restart.on('pointerdown', ()=>{
                console.log("level " + this.game.results.level + " restart");
                this.scene.stop();
                this.scene.start('Level' + this.game.results.level);
            });
        }
    }
}

let config = {
    type: Phaser.WEBGL,
    width: 1600,
    height: 1000,
    backgroundColor: 0x000000,
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                x: 0,
                y: 0
            },
            //debug: true
        }
    },
    scene: [Start, Level1, Level2, Level3, Level4, Results],
}

let game = new Phaser.Game(config);
game.results = {
    level: 1
}