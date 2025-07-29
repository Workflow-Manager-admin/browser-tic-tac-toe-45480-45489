import React, { useState } from "react";
import "./App.css";

/** Color constants from work item */
const COLOR_PRIMARY = "#1976d2";
const COLOR_SECONDARY = "#424242";
const COLOR_ACCENT = "#ff4081";

// ---- Utility: Calculate winner ----
/**
 * PUBLIC_INTERFACE
 * Determines the winner of the tic tac toe game.
 * @param {Array<string|null>} squares - array of squares
 * @returns {"X"|"O"|null} The winner, if any
 */
function calculateWinner(squares) {
  /** This is a public function. */
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],            // diagonals
  ];
  for (let [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

// ---- COMPONENT: Single Square ----
/**
 * PUBLIC_INTERFACE
 * Renders a Tic Tac Toe board cell
 */
function Square({ value, onClick, highlight }) {
  /** This is a public function. */
  return (
    <button
      className="ttt-square"
      style={{
        borderColor: highlight ? COLOR_ACCENT : COLOR_PRIMARY,
        color: value === "X" ? COLOR_PRIMARY : value === "O" ? COLOR_SECONDARY : undefined,
        background: highlight ? "#fbe9f7" : "#fff",
        fontWeight: highlight ? 700 : 500,
        cursor: value ? "default" : "pointer",
      }}
      onClick={onClick}
      aria-label={value ? `Cell ${value}` : "Empty cell"}
      disabled={Boolean(value)}
    >
      {value}
    </button>
  );
}

// ---- COMPONENT: Board ----
/**
 * PUBLIC_INTERFACE
 * Renders the main 3x3 tic tac toe board
 */
function Board({ squares, onSquareClick, winningLine }) {
  /** This is a public function. */
  function renderSquare(i) {
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onSquareClick(i)}
        highlight={winningLine && winningLine.includes(i)}
      />
    );
  }
  return (
    <div className="ttt-board">
      {[0, 1, 2].map(row => (
        <div className="ttt-board-row" key={row}>
          {[0, 1, 2].map(col => renderSquare(row * 3 + col))}
        </div>
      ))}
    </div>
  );
}

// ---- COMPONENT: History List ----
/**
 * PUBLIC_INTERFACE
 * Displays the move history and allows navigation
 */
function MoveHistory({ history, jumpTo, currentMove }) {
  /** This is a public function. */
  return (
    <ol className="ttt-history">
      {history.map((_step, move) => {
        const desc = move
          ? `Go to move #${move}`
          : "Go to game start";
        return (
          <li key={move}>
            <button
              className="ttt-history-btn"
              style={{
                color: move === currentMove ? COLOR_ACCENT : COLOR_SECONDARY,
                fontWeight: move === currentMove ? "bold" : "normal",
              }}
              onClick={() => jumpTo(move)}
              disabled={move === currentMove}
              aria-label={desc}
            >
              {desc}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

// ---- MAIN APP ----
/**
 * PUBLIC_INTERFACE
 * Main App for the Tic Tac Toe Game
 */
function App() {
  /** This is a public function. */

  // Main state is history of board, stepNumber, XisNext
  const [history, setHistory] = useState([
    { squares: Array(9).fill(null), lastMove: null },
  ]);
  const [stepNumber, setStepNumber] = useState(0);

  // X goes first
  const xIsNext = stepNumber % 2 === 0;

  const current = history[stepNumber];
  const winner = calculateWinner(current.squares);

  // Find winning line for highlight
  function getWinningLine(squares) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return line;
      }
    }
    return null;
  }

  const winningLine = winner ? getWinningLine(current.squares) : null;

  // PUBLIC_INTERFACE
  function handleClick(i) {
    /** This is a public function. Handles click on square. */
    const slicedHistory = history.slice(0, stepNumber + 1);
    const currentState = slicedHistory[slicedHistory.length - 1];
    const squares = currentState.squares.slice();
    if (winner || squares[i]) {
      return;
    }
    squares[i] = xIsNext ? "X" : "O";
    setHistory(
      slicedHistory.concat([{ squares: squares, lastMove: i }])
    );
    setStepNumber(slicedHistory.length);
  }

  // PUBLIC_INTERFACE
  function jumpTo(move) {
    /** This is a public function. Jump to previous move in history. */
    setStepNumber(move);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    /** This is a public function. Restart the game to initial state. */
    setHistory([{ squares: Array(9).fill(null), lastMove: null }]);
    setStepNumber(0);
  }

  const isBoardFull = current.squares.every(Boolean);
  let status;
  if (winner) {
    status = (
      <span style={{ color: COLOR_ACCENT }}>
        Winner: <strong>{winner}</strong>
      </span>
    );
  } else if (isBoardFull) {
    status = (
      <span style={{ color: COLOR_SECONDARY }}>
        Draw game!
      </span>
    );
  } else {
    status = (
      <span>
        Next turn:{" "}
        <span style={{ color: xIsNext ? COLOR_PRIMARY : COLOR_SECONDARY }}>
          {xIsNext ? "X" : "O"}
        </span>
      </span>
    );
  }

  return (
    <div className="App">
      <div className="ttt-outer-container">
        <h1 className="ttt-title" style={{ color: COLOR_PRIMARY }}>Tic Tac Toe</h1>
        <Board
          squares={current.squares}
          onSquareClick={handleClick}
          winningLine={winningLine}
        />
        <div className="ttt-status">{status}</div>
        <MoveHistory
          history={history}
          currentMove={stepNumber}
          jumpTo={jumpTo}
        />
        <button
          className="ttt-restart-btn"
          style={{
            background: COLOR_ACCENT,
            color: "#fff",
            borderColor: COLOR_ACCENT,
          }}
          onClick={handleRestart}
          aria-label="Restart game"
        >
          Restart
        </button>
      </div>
    </div>
  );
}

export default App;
