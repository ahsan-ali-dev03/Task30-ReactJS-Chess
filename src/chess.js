const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

export const PIECES = {
  w: {
    k: "♔",
    q: "♕",
    r: "♖",
    b: "♗",
    n: "♘",
    p: "♙",
  },
  b: {
    k: "♚",
    q: "♛",
    r: "♜",
    b: "♝",
    n: "♞",
    p: "♟",
  },
};

export function createInitialBoard() {
  return [
    [
      { type: "r", color: "b" },
      { type: "n", color: "b" },
      { type: "b", color: "b" },
      { type: "q", color: "b" },
      { type: "k", color: "b" },
      { type: "b", color: "b" },
      { type: "n", color: "b" },
      { type: "r", color: "b" },
    ],
    Array(8)
      .fill(null)
      .map(() => ({ type: "p", color: "b" })),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8)
      .fill(null)
      .map(() => ({ type: "p", color: "w" })),
    [
      { type: "r", color: "w" },
      { type: "n", color: "w" },
      { type: "b", color: "w" },
      { type: "q", color: "w" },
      { type: "k", color: "w" },
      { type: "b", color: "w" },
      { type: "n", color: "w" },
      { type: "r", color: "w" },
    ],
  ];
}

function inside(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function opposite(color) {
  return color === "w" ? "b" : "w";
}

function cloneBoard(board) {
  return board.map((row) =>
    row.map((piece) => (piece ? { ...piece } : null))
  );
}

function addSlidingMoves(board, row, col, color, directions, moves) {
  directions.forEach(([dr, dc]) => {
    let r = row + dr;
    let c = col + dc;

    while (inside(r, c)) {
      if (!board[r][c]) {
        moves.push([r, c]);
      } else {
        if (board[r][c].color !== color) {
          moves.push([r, c]);
        }
        break;
      }

      r += dr;
      c += dc;
    }
  });
}

function getPseudoMoves(board, row, col, enPassant) {
  const piece = board[row][col];

  if (!piece) return [];

  const moves = [];
  const { type, color } = piece;
  const direction = color === "w" ? -1 : 1;

  if (type === "p") {
    const oneStep = row + direction;

    if (inside(oneStep, col) && !board[oneStep][col]) {
      moves.push([oneStep, col]);

      const startingRow = color === "w" ? 6 : 1;
      const twoStep = row + direction * 2;

      if (row === startingRow && !board[twoStep][col]) {
        moves.push([twoStep, col]);
      }
    }

    [-1, 1].forEach((dc) => {
      const r = row + direction;
      const c = col + dc;

      if (!inside(r, c)) return;

      if (board[r][c] && board[r][c].color !== color) {
        moves.push([r, c]);
      }

      if (
        enPassant &&
        enPassant.row === r &&
        enPassant.col === c
      ) {
        moves.push([r, c]);
      }
    });
  }

  if (type === "n") {
    const knightMoves = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];

    knightMoves.forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;

      if (
        inside(r, c) &&
        (!board[r][c] || board[r][c].color !== color)
      ) {
        moves.push([r, c]);
      }
    });
  }

  if (type === "b") {
    addSlidingMoves(
      board,
      row,
      col,
      color,
      [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ],
      moves
    );
  }

  if (type === "r") {
    addSlidingMoves(
      board,
      row,
      col,
      color,
      [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ],
      moves
    );
  }

  if (type === "q") {
    addSlidingMoves(
      board,
      row,
      col,
      color,
      [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ],
      moves
    );
  }

  if (type === "k") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;

        const r = row + dr;
        const c = col + dc;

        if (
          inside(r, c) &&
          (!board[r][c] || board[r][c].color !== color)
        ) {
          moves.push([r, c]);
        }
      }
    }
  }

  return moves;
}

export function isSquareAttacked(board, row, col, byColor) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];

      if (!piece || piece.color !== byColor) continue;

      const moves = getPseudoMoves(board, r, c, null);

      if (moves.some(([mr, mc]) => mr === row && mc === col)) {
        return true;
      }
    }
  }

  return false;
}

export function isInCheck(board, color) {
  let kingPosition = null;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];

      if (
        piece &&
        piece.type === "k" &&
        piece.color === color
      ) {
        kingPosition = [r, c];
        break;
      }
    }

    if (kingPosition) break;
  }

  if (!kingPosition) return true;

  return isSquareAttacked(
    board,
    kingPosition[0],
    kingPosition[1],
    opposite(color)
  );
}

export function applyMove(board, from, to, enPassant = null) {
  const nextBoard = cloneBoard(board);
  const piece = nextBoard[from[0]][from[1]];

  if (!piece) return nextBoard;

  nextBoard[to[0]][to[1]] = piece;
  nextBoard[from[0]][from[1]] = null;

  // En passant capture
  if (
    piece.type === "p" &&
    enPassant &&
    to[0] === enPassant.row &&
    to[1] === enPassant.col &&
    !board[to[0]][to[1]]
  ) {
    const capturedRow = piece.color === "w" ? to[0] + 1 : to[0] - 1;
    nextBoard[capturedRow][to[1]] = null;
  }

  // Pawn promotion
  if (piece.type === "p" && (to[0] === 0 || to[0] === 7)) {
    nextBoard[to[0]][to[1]] = {
      type: "q",
      color: piece.color,
    };
  }

  return nextBoard;
}

export function getLegalMoves(
  board,
  row,
  col,
  color,
  enPassant = null
) {
  const piece = board[row][col];

  if (!piece || piece.color !== color) {
    return [];
  }

  const pseudoMoves = getPseudoMoves(
    board,
    row,
    col,
    enPassant
  );

  return pseudoMoves.filter(([toRow, toCol]) => {
    const nextBoard = applyMove(
      board,
      [row, col],
      [toRow, toCol],
      enPassant
    );

    return !isInCheck(nextBoard, color);
  });
}

export function hasAnyLegalMove(board, color, enPassant = null) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (
        board[row][col] &&
        board[row][col].color === color &&
        getLegalMoves(
          board,
          row,
          col,
          color,
          enPassant
        ).length > 0
      ) {
        return true;
      }
    }
  }

  return false;
}

export function squareName(row, col) {
  return `${FILES[col]}${8 - row}`;
}

export function createMoveNotation(
  board,
  from,
  to,
  captured,
  promotion = false
) {
  const piece = board[from[0]][from[1]];

  if (!piece) return "";

  const destination = squareName(to[0], to[1]);

  if (piece.type === "p") {
    const file = FILES[from[1]];

    if (captured) {
      return `${file}x${destination}${promotion ? "=Q" : ""}`;
    }

    return `${destination}${promotion ? "=Q" : ""}`;
  }

  const symbols = {
    k: "K",
    q: "Q",
    r: "R",
    b: "B",
    n: "N",
  };

  return `${symbols[piece.type]}${captured ? "x" : ""}${destination}`;
}