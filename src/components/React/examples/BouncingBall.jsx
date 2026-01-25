import React from 'react';
import P5Canvas from '../P5Canvas';

/**
 * Bouncing Ball Simulation - Nature of Code style
 * Demonstrates basic physics: velocity, acceleration, and gravity
 */

// Ball class following Nature of Code patterns
class Ball {
  constructor(p, x, y) {
    this.p = p;
    this.position = p.createVector(x, y);
    this.velocity = p.createVector(0, 0);
    this.acceleration = p.createVector(0, 0);
    this.radius = 20;
    this.gravity = p.createVector(0, 0.5);
    this.damping = 0.8; // Energy loss on bounce
  }

  applyForce(force) {
    // F = ma, so a = F/m (assuming mass = 1)
    this.acceleration.add(force);
  }

  update() {
    // Nature of Code motion algorithm
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0); // Reset acceleration
  }

  checkEdges() {
    const p = this.p;

    // Bounce off bottom
    if (this.position.y + this.radius > p.height) {
      this.position.y = p.height - this.radius;
      this.velocity.y *= -this.damping;
    }

    // Bounce off top
    if (this.position.y - this.radius < 0) {
      this.position.y = this.radius;
      this.velocity.y *= -this.damping;
    }

    // Bounce off right
    if (this.position.x + this.radius > p.width) {
      this.position.x = p.width - this.radius;
      this.velocity.x *= -this.damping;
    }

    // Bounce off left
    if (this.position.x - this.radius < 0) {
      this.position.x = this.radius;
      this.velocity.x *= -this.damping;
    }
  }

  display() {
    const p = this.p;
    p.push();
    p.fill(100, 150, 255);
    p.stroke(255);
    p.strokeWeight(2);
    p.circle(this.position.x, this.position.y, this.radius * 2);
    p.pop();
  }
}

// Create the p5 sketch
const createSketch = (p) => {
  let ball;

  return {
    setup: () => {
      p.background(20);
      // Create ball at center with random initial velocity
      ball = new Ball(p, p.width / 2, p.height / 4);
      ball.velocity = p.createVector(
        p.random(-3, 3),
        p.random(-2, 2)
      );
    },

    draw: () => {
      // Semi-transparent background for trail effect
      p.background(20, 20, 30, 50);

      // Apply gravity
      ball.applyForce(ball.gravity);

      // Update and display
      ball.update();
      ball.checkEdges();
      ball.display();

      // Draw velocity vector (scaled for visibility)
      p.push();
      p.stroke(255, 100, 100);
      p.strokeWeight(2);
      p.line(
        ball.position.x,
        ball.position.y,
        ball.position.x + ball.velocity.x * 5,
        ball.position.y + ball.velocity.y * 5
      );
      p.pop();
    },

    reset: () => {
      p.background(20);
      ball = new Ball(p, p.width / 2, p.height / 4);
      ball.velocity = p.createVector(
        p.random(-3, 3),
        p.random(-2, 2)
      );
    },

    mousePressed: () => {
      console.log('BouncingBall clicked at:', p.mouseX, p.mouseY);
      // Click to add impulse
      let dx = p.mouseX - ball.position.x;
      let dy = p.mouseY - ball.position.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ball.radius * 2) {
        ball.velocity.add(p.createVector(p.random(-2, 2), -5));
      }
    }
  };
};

const BouncingBall = ({ width, height }) => {
  return (
    <P5Canvas
      sketch={createSketch}
      width={width || 600}
      height={height || 400}
      title="튀어오르는 공 - 중력과 속도"
      githubUrl="https://github.com/rottenapplea/physics_blog_2025/blob/main/src/components/React/examples/BouncingBall.jsx"
    />
  );
};

export default BouncingBall;
