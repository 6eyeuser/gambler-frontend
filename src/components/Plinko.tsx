"use client";
import React, { useEffect, useRef, useState } from "react";

// Physics Constants
const GRAVITY = 0.6;
const BOUNCE = 0.5; // Energy retained after hitting a peg
const BALL_RADIUS = 6;
const PEG_RADIUS = 4;
const ROWS = 12;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Peg {
  x: number;
  y: number;
}

export default function Plinko() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const pegsRef = useRef<Peg[]>([]);

  // 1. Generate the Pyramid of Pegs
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newPegs: Peg[] = [];
    const spacing = 40;
    const startY = 50;

    for (let row = 3; row < ROWS + 3; row++) {
      const cols = row;
      const rowWidth = (cols - 1) * spacing;
      const startX = canvas.width / 2 - rowWidth / 2;

      for (let col = 0; col < cols; col++) {
        newPegs.push({
          x: startX + col * spacing,
          y: startY + (row - 3) * spacing,
        });
      }
    }
    pegsRef.current = newPegs;
  }, []);

  // 2. Physics & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Pegs
      ctx.fillStyle = "#ffffff";
      pegsRef.current.forEach((peg) => {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and Draw Balls
      setBalls((currentBalls) => {
        const activeBalls = currentBalls.filter((ball) => ball.y < canvas.height + 20);

        activeBalls.forEach((ball) => {
          ball.vy += GRAVITY;
          ball.x += ball.vx;
          ball.y += ball.vy;

          // Peg Collision Detection
          pegsRef.current.forEach((peg) => {
            const dx = ball.x - peg.x;
            const dy = ball.y - peg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = BALL_RADIUS + PEG_RADIUS;

            if (distance < minDistance) {
              // Calculate collision angle
              const angle = Math.atan2(dy, dx);
              
              // Move ball out of peg to prevent sticking
              const overlap = minDistance - distance;
              ball.x += Math.cos(angle) * overlap;
              ball.y += Math.sin(angle) * overlap;

              // Reflect velocity (Bounce)
              const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
              
              // Add slight random noise so the ball doesn't drop perfectly straight
              const randomNoise = (Math.random() - 0.5) * 0.5;
              
              ball.vx = Math.cos(angle + randomNoise) * speed * BOUNCE;
              ball.vy = Math.sin(angle + randomNoise) * speed * BOUNCE;
            }
          });

          // Draw Ball
          ctx.fillStyle = "#ff0055";
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        });

        return activeBalls;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // 3. Drop Ball Function
  const dropBall = () => {
    if (!canvasRef.current) return;
    
    // Add slight random X offset so balls don't take the exact same path
    const randomOffset = (Math.random() - 0.5) * 10;
    
    const newBall: Ball = {
      x: canvasRef.current.width / 2 + randomOffset,
      y: 10,
      vx: 0,
      vy: 0,
    };
    
    setBalls((prev) => [...prev, newBall]);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-xl">
      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        className="bg-gray-950 border border-gray-800 rounded-lg shadow-lg mb-6"
      />
      <button
        onClick={dropBall}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors"
      >
        Drop Ball ($10.00)
      </button>
    </div>
  );
}