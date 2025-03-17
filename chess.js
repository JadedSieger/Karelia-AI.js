const { Worker } = require("worker_threads");
const path = require("path");

// Stockfish Worker Path
const workerPath = path.join(__dirname, "stockfishWorker.js");
let moveHistory = []; 
function makeMove(userId, move, callback) {
    moveHistory.push(move);
    console.log(`🔄 Processing move for user: ${userId}, Move: ${move}`);

    const stockfishWorker = new Worker(workerPath);

    stockfishWorker.on("message", (msg) => {
        console.log(`📥 Worker Response: ${JSON.stringify(msg)}`);

        if (msg.type === "bestmove") {
            console.log(`✅ Best move received: ${msg.move}`);
            callback(msg.move);
            stockfishWorker.terminate(); // Stop worker after response
        }
    });

    stockfishWorker.on("error", (err) => {
        console.error(`❌ Stockfish Worker Error: ${err.message}`);
        callback(null);
        stockfishWorker.terminate();
    });

    stockfishWorker.on("exit", (code) => {
        console.log(`⚠️ Stockfish Worker exited with code ${code}`);
    });

    // Send move command to Stockfish
    stockfishWorker.postMessage(`position startpos moves ${moveHistory.join(" ")}`);
    stockfishWorker.postMessage("go depth 15");
}
module.exports = { makeMove };