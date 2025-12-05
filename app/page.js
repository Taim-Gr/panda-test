"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import useSound from "use-sound";
import pandaImage from "@/public/images/panda.png";
import { v4 as uuidv4 } from "uuid";
import yellowCircle from "@/public/images/letterCircle.png";
import sweetContainer from "@/public/images/sweet-container.png";
import explosionEffect from "@/public/images/explosionEffect.png";
export default function Home() {
  // letter game settings
  const totalW = 20;
  const totalZ = 20;
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

  const [popUpSound1] = useSound("/sounds/pop-1.MP3", {
    volume: 0.7,
    interrupt: true,
    id: "pop-sound",
  });
  const [popUpSound2] = useSound("/sounds/pop-2.MP3", {
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
    const random = Math.round(Math.random()) + 1;
    console.log("random", random);
    random == 1 ? popUpSound1() : popUpSound2();

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
      // const duration = Math.random() * 3 + 4;
      const duration = 4 + (leftPercentage / 100) * 1.5;
      // const randomDelay = Math.random() * 0.45;
      const randomDelay = (leftPercentage / 100) * 0.5;
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
          {backgroundIsPlaying ? "🔊" : "🔇"}
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
                }}
                animate={{
                  y: -400,
                  opacity: letter.isPopping ? [1, 1, 0] : 1,
                  scale: letter.isPopping ? [1, 1.1, 1.2] : [0.5, 1.1, 1.1],
                }}
                transition={{
                  delay: letter.isPopping ? 0 : letter.randomDelay,
                  duration: letter.isPopping ? 0.5 : letter.duration,
                  ease: "easeIn",
                  times: letter.isPopping ? [0, 0.5, 1] : [0, 0.3, 1],
                }}
                className={`absolute bottom-0 flex justify-center items-center cursor-pointer ${
                  letter.isPopping ? "mix-blend-screen" : ""
                }`}
                style={{
                  left: `${letter.left}%`,
                  width: letter.isPopping ? "85px" : "80px",
                  height: letter.isPopping ? "85px" : "80px",
                }}
                onClick={() =>
                  !letter.isPopping
                    ? handleLetterClick(letter.id, letter.char)
                    : null
                }
              >
                {/* Yellow circle explodes */}
                <motion.div
                  className="absolute w-full h-full flex items-center justify-center"
                  initial={false}
                  animate={
                    letter.isPopping
                      ? {
                          scale: [1, 1.1, 1.2],
                          opacity: [1, 1, 0],
                          filter: [
                            "brightness(1)",
                            "brightness(2.5)",
                            "brightness(1.2)",
                            "brightness(0)",
                          ],
                        }
                      : {
                          scale: 1,
                          opacity: 1,
                          filter: "brightness(1)",
                        }
                  }
                  transition={{
                    duration: letter.isPopping ? 0.2 : 0,
                    ease: "easeOut",
                    times: [0, 0.3, 1],
                  }}
                >
                  <Image
                    src={yellowCircle}
                    alt="yellow circle"
                    className="w-full h-full object-contain"
                    priority
                  />
                </motion.div>

                {/* The letter */}
                <motion.span
                  className="relative z-10 text-2xl font-extrabold text-red-600"
                  animate={{
                    opacity: letter.isPopping ? 0 : 1,
                    scale: letter.isPopping ? [1, 1.2, 0] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {letter.char}
                </motion.span>

                {/*  EXPLOSION EFFECT */}
                {letter.isPopping && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.6, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ zIndex: 5 }}
                  >
                    <Image
                      src={explosionEffect}
                      alt="explosion"
                      className="w-[150px] h-[150px] object-contain"
                      priority
                    />
                  </motion.div>
                )}

                {/* Nice + ops */}
                {letter.isPopping && (
                  <motion.div
                    className="absolute left-1/2"
                    initial={{
                      y: 40,
                      opacity: 0.8,
                      scale: 0.8,
                      x: "-50%",
                    }}
                    animate={{
                      y: -40,
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      y: -80,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.1,
                      ease: "easeOut",
                      times: [0.2, 0.4, 1],
                    }}
                    style={{
                      top: "-120px",
                    }}
                  >
                    <div className="relative w-48 h-32 flex items-center justify-center">
                      <Image
                        src={sweetContainer}
                        alt={letter.char === "W" ? "Nice" : "Oops"}
                        className="w-full h-full object-contain drop-shadow-lg"
                        priority
                      />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.p
                          className="text-2xl md:text-3xl font-extrabold text-center px-2"
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          style={{
                            color: letter.char === "W" ? "#FFD700" : "#FF6B6B",
                            textShadow: `
                    2px 2px 0px #000,
                    -1px -1px 0px #000,
                    1px -1px 0px #000,
                    -1px 1px 0px #000,
                    0px 4px 8px rgba(0,0,0,0.5)
                  `,
                            WebkitTextStroke: "1px black",
                            paddingTop: "8px",
                          }}
                        >
                          {letter.char === "W" ? "Nice!" : "Oops!"}
                        </motion.p>
                      </div>
                    </div>
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
