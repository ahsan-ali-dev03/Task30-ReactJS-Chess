# ReactJS Chess Game - Task 30

## Task 30 - ReactJS Mini Project

This project is an offline two-player chess game built using React.js.

The game allows two players to play chess locally in the browser with legal move validation, turn-based gameplay, timers, check/checkmate detection, and move notation.

## Features

- 8x8 chess board
- Chess pieces in their initial positions
- Legal move validation for chess pieces
- Illegal moves are prevented
- Turn-based gameplay
- Check detection
- Checkmate detection
- Separate countdown timer for each player
- Timer pauses for the inactive player
- Move list with chess notation
- New Game / Reset functionality
- Legal move highlighting
- Offline two-player gameplay
- Responsive user interface

## Chess Rules

The application implements movement rules for:

- King
- Queen
- Rook
- Bishop
- Knight
- Pawn

It also prevents moves that would leave the player's king in check.

## Technologies Used

- React.js
- JavaScript
- HTML5
- CSS3
- Vite

## Important

No external chess library is used in this project. Chess movement and game logic are implemented manually using JavaScript.

## Project Structure

```text
src/
├── assets/
├── App.jsx
├── App.css
├── chess.js
├── index.css
└── main.jsx