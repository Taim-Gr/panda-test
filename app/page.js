"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import useSound from "use-sound";
import pandaImage from "@/public/images/panda.png";
import { v4 as uuidv4 } from "uuid";
export default function Home() {
  // letter game settings
  const totalW = 5;
  const totalZ = 7;
  const spawnInterval = 800;
  const repeatDelay = 4000;

  // States
  const [letters, setLetters] = useState([]);
  const [gameRunning, setGameRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [backgroundIsPlaying, setBackgroundIsPlaying] = useState(false);

  // Sounds
  const [playNiceSound] = useSound("/sounds/Nice-sound.mp3", {
    volume: 0.7,
    interrupt: true,
    id: "nice-sound",
  });

  const [playBackgroundMusic, { stop, pause }] = useSound(
    "/sounds/game-bg-music.mp3",
    {
      volume: 0.3,
      loop: true,
      interrupt: false,
    }
  );

  const [opsSound] = useSound("/sounds/Oops.mp3", {
    volume: 0.7,
    interrupt: true,
    id: "oops-sound",
  });

  const [popUpSound] = useSound("/sounds/pop-423717.mp3", {
    volume: 0.7,
    interrupt: true,
    id: "pop-sound",
  });

  // Generate all letters
  const wLetters = Array(totalW).fill("W");
  const zLetters = Array(totalZ).fill("Z");
  const allLetters = [...wLetters, ...zLetters];

  // shuffle w and z :
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Letter click handler
  function handleLetterClick(id, char) {
    // here first i map to set isPopping to true so the animation work .
    setLetters((prev) =>
      prev.map((letter) =>
        letter.id === id ? { ...letter, isPopping: true } : letter
      )
    );

    popUpSound();

    if (char === "W") {
      playNiceSound();
    } else {
      opsSound();
    }
    // remove the letter after the animation ends .
    setTimeout(() => {
      setLetters((prev) => prev.filter((letter) => letter.id !== id));
    }, 400);
  }

  // Background music toggle
  const backGroundMusicToggle = () => {
    if (backgroundIsPlaying) {
      pause();
      setBackgroundIsPlaying(false);
    } else {
      playBackgroundMusic();
      setBackgroundIsPlaying(true);
    }
  };

  useEffect(() => {
    if (gameRunning) {
      setCurrentRound(1);
    }
  }, [gameRunning]);

  useEffect(() => {
    // Stops the game if user clicks stop game .
    if (!gameRunning) return;

    const shuffledLetters = shuffleArray(allLetters);
    let letterIndex = 0;

    const spawnIntervalId = setInterval(() => {
      // Start next round when the letters ends .
      if (letterIndex >= shuffledLetters.length) {
        clearInterval(spawnIntervalId);
        setTimeout(() => {
          setCurrentRound((prev) => prev + 1);
        }, repeatDelay);
        return;
      }

      const letter = shuffledLetters[letterIndex];
      letterIndex++;

      // const leftPosition = Math.random() * 160;
      const leftPercentage = Math.random() * 80;
      const duration = Math.random() * 3 + 4;
      const randomDelay = Math.random() * 0.45;

      const newLetter = {
        id: `letter-${uuidv4()}`,
        char: letter,
        left: leftPercentage,
        duration,
        randomDelay,
        round: currentRound,
      };

      setLetters((prev) => [...prev, newLetter]);
      // Remove letter after it disappear finish the animition :
      setTimeout(() => {
        setLetters((prev) => prev.filter((l) => l.id !== newLetter.id));
      }, (duration + 2) * 1000);
    }, spawnInterval);

    return () => clearInterval(spawnIntervalId);
  }, [gameRunning, currentRound]);

  return (
    <div className="w-full max-w-[375px] mx-auto bg-white text-black h-screen flex flex-col">
      {/* Header */}
      <div className="flex-1 bg-green-500 text-white text-center font-bold text-4xl flex items-center justify-center">
        <button onClick={backGroundMusicToggle}>
          {backgroundIsPlaying ? "🔇" : "🔊"}
        </button>
      </div>

      {/* Prize Section */}
      <div className="flex-[1.5] bg-blue-600 text-white text-center font-bold  items-center justify-center flex flex-col">
        <p>Total W : {totalW}</p>
        <p>Total Z : {totalZ}</p>
        <p>Total Letters : {totalW + totalZ}</p>
      </div>

      {/* Question Section */}
      <div className="flex-[1.5] bg-orange-600 text-white text-center font-bold flex flex-col items-center justify-center">
        <p>delay between each letter : {spawnInterval / 1000}'s </p>
        <p>delay between rounds : {repeatDelay / 1000}'s</p>
      </div>

      {/* Game Area */}
      <div className="flex-[4.5] bg-gray-600 relative flex items-center justify-center overflow-hidden">
        <Image
          src={pandaImage}
          alt="panda-image"
          className="object-cover h-full w-full"
          priority
        />

        {/* Animated Letters */}
        <div className="absolute w-full">
          <AnimatePresence>
            {letters.map((letter) => (
              <motion.div
                key={letter.id}
                initial={{
                  y: 250,
                  opacity: 1,
                  scale: 0.5,
                  // x: letter.left,
                  borderRadius: "50%",
                  backgroundColor: "#f59e0b",
                }}
                animate={{
                  y: -400,
                  opacity: letter.isPopping ? [1, 1, 0] : 1,
                  scale: letter.isPopping ? [1, 1.1, 1.2] : [0.5, 1.1, 1.1],
                  borderRadius: "50%",
                  backgroundColor: letter.isPopping
                    ? ["#f59e0b", "#fbbf24", "#fde047"]
                    : "#f59e0b",
                }}
                transition={{
                  delay: letter.isPopping ? 0 : letter.randomDelay,
                  duration: letter.isPopping ? 0.5 : letter.duration,
                  ease: "easeIn",
                  times: letter.isPopping ? [0, 0.5, 1] : [0, 0.3, 1],
                }}
                className={`absolute bottom-0 text-xl font-extrabold flex justify-center items-center text-red-600 cursor-pointer ${
                  letter.isPopping ? "mix-blend-screen" : ""
                }`}
                style={{
                  left: `${letter.left}%`,
                  width: letter.isPopping ? "55px" : "50px",
                  height: letter.isPopping ? "55px" : "50px",
                }}
                onClick={() =>
                  !letter.isPopping
                    ? handleLetterClick(letter.id, letter.char)
                    : null
                }
              >
                <motion.span
                  animate={{
                    opacity: letter.isPopping ? [1, 0.5, 0] : 1,
                    scale: letter.isPopping ? [1, 1.2, 0] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {letter.char}
                </motion.span>

                {letter.isPopping && (
                  <motion.div
                    style={{
                      textShadow:
                        letter.char === "Z"
                          ? "0 0 10px #f87171, 0 0 20px #ef4444, 0 0 30px #dc2626"
                          : "0 0 10px #ffbf00, 0 0 20px #ff8c00",
                    }}
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-2xl font-extrabold text-white whitespace-nowrap"
                    initial={{ y: 20, opacity: 0.8, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                  >
                    {letter.char === "W" ? "Nice!" : "Oops!"}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-[1.5] bg-yellow-600 text-white text-center flex items-center justify-center">
        <button
          className="border-2 border-red-600 text-white font-bold px-6 py-2 rounded-xl cursor-pointer hover:bg-red-600 transition-colors"
          onClick={() => setGameRunning((prev) => !prev)}
        >
          {gameRunning ? "End Game" : "Start Game"}
        </button>
      </div>
    </div>
  );
}
