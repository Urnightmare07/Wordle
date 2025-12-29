import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

function App() {
  const [board, setBoard] = useState(
    Array(6).fill(null).map(() =>
      Array(5).fill(null).map(() => ({ letter: "", status: "" }))
    )
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  // Fetch random word
  useEffect(() => {
    fetch("http://localhost:5000/word")
      .then(res => res.json())
      .then(data => setAnswer(data.word.toLowerCase()))
      .catch(() => setMessage("Backend error"));
  }, []);

  // Submit guess
  const submitGuess = useCallback(async () => {
    if (gameOver) return;

    if (currentCol !== 5) {
      setMessage("Enter all 5 letters!");
      return;
    }

    const guess = board[currentRow].map(c => c.letter).join("");
    console.log("Submitting guess:", guess);

    try {
      const res = await fetch("http://localhost:5000/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: guess }),
      });
      const data = await res.json();
      if (!data.valid) {
        setMessage("Word does not exist!");
        return;
      }
    } catch {
      setMessage("Validation error");
      return;
    }

    const newBoard = [...board];
    const answerLetters = answer.split("");

    // Correct letters
    for (let i = 0; i < 5; i++) {
      if (guess[i] === answer[i]) {
        newBoard[currentRow][i].status = "correct";
        answerLetters[i] = null;
      }
    }

    // Present letters
    for (let i = 0; i < 5; i++) {
      if (newBoard[currentRow][i].status) continue;
      if (answerLetters.includes(guess[i])) {
        newBoard[currentRow][i].status = "present";
        answerLetters[answerLetters.indexOf(guess[i])] = null;
      } else {
        newBoard[currentRow][i].status = "absent";
      }
    }

    setBoard(newBoard);

    if (guess === answer) {
      setMessage("You win!");
      setGameOver(true);
    } else if (currentRow + 1 === 6) {
      setMessage(`Game over! The word was ${answer.toUpperCase()}`);
      setGameOver(true);
    } else {
      setCurrentRow(currentRow + 1);
      setCurrentCol(0);
    }
  }, [board, currentRow, currentCol, answer, gameOver]);

  // Handle keyboard input
  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (message) setMessage("");

      if (e.key === "Backspace") {
        if (currentCol > 0) {
          const newBoard = [...board];
          newBoard[currentRow][currentCol - 1] = { letter: "", status: "" };
          setBoard(newBoard);
          setCurrentCol(currentCol - 1);
        }
      } else if (e.key === "Enter") {
        submitGuess();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        if (currentCol < 5) {
          const newBoard = [...board];
          newBoard[currentRow][currentCol] = { letter: e.key.toLowerCase(), status: "" };
          setBoard(newBoard);
          setCurrentCol(currentCol + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKey); //instead of <input>
    return () => window.removeEventListener("keydown", handleKey);
  }, [board, currentRow, currentCol, message, gameOver, submitGuess]);

  return (
    <div>
      <h1>Wordle</h1>

      <div id="board">
        {board.map((row, i) => (
          <div key={i} className="row">
            {row.map((cell, j) => (
              <div key={j} className={`tile ${cell.status}`}>
                {cell.letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button onClick={submitGuess} disabled={gameOver}>Submit</button>
      <p>{message}</p>
    </div>
  );
}

export default App;
