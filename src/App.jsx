import { useEffect, useState } from "react";
import "./App.css";

import {
  PIECES,
  createInitialBoard,
  getLegalMoves,
  applyMove,
  isInCheck,
  hasAnyLegalMove,
  squareName,
  createMoveNotation,
} from "./chess";

function App() {
  const [board, setBoard] = useState(createInitialBoard);
  const [turn, setTurn] = useState("w");
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [moveList, setMoveList] = useState([]);
  const [status, setStatus] = useState("White's turn");
  const [gameOver, setGameOver] = useState(false);

  const [whiteTime, setWhiteTime] = useState(10 * 60);
  const [blackTime, setBlackTime] = useState(10 * 60);

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      if (turn === "w") {
        setWhiteTime((time) => {
          if (time <= 1) {
            clearInterval(timer);
            setGameOver(true);
            setStatus("Black wins on time!");
            return 0;
          }

          return time - 1;
        });
      } else {
        setBlackTime((time) => {
          if (time <= 1) {
            clearInterval(timer);
            setGameOver(true);
            setStatus("White wins on time!");
            return 0;
          }

          return time - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, gameOver]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const handleSquareClick = (row, col) => {
    if (gameOver) return;

    const clickedPiece = board[row][col];

    // Select a piece
    if (!selected) {
      if (!clickedPiece) {
        setStatus(
          `${turn === "w" ? "White" : "Black"}: select a piece first.`
        );
        return;
      }

      if (clickedPiece.color !== turn) {
        setStatus(
          `It's ${turn === "w" ? "White" : "Black"}'s turn.`
        );
        return;
      }

      const moves = getLegalMoves(board, row, col, turn);

      setSelected([row, col]);
      setLegalMoves(moves);

      if (moves.length === 0) {
        setStatus("This piece has no legal moves.");
      } else {
        setStatus(
          `${turn === "w" ? "White" : "Black"} selected ${squareName(
            row,
            col
          )}`
        );
      }

      return;
    }

    const [selectedRow, selectedCol] = selected;

    // Click another own piece
    if (clickedPiece && clickedPiece.color === turn) {
      const moves = getLegalMoves(board, row, col, turn);

      setSelected([row, col]);
      setLegalMoves(moves);

      return;
    }

    const isLegal = legalMoves.some(
      ([moveRow, moveCol]) =>
        moveRow === row && moveCol === col
    );

    if (!isLegal) {
      setStatus("Illegal move! Choose a highlighted square.");
      return;
    }

    const movingPiece = board[selectedRow][selectedCol];
    const capturedPiece = board[row][col];

    const notation = createMoveNotation(
      board,
      selected,
      [row, col],
      Boolean(capturedPiece)
    );

    const nextBoard = applyMove(
      board,
      selected,
      [row, col]
    );

    setBoard(nextBoard);

    const newMoveNumber = Math.floor(moveList.length / 2) + 1;

    setMoveList((moves) => [
      ...moves,
      {
        number: newMoveNumber,
        color: turn,
        notation,
      },
    ]);

    setSelected(null);
    setLegalMoves([]);

    const nextTurn = turn === "w" ? "b" : "w";

    const nextPlayerName =
      nextTurn === "w" ? "White" : "Black";

    const inCheck = isInCheck(nextBoard, nextTurn);

    const hasMoves = hasAnyLegalMove(
      nextBoard,
      nextTurn
    );

    if (inCheck && !hasMoves) {
      setGameOver(true);

      const winner =
        turn === "w" ? "White" : "Black";

      setStatus(`Checkmate! ${winner} wins!`);
    } else if (inCheck) {
      setStatus(`${nextPlayerName} is in check!`);
    } else if (!hasMoves) {
      setGameOver(true);
      setStatus("Stalemate! Draw.");
    } else {
      setTurn(nextTurn);
      setStatus(`${nextPlayerName}'s turn`);
    }
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setTurn("w");
    setSelected(null);
    setLegalMoves([]);
    setMoveList([]);
    setStatus("White's turn");
    setGameOver(false);
    setWhiteTime(10 * 60);
    setBlackTime(10 * 60);
  };

  return (
    <div className="chess-app">
      <header className="game-header">
        <div>
          <h1>♟️ React Chess</h1>
          <p>Offline Two Player Chess</p>
        </div>

        <button className="reset-button" onClick={resetGame}>
          New Game
        </button>
      </header>

      <main className="game-container">
        <section className="board-section">
          <div className="player-bar">
            <div>
              <strong>Black</strong>
              <span>Player 2</span>
            </div>

            <div
              className={`timer ${
                turn === "b" ? "active-timer" : ""
              }`}
            >
              {formatTime(blackTime)}
            </div>
          </div>

          <div className="chess-board">
            {board.map((row, rowIndex) =>
              row.map((piece, colIndex) => {
                const isDark =
                  (rowIndex + colIndex) % 2 === 1;

                const isSelected =
                  selected &&
                  selected[0] === rowIndex &&
                  selected[1] === colIndex;

                const isLegalMove = legalMoves.some(
                  ([moveRow, moveCol]) =>
                    moveRow === rowIndex &&
                    moveCol === colIndex
                );

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    className={`square ${
                      isDark ? "dark" : "light"
                    } ${isSelected ? "selected" : ""}`}
                    onClick={() =>
                      handleSquareClick(
                        rowIndex,
                        colIndex
                      )
                    }
                  >
                    <span className="coordinate">
                      {colIndex === 0 && 8 - rowIndex}
                      {rowIndex === 7 &&
                        String.fromCharCode(97 + colIndex)}
                    </span>

                    {piece && (
                      <span
                        className={`piece ${
                          piece.color === "w"
                            ? "white-piece"
                            : "black-piece"
                        }`}
                      >
                        {PIECES[piece.color][piece.type]}
                      </span>
                    )}

                    {isLegalMove && (
                      <span
                        className={`move-indicator ${
                          piece
                            ? "capture-indicator"
                            : ""
                        }`}
                      ></span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="player-bar">
            <div>
              <strong>White</strong>
              <span>Player 1</span>
            </div>

            <div
              className={`timer ${
                turn === "w" ? "active-timer" : ""
              }`}
            >
              {formatTime(whiteTime)}
            </div>
          </div>
        </section>

        <aside className="game-panel">
          <div className="status-card">
            <h2>Game Status</h2>
            <p
              className={
                status.toLowerCase().includes("check")
                  ? "check-status"
                  : ""
              }
            >
              {status}
            </p>
          </div>

          <div className="moves-card">
            <h2>Move List</h2>

            {moveList.length === 0 ? (
              <p className="empty-moves">
                No moves yet
              </p>
            ) : (
              <div className="move-list">
                {Array.from({
                  length: Math.ceil(
                    moveList.length / 2
                  ),
                }).map((_, index) => {
                  const whiteMove =
                    moveList[index * 2];

                  const blackMove =
                    moveList[index * 2 + 1];

                  return (
                    <div
                      className="move-row"
                      key={index}
                    >
                      <span>{index + 1}.</span>
                      <strong>
                        {whiteMove?.notation || ""}
                      </strong>
                      <strong>
                        {blackMove?.notation || ""}
                      </strong>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rules-card">
            <h2>How to Play</h2>

            <ul>
              <li>Click a piece to select it.</li>
              <li>Highlighted squares are legal moves.</li>
              <li>Players alternate turns.</li>
              <li>Illegal moves are blocked.</li>
              <li>Each player has 10 minutes.</li>
              <li>Checkmate ends the game.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;