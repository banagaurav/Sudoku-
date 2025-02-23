import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Games.css"; // Ensure the CSS is imported

function Game() {
  const [sudokuGrid, setSudokuGrid] = useState(null);
  const [initialGrid, setInitialGrid] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [difficulty, setDifficulty] = useState(30);

  useEffect(() => {
    const fetchSudoku = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/Sudoku/generate?k=${difficulty}`
        );
        setSudokuGrid(response.data);
        setInitialGrid(response.data); // Save the initial grid to prevent edits
      } catch (err) {
        console.error("Error generating Sudoku", err);
      }
    };
    fetchSudoku();
  }, [difficulty]);

  const generateSudoku = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/Sudoku/generate?k=${difficulty}`
      ); // Adjust URL if needed
      setSudokuGrid(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Failed to load Sudoku puzzle");
    }
  };

  const solveSudoku = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/Sudoku/solve",
        sudokuGrid
      ); // Adjust URL if needed
      setSudokuGrid(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Failed to solve Sudoku puzzle");
    }
  };

  const handleChange = (rowIndex, colIndex, value) => {
    const newGrid = [...sudokuGrid];
    if (initialGrid[rowIndex][colIndex] === 0) {
      newGrid[rowIndex][colIndex] = value ? parseInt(value, 10) : 0;
      setSudokuGrid(newGrid);
    }
  };

  return (
    <div className="game-container">
      <h1>Sudoku Game</h1>
      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="controls">
        <button className="control-button" onClick={generateSudoku}>
          New Puzzle
        </button>
        <button
          className="control-button"
          onClick={solveSudoku}
          disabled={!sudokuGrid}
        >
          Solve
        </button>

        <div className="difficulty-selector">
          <label htmlFor="difficulty" className="difficulty-label">
            Difficulty:
          </label>
          <select
            id="difficulty"
            className="difficulty-dropdown"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value={30}>Easy</option>
            <option value={40}>Medium</option>
            <option value={50}>Hard</option>
          </select>
        </div>
      </div>

      {/* Render the Sudoku grid */}
      {sudokuGrid && (
        <div className="sudoku-grid">
          {sudokuGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => (
                <input
                  key={colIndex}
                  type="number"
                  value={cell !== 0 ? cell : ""}
                  onChange={(e) =>
                    handleChange(rowIndex, colIndex, e.target.value)
                  }
                  disabled={initialGrid[rowIndex][colIndex] !== 0}
                  className={`cell ${cell !== 0 ? "filled" : ""}`}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Game;
