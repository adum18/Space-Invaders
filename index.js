const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const keyMap = new Map();
window.addEventListener('keydown', ({ key }) => {
    keyMap.set(key, true);
})
window.addEventListener('keyup', ({ key }) => {
    keyMap.delete(key);
})

const game = {
    over: false
}

class Player {
    constructor() {
        this.position = {
            x: canvas.width / 2,
            y: 490
        }

        this.velocity = {
            x: 0,
            y: 0
        }

        this.image = new Image();
        this.image.src = './img/spaceship.jpg';

        this.width = 35;
        this.height = 35;

        this.nextShot = performance.now();
    }

    draw() {
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        if (this.image) this.draw();
        if (keyMap.get('a')) this.velocity.x = -5;
        if (keyMap.get('d')) this.velocity.x = 5;
        this.position.x += this.velocity.x;
        this.velocity.x = 0;
        if (keyMap.get(' ')) this.fire();
        
    }

    fire() {
        if (this.nextShot > performance.now()) return;
        projectiles.push(new Projectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y
            },
            velocity: {
                x: 0,
                y: -5
            }
        }));
        this.nextShot = performance.now() + 300;
    }
}

class Projectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 3;
    }

    draw() {
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = 'red';
        context.fill();
        context.closePath;
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = {
            x: position.x,
            y: position.y
        }

        this.velocity = {
            x: velocity.x,
            y: velocity.y
        }
        this.width = 3;
        this.height = 10;
    }

    draw() {
        context.fillStyle = 'white';
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        if (game.over) return;
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Invader {
    constructor({ position }) {
        this.position = {
            x: position.x,
            y: position.y
        }

        this.velocity = {
            x: 0,
            y: 0
        }


        const image = new Image();
        image.src = './img/invader.jpg';

        this.image = image;
        this.width = 35;
        this.height = 35;
    }

    draw() {
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    update({ velocity }) {
        if (game.over) return;
        if (this.image) {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x - this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0,
                y: 5
            }
        }))
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }

        this.velocity = {
            x: 5,
            y: 0
        }

        this.invaders = [];

        const rows = Math.floor(Math.random() * 4) + 1;
        const columns = Math.floor(Math.random() * 5) + 1;
        this.width = columns * 40;
        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                this.invaders.push(new Invader({
                    position: {
                        x: i * 40,
                        y: j * 40
                    }
                }));
            }
        }
    }

    update() {
        if (game.over) return;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.velocity.y = 0;

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 30;
        }
    }
}


const player = [new Player()];
const grids = [];
const projectiles = [];
const invaderProjectiles = [];

let frames = 0;

function animate() {
    requestAnimationFrame(animate);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    player.forEach(playerindex => {
        playerindex.update();
        invaderProjectiles.forEach((invaderProjectile, index) => {
            invaderProjectile.update();
            if (invaderProjectile.position.y + invaderProjectile.height >= canvas.width) {
                    invaderProjectiles.splice(index, 1);
            } else {
                invaderProjectile.update();
            }
            if (invaderProjectile.position.y + invaderProjectile.height >= playerindex.position.y &&
                invaderProjectile.position.x + invaderProjectile.width >= playerindex.position.x &&
                invaderProjectile.position.x <= playerindex.position.x + playerindex.width
                ) {
                player.splice(playerindex, 1);
                game.over = true;
            }
        })
    })
    
    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
                projectiles.splice(index, 1);
        } else {
            projectile.update();
        }


    })
    grids.forEach((grid) => {
        grid.update();
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
        }
        grid.invaders.forEach((invader, i) => {
            invader.update({
                velocity: grid.velocity
            });

            projectiles.forEach((projectile, j) => {
                if (projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width) {
                        const invaderFound = grid.invaders.find(invader2 => {
                            return invader2 === invader
                        })

                        const projectileFound = projectiles.find(projectile2 => {
                            return projectile2 === projectile;
                        })

                        if (invaderFound && projectileFound) {
                            grid.invaders.splice(i, 1);
                            projectiles.splice(j, 1);
                        }
                }
            })
        })
    })


    if (frames % 400 === 0) {
        if (game.over) return;
        grids.push(new Grid());
    }

    frames++;

}



animate();