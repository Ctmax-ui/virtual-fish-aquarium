function getColorNameFromHSL(hsl) {
    function getColorName(hue) {
        if (hue >= 0 && hue < 15) return 'Red';
        else if (hue >= 15 && hue < 45) return 'Orange';
        else if (hue >= 45 && hue < 75) return 'Yellow';
        else if (hue >= 75 && hue < 165) return 'Green';
        else if (hue >= 165 && hue < 255) return 'Cyan';
        else if (hue >= 255 && hue < 330) return 'Blue';
        else if (hue >= 330 && hue < 360) return 'Purple';
        else return 'Unknown'; // Fallback
    }
    const hue = parseInt(hsl.match(/\d+/)[0]); // Match the first number which is the hue
    return getColorName(hue); // Use the previously defined function
}



const canvas = document.getElementById("aquarium");

        const ctx = canvas.getContext("2d");
        const getRandom = (min, max) => Math.random() * (max - min) + min;

        class Bubble {
            constructor() {
                this.x = getRandom(50, canvas.width - 50);
                this.y = canvas.height - 20;
                this.size = getRandom(3, 6);
                this.speed = getRandom(0.5, 1);
                this.alpha = 1;
            }

            update() {
                this.y -= this.speed;
                this.alpha -= 0.005;
                if (this.alpha <= 0) {
                    aquarium.removeBubble(this);
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(173, 216, 230, ${this.alpha})`;
                ctx.fill();
            }
        }

        class Food {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = 2;
                this.floatSpeed = .3;
                this.sinkSpeed = getRandom(0.1, 0.5);
                this.isFloating = true;
                this.lifeTime = 2000;
                this.eaten = false; // New property to track if the food is eaten
            }

            update() {
                if (this.isFloating) {
                    this.y -= this.floatSpeed;
                    if (Math.random() < 0.05) this.isFloating = false;
                } else {
                    this.y += this.sinkSpeed;
                }
                this.lifeTime -= 1;
                if (this.y > canvas.height - 10 || this.lifeTime <= 0) {
                    aquarium.removeFood(this);
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = "#AA1000";
                ctx.fill();
            }
        }

        class Fish {
            constructor() {
                this.x = getRandom(50, canvas.width - 50);
                this.y = getRandom(50, canvas.height - 50);
                this.size = getRandom(10, 20);
                this.color = `hsl(${Math.floor(getRandom(0, 360))}, 60%, 50%)`;
                this.name = getColorNameFromHSL(this.color);
                this.speed = 0.5;
                this.angle = getRandom(0, Math.PI * 2);
                this.targetFood = null;
                this.detectRadius = 100;
                this.boostSpeed = 2;
                this.isBoosting = false;
                this.foodEaten = 0;
                this.hunger = 50;
                this.level = getRandom(1, 5);
                this.maxLevel = 5;
                this.hungerDepleteDelay = 200;
                this.hungerFullWait = 100;
                this.gender = Math.random() > 0.5 ? 'Male' : 'Female';
            }

            findClosestFood(foods) {
                if (this.hunger >= 80) return;

                let closestDistance = this.detectRadius;
                this.targetFood = null;
                foods.forEach(food => {
                    const distance = Math.hypot(food.x - this.x, food.y - this.y);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        this.targetFood = food;
                    }
                });
            }

            rotateTowards(targetX, targetY) {
                const angleToTarget = Math.atan2(targetY - this.y, targetX - this.x);
                const angleDiff = angleToTarget - this.angle;
                this.angle += angleDiff * 0.05;
            }

            move() {
                if (this.hunger < 100) {
                    if (!this.targetFood || Math.random() < 0.01) {
                        aquarium.foodArray.length > 0 && this.findClosestFood(aquarium.foodArray);
                    }
                } else {
                    this.targetFood = null;
                }

                if (this.targetFood) {
                    this.rotateTowards(this.targetFood.x, this.targetFood.y);
                    if (Math.random() < 0.1) this.isBoosting = true;
                    const speed = this.isBoosting ? this.boostSpeed : this.speed;
                    const dx = Math.cos(this.angle) * speed;
                    const dy = Math.sin(this.angle) * speed;
                    this.x += dx;
                    this.y += dy;

                    if (Math.hypot(this.targetFood.x - this.x, this.targetFood.y - this.y) < this.size / 2) {
                        // Ensure the food is consumed only once
                        if (!this.targetFood.eaten) {
                            this.targetFood.eaten = true; // Mark this food as eaten
                            aquarium.removeFood(this.targetFood);
                            this.targetFood = null;
                            this.foodEaten++;
                            this.hunger = 100; // Fully restore hunger
                            this.hungerFullWait = 100; // Reset delay for hunger depletion
                            this.hungerDepleteDelay = 200; // Reset deplete delay timer
                            this.grow();
                        }

                    }
                    this.isBoosting = false;
                } else {
                    this.x += Math.cos(this.angle) * this.speed;
                    this.y += Math.sin(this.angle) * this.speed;
                    this.angle += getRandom(-0.05, 0.05);
                }

                // Hunger management logic (remains unchanged)
                if (this.hunger > 0) {
                    if (this.hunger === 100) {
                        if (this.hungerFullWait > 0) {
                            this.hungerFullWait -= 1;
                        } else {
                            this.hunger -= 0.1;
                        }
                    } else if (this.hunger < 100) {
                        if (this.hungerDepleteDelay <= 0) {
                            this.hunger -= 0.1;
                        } else {
                            this.hungerDepleteDelay -= 1;
                        }
                    }
                } else {
                    this.hunger = 0;
                }

                // Wall collision handling (remains unchanged)
                if (this.x < this.size) {
                    this.x = this.size;
                    this.angle = Math.PI - this.angle;
                }
                if (this.x > canvas.width - this.size) {
                    this.x = canvas.width - this.size;
                    this.angle = Math.PI - this.angle;
                }
                if (this.y < this.size) {
                    this.y = this.size;
                    this.angle = -this.angle;
                }
                if (this.y > canvas.height - this.size) {
                    this.y = canvas.height - this.size;
                    this.angle = -this.angle;
                }
            }

            grow() {
                if (this.level <= this.maxLevel && this.foodEaten % 3 === 0) {
                    this.size += 0.2;
                    this.detectRadius += 5;
                    this.level += 0.2;
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.beginPath();
                ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();

                // Draw tail
                ctx.beginPath();
                ctx.moveTo(-this.size, 0);
                ctx.lineTo(-this.size * 1.5, this.size / 2);
                ctx.lineTo(-this.size * 1.5, -this.size / 2);
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.restore();

                // Draw hunger bar
                const barWidth = this.size * 2; // Dynamic width based on fish size
                const barHeight = 5;

                // Background of the hunger bar
                ctx.fillStyle = "gray";
                ctx.fillRect(this.x - this.size, this.y - this.size - 10, barWidth, barHeight);

                // Fill hunger bar
                ctx.fillStyle = "red";
                ctx.fillRect(this.x - this.size, this.y - this.size - 10, barWidth * (this.hunger / 100), barHeight);

                ctx.fillStyle = "gray";
                ctx.fillRect(this.x - this.size, this.y - this.size - 20, barWidth, barHeight);

                // Fill level bar
                ctx.fillStyle = "green";
                ctx.fillRect(this.x - this.size, this.y - this.size - 20, barWidth * (this.level / this.maxLevel), barHeight);

                // Display gender above the bars
                ctx.fillStyle = "black";
                ctx.font = "10px Arial";
                ctx.fillText(this.gender, this.x - this.size / 2, this.y - this.size - 30);

                // Display "MAX" when level reaches maxLevel
                if (this.level >= this.maxLevel) {
                    ctx.fillStyle = "blue";
                    ctx.fillText("MAX", this.x - this.size / 2, this.y - this.size - 40);
                }
            }

        }

        class Decoration {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.height = getRandom(20, 100);
                this.baseWidth = getRandom(15, 15);
                this.swayAngle = getRandom(0, Math.PI * 2);
                this.swaySpeed = getRandom(0.01, 0.03);
            }

            sway() {
                this.swayAngle += this.swaySpeed;
            }

            draw() {
                ctx.fillStyle = "green";
                ctx.beginPath();
                ctx.moveTo(this.x, canvas.height - 40); // Anchoring to the sandy bottom
                ctx.lineTo(this.x - this.baseWidth / 2 + Math.sin(this.swayAngle) * 3, canvas.height - 40 - this.height); // Horizontal sway
                ctx.lineTo(this.x + this.baseWidth / 2 + Math.sin(this.swayAngle) * 3, canvas.height - 40 - this.height);
                ctx.closePath();
                ctx.fill();
            }
        }

        class Aquarium {
            constructor() {
                this.fishArray = [];
                this.foodArray = [];
                this.bubbleArray = [];
                this.decorationArray = [];
                this.addDecorations(10); // Add some decorations
            }

            addFish(num) {
                for (let i = 0; i < num; i++) {
                    this.fishArray.push(new Fish());
                }
            }

            addFood(x, y) {
                this.foodArray.push(new Food(x, y));
                this.fishArray.forEach(fish => fish.findClosestFood(this.foodArray));
            }

            removeFood(food) {
                this.foodArray = this.foodArray.filter(f => f !== food);
            }

            addBubble() {
                if (Math.random() < 0.02) {
                    this.bubbleArray.push(new Bubble());
                }
            }

            removeBubble(bubble) {
                this.bubbleArray = this.bubbleArray.filter(b => b !== bubble);
            }

            addDecorations(num) {
                for (let i = 0; i < num; i++) {
                    const x = getRandom(50, canvas.width - 50);
                    const y = canvas.height - getRandom(40, 100); // Place decorations towards the bottom
                    this.decorationArray.push(new Decoration(x, y));
                }
            }

            update() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.drawSand();
                this.decorationArray.forEach(decoration => {
                    decoration.sway(); // Swaying effect for seaweed
                    decoration.draw();
                });

                this.foodArray.forEach(food => {
                    food.update();
                    food.draw();
                });
                this.bubbleArray.forEach(bubble => {
                    bubble.update();
                    bubble.draw();
                });
                this.addBubble();
                this.fishArray.forEach(fish => {
                    fish.move();
                    fish.draw();
                });
            }

            drawSand() {
                ctx.fillStyle = "#FFD700";
                ctx.beginPath();
                ctx.moveTo(0, canvas.height - 40);
                for (let i = 0; i < canvas.width; i += 20) {
                    const offset = Math.sin(i / 20) * 5; // Create wave effect
                    ctx.lineTo(i, canvas.height - 40 + offset);
                }
                ctx.lineTo(canvas.width, canvas.height - 40);
                ctx.lineTo(canvas.width, canvas.height);
                ctx.lineTo(0, canvas.height);
                ctx.closePath();
                ctx.fill();
            }
        }

        const aquarium = new Aquarium();
        aquarium.addFish(getRandom(1,10));

        canvas.addEventListener("click", (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            aquarium.addFood(x, y);
        });

        function animate() {
            aquarium.update();
            requestAnimationFrame(animate);
        }
        animate();