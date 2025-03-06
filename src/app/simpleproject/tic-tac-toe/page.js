"use client"

import { useState } from "react";
function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i=0; i<lines.length;i++){
        const [a,b,c]=lines[i];
        if(squares[a] && squares[a]===squares[b] && squares[a]===squares[c]){
            return squares[a];
        }
    }
    return null;
  }
function Board({squares,xIsNext,onPlay}){

    
    const handleClick = (index) => {
        if(squares[index] || calculateWinner(squares)){
            return
        }
        const nextSquares=squares.slice()
        if(xIsNext){
            nextSquares[index]='X'
        }else{
            nextSquares[index]='O'
        }
       onPlay(nextSquares)
    }
    const winner=calculateWinner(squares)
    let status;
    if(winner){
        status='Winner:'+winner;
    }else if (!squares.includes(null)) {
        status = "It's a Tie!"; 
    }else{
        status="Next Player:"+ (xIsNext?'X':'O');
    }
    return (
        <div className="flex flex-col justify-center items-center">
            <div className="text-lg font-semibold">{status}</div>
            <div className="board-row flex">
            <Square value={squares[0]} handleClick={handleClick} index={0}/>
            <Square value={squares[1]} handleClick={handleClick} index={1}/>
            <Square value={squares[2]} handleClick={handleClick} index={2}/>
            </div>
            <div className="board-row flex">
            <Square value={squares[3]} handleClick={handleClick} index={3}/>
            <Square value={squares[4]} handleClick={handleClick} index={4}/>
            <Square value={squares[5]} handleClick={handleClick} index={5}/>
            </div>
            <div className="board-row flex">
            <Square value={squares[6]} handleClick={handleClick} index={6}/>
            <Square value={squares[7]} handleClick={handleClick} index={7}/>
            <Square value={squares[8]} handleClick={handleClick} index={8}/>
            </div>
        </div>
    )
}
function Square({value,index,handleClick}){

    return (
        <button 
        className="w-16 h-16 bg-white border-2 border-gray-400 flex items-center justify-center text-xl font-bold shadow-md hover:bg-gray-100 active:bg-gray-200 transition"
        onClick={()=>handleClick(index)}>
        {value}
        </button>
    );
}

export default function TicTacToe(){
    const [history,setHistory]=useState([Array(9).fill(null)])
    const [currentmove,setCurrentmove]=useState(0)
    const xIsNext = currentmove % 2 === 0;
    const currentSquares = history[currentmove];
    
    const onPlay=(nextSquares)=>{
        const nextHistory=[...history.slice(0,currentmove+1),nextSquares]
        setHistory(nextHistory);
        setCurrentmove(nextHistory.length-1)
    }
    const jumpTo=(move)=>{
        setCurrentmove(move);
        // setXIsNext(move%2===0)
    }
    const moves=history.map((squares,move)=>{
        let description;
        if(move>0){
            description="Go to move #"+move;
        }else{
            description="Go to game start";
        }
        return(
            <li key={move} >
                <button onClick={()=>jumpTo(move)}>{description}</button>
            </li>
        )
    })
    return (
        <div className="tic-tac-toe">
        <h1 className="my-8 text-xl font-bold text-center">Tic Tac Toe</h1>
        <div className="game flex w-full justify-center">
            <div className="game-board">
            <Board xIsNext={xIsNext} squares={currentSquares} onPlay={onPlay}/>
            </div>
            <div className="game-info">
            <div className="text-lg font-bold text-center ">History</div>
            <ol className="mx-2 ">{moves}</ol>
            </div>
        </div>
        </div>
    );
}