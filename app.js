const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        };
        this.velocity = {
            x: 5,
            y: 0
        };
        this.invaders = [];
        
        const rows = Math.floor(Math.random() + 2);
        const cols = Math.floor(Math.random() * 3 + 2);

        this.width = cols * 150;

        for(let x = 0; x < cols; x++) {
            for(let y = 0; y < rows; y++) {
                this.invaders.push(
                    new ZInvader({
                        position: {
                            x: x * 150,
                            y: y * 150
                        }
                    })
                )
            }
        }
    }
    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.y = 0;

        if (this.position.x + this.width >= canvas.width ||
            this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 150;
        }
    }
}

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }
        this.rotation = 0;
        this.opacity = 1;
        const image = new Image();
        image.src = './images/tankUA.png';
        image.onload = () => {
            this.image = image;
            this.width = image.width;
            this.height = image.height;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
        }
    }

    draw() {
        if(this.image) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.translate(
                        player.position.x + player.width / 2, 
                        player.position.y + player.height / 2
                        );
            ctx.rotate(this.rotation)
            ctx.translate(
                -player.position.x - player.width / 2, 
                -player.position.y - player.height / 2
                );
            ctx.drawImage(
                this.image, 
                this.position.x, 
                this.position.y, 
                this.width, 
                this.height
            );
            ctx.restore();
        } 
    }

    update() {
        if(this.image) {
            this.draw();
            this.position.x += this.velocity.x
        }
    }
}

class ZInvader {
    constructor({position}) {
        this.velocity = {
            x: 0,
            y: 0
        }
        const image = new Image();
        image.src = './images/tankRU.png';
        image.onload = () => {
            this.image = image;
            this.width = image.width;
            this.height = image.height;
            this.position = {
                x: position.x,
                y: position.y
            }
        }
    }

    draw() {
        ctx.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        );
    } 
    
    update({velocity}) {
        if(this.image) {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0,
                y: 5
            }
        }))
    }
}

class Projectile {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 5;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Particle {
    constructor({position, velocity, radius, color}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.opacity = 1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.opacity -= 0.01;
    }
}

class InvaderProjectile {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.width = 5;
        this.height = 15;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        )
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}


const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];
const keys = {
    arrowLeft: {
        pressed: false
    },
    arrowRight: {
        pressed: false
    },
    space: {
        pressed: false
    }
}


let frames = 0;
let randomInterval = Math.floor(Math.random() * 500) + 500;
let game = {
    over: false,
    active: true
}

function createParticles({object, color}) {
    for(let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * 10,
            color: color || 'black'
        }))
    }
}
function animate() {
    if(!game.active) return
    requestAnimationFrame(animate);
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    particles.forEach((particle, i) => {
        if(particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(i, 1);
            }, 0);
        } else {
            particle.update();
        }
    })
    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (invaderProjectile.position.y + invaderProjectile.height >= 
            canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
            }, 0);
        } else {
            invaderProjectile.update();
        }
        // projectile hits player
        if(invaderProjectile.position.y + invaderProjectile.height >= 
            player.position.y && 
            invaderProjectile.position.x + invaderProjectile.width >= 
            player.position.x && 
            invaderProjectile.position.x <= player.position.x + player.width
        ) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
                player.opacity = 0;
                game.over = true;
            }, 0);

            setTimeout(() => {
                game.active = false;
            }, 2000);

            createParticles({
                object: player,
                color: 'yellow'
            });
        }
    });

    projectiles.forEach((projectile, index) => {
        if(projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0)
        } else {
            projectile.update();
        }
    });
    grids.forEach((grid, gridIndex) => {
        grid.update();
        //spawn projectiles
        if(frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }
        grid.invaders.forEach((invader, i) => {
            invader.update({velocity: grid.velocity});

            // projectiles hit enemy
            projectiles.forEach((projectile, j) => {
                if (
                    projectile.position.y - projectile.radius <= invader.position.y + invader.height && 
                    projectile.position.x + projectile.radius >= invader.position.x && 
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width && projectile.position.y + projectile.radius >= invader.position.y 
                ) {
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find(
                            (invader2) => invader2 === invader
                        );
                        const projectileFound = projectiles.find(
                            (projectile2) => projectile2 === projectile
                        );
                        if(invaderFound && projectileFound) {
                            createParticles({
                                object: invader,
                            });
                            grid.invaders.splice(i, 1);
                            projectiles.splice(j, 1);

                            if(grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0];
                                const lastInvader = grid.invaders[grid.invaders.length - 1];

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                grid.position.x = firstInvader.position.x;
                            } else {
                                grids.splice(gridIndex, 1);
                            }
                        }

                    }, 0);

                }
            })
        })
    })
    if (keys.arrowLeft.pressed && player.position.x > 0) {
        player.velocity.x = -10;
        player.rotation = -0.2;
    } else if (keys.arrowRight.pressed && player.position.x < canvas.width - player.width) {
        player.velocity.x = 10;
        player.rotation = 0.2;
    } else {
        player.velocity.x = 0;
        player.rotation = 0;
    }

    if(frames % randomInterval === 0) {
        grids.push(new Grid());
        randomInterval = Math.floor(Math.random() * 500) + 500;
        frames = 0;
    }

    frames++;
}

animate();

window.addEventListener('keydown', ({key}) => {
    if(game.over) return 
    switch(key) {
        case 'ArrowLeft':
            keys.arrowLeft.pressed = true;
            break;
        case 'ArrowRight':
            keys.arrowRight.pressed = true;
            break;
        case ' ':
            keys.space.pressed = true;
            projectiles.push(
                new Projectile({
                    position: {
                        x: player.position.x + player.width / 2,
                        y: player.position.y,
                    },
                    velocity: {
                        x: 0,
                        y: -5
                    }
            }))
            break;
    }
});

window.addEventListener('keyup', ({key}) => {
    switch(key) {
        case 'ArrowLeft':
            keys.arrowLeft.pressed = false;
            break;
        case 'ArrowRight':
            keys.arrowRight.pressed = false;
            break;
        case ' ':
            keys.space.pressed = false;
            break;
    }
});