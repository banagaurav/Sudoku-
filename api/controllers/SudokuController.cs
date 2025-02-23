using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

[Route("api/[controller]")]
[ApiController]
public class SudokuController : ControllerBase
{
    // Generate a Sudoku grid with K empty cells
    [HttpGet("generate")]
    public IActionResult GenerateSudoku([FromQuery] int k = 20)
    {
        int[,] sudoku = SudokuHelper.SudokuGenerator(k);
        List<List<int>> convertedGrid = SudokuHelper.ConvertToList(sudoku);
        return Ok(convertedGrid);
    }

    // Solve the given Sudoku puzzle
    [HttpPost("solve")]
    public IActionResult SolveSudoku([FromBody] List<List<int>> grid)
    {
        int[,] sudokuGrid = SudokuHelper.ConvertToArray(grid);
        if (SudokuHelper.SolveSudoku(sudokuGrid))
            return Ok(SudokuHelper.ConvertToList(sudokuGrid));
        else
            return BadRequest("Invalid Sudoku Puzzle");
    }
}

public static class SudokuHelper
{
    public static int[,] SudokuGenerator(int k)
    {
        int[,] grid = new int[9, 9];
        FillDiagonal(grid);
        FillRemaining(grid, 0, 0);
        RemoveKDigits(grid, k);
        return grid;
    }

    private static void FillDiagonal(int[,] grid)
    {
        for (int i = 0; i < 9; i += 3)
            FillBox(grid, i, i);
    }

    private static void FillBox(int[,] grid, int row, int col)
    {
        Random rand = new Random();
        int num;
        for (int i = 0; i < 3; i++)
        {
            for (int j = 0; j < 3; j++)
            {
                do
                {
                    num = rand.Next(1, 10);
                } while (!UnusedInBox(grid, row, col, num));
                grid[row + i, col + j] = num;
            }
        }
    }

    private static bool UnusedInBox(int[,] grid, int rowStart, int colStart, int num)
    {
        for (int i = 0; i < 3; i++)
            for (int j = 0; j < 3; j++)
                if (grid[rowStart + i, colStart + j] == num)
                    return false;
        return true;
    }

    private static bool FillRemaining(int[,] grid, int i, int j)
    {
        if (i == 9) return true;
        if (j == 9) return FillRemaining(grid, i + 1, 0);
        if (grid[i, j] != 0) return FillRemaining(grid, i, j + 1);

        for (int num = 1; num <= 9; num++)
        {
            if (CheckIfSafe(grid, i, j, num))
            {
                grid[i, j] = num;
                if (FillRemaining(grid, i, j + 1)) return true;
                grid[i, j] = 0;
            }
        }
        return false;
    }

    private static void RemoveKDigits(int[,] grid, int k)
    {
        Random rand = new Random();
        while (k > 0)
        {
            int cellId = rand.Next(81);
            int i = cellId / 9, j = cellId % 9;
            if (grid[i, j] != 0)
            {
                grid[i, j] = 0;
                k--;
            }
        }
    }

    private static bool CheckIfSafe(int[,] grid, int row, int col, int num)
    {
        return UnusedInRow(grid, row, num) &&
               UnusedInCol(grid, col, num) &&
               UnusedInBox(grid, row - row % 3, col - col % 3, num);
    }

    private static bool UnusedInRow(int[,] grid, int row, int num)
    {
        for (int j = 0; j < 9; j++)
            if (grid[row, j] == num)
                return false;
        return true;
    }

    private static bool UnusedInCol(int[,] grid, int col, int num)
    {
        for (int i = 0; i < 9; i++)
            if (grid[i, col] == num)
                return false;
        return true;
    }

    public static bool SolveSudoku(int[,] mat)
    {
        return SolveSudokuRec(mat, 0, 0);
    }

    private static bool SolveSudokuRec(int[,] mat, int row, int col)
    {
        if (row == 8 && col == 9) return true;
        if (col == 9) { row++; col = 0; }
        if (mat[row, col] != 0) return SolveSudokuRec(mat, row, col + 1);

        for (int num = 1; num <= 9; num++)
        {
            if (IsSafe(mat, row, col, num))
            {
                mat[row, col] = num;
                if (SolveSudokuRec(mat, row, col + 1)) return true;
                mat[row, col] = 0;
            }
        }
        return false;
    }

    private static bool IsSafe(int[,] mat, int row, int col, int num)
    {
        for (int x = 0; x < 9; x++)
            if (mat[row, x] == num || mat[x, col] == num)
                return false;

        int startRow = row - row % 3, startCol = col - col % 3;
        for (int i = 0; i < 3; i++)
            for (int j = 0; j < 3; j++)
                if (mat[i + startRow, j + startCol] == num)
                    return false;

        return true;
    }

    // **Conversion Methods**
    public static List<List<int>> ConvertToList(int[,] grid)
    {
        var list = new List<List<int>>();
        for (int i = 0; i < 9; i++)
        {
            var row = new List<int>();
            for (int j = 0; j < 9; j++)
            {
                row.Add(grid[i, j]);
            }
            list.Add(row);
        }
        return list;
    }

    public static int[,] ConvertToArray(List<List<int>> list)
    {
        int[,] grid = new int[9, 9];
        for (int i = 0; i < 9; i++)
        {
            for (int j = 0; j < 9; j++)
            {
                grid[i, j] = list[i][j];
            }
        }
        return grid;
    }
}
