import React, { useState, useEffect } from "react";
import axios from "axios";

function Game() {
  const [sudokuGrid, setSudokuGrid] = useState([]);
  const [initialGrid, setInitialGrid] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Sudoku puzzle when the component is mounted
  useEffect(() => {
    const fetchSudoku = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/Sudoku/generate?k=30" // Adjust the number of pre-filled cells if needed
        );
        setSudokuGrid(response.data);
        setInitialGrid(response.data); // Save the initial grid to prevent edits
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError("Failed to load Sudoku puzzle");
        console.error("Error generating Sudoku", err);
      }
    };
    fetchSudoku();
  }, []); // Only call once when the component is mounted

  // Function to handle Sudoku solving
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
      console.error("Error solving Sudoku", err);
    }
  };

  // Function to generate a new Sudoku puzzle
  const generateSudoku = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/Sudoku/generate?k=20" // Adjust URL if needed
      );
      setSudokuGrid(response.data);
      setInitialGrid(response.data); // Save the initial grid to prevent edits
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Failed to generate new puzzle");
      console.error("Error generating new Sudoku", err);
    }
  };

  return (
    <div>
      <h1>Sudoku Game</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <div>
        <button onClick={generateSudoku}>New Puzzle</button>
        <button onClick={solveSudoku} disabled={!sudokuGrid}>
          Solve
        </button>
      </div>

      {/* Render the Sudoku grid */}
      {sudokuGrid.length > 0 &&
        sudokuGrid.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex" }}>
            {row.map((cell, colIndex) => (
              <input
                key={colIndex}
                type="number"
                value={cell !== 0 ? cell : ""}
                onChange={(e) => {
                  const newGrid = [...sudokuGrid];
                  // Only allow updates to cells that were initially empty (i.e., 0)
                  if (initialGrid[rowIndex][colIndex] === 0) {
                    newGrid[rowIndex][colIndex] = e.target.value
                      ? parseInt(e.target.value, 10)
                      : 0;
                    setSudokuGrid(newGrid);
                  }
                }}
                disabled={initialGrid[rowIndex][colIndex] !== 0} // Disable if the cell was pre-filled
                style={{
                  width: "30px",
                  height: "30px",
                  textAlign: "center",
                  margin: "5px",
                  backgroundColor: cell !== 0 ? "#f0f0f0" : "#fff", // Optionally style the filled cells
                }}
              />
            ))}
          </div>
        ))}
    </div>
  );
}

export default Game;
