const { parentPort } = require("worker_threads");
const { spawn } = require("child_process");
const path = require("path");

// Load Stockfish as a child process
const stockfishPath = path.join(__dirname, "src", "stockfish-17-single.js");
const stockfish = spawn("node", [stockfishPath]);

console.log("✅ Stockfish Worker Started");

// Keep worker alive
process.stdin.resume();

// Send commands to Stockfish
parentPort.on("message", (msg) => {
    console.log(`📥 Received message in Worker: ${msg}`);
    stockfish.stdin.write(msg + "\n");
});

// Capture Stockfish responses
stockfish.stdout.on("data", (data) => {
    const response = data.toString();
    console.log(`📤 Stockfish Response: ${response}`);

    // Check if Stockfish returned a best move
    if (response.includes("bestmove")) {
        const match = response.match(/bestmove (\S+)/);
        if (match) {
            const bestMove = match[1];
            console.log(`♟️ Best move found: ${bestMove}`);

            // Send the best move back to the main bot
            parentPort.postMessage({ type: "bestmove", move: bestMove });
        }
    }
});

// Handle errors
stockfish.stderr.on("data", (err) => {
    console.error(`❌ Stockfish Error: ${err.toString()}`);
});

// Handle exit
stockfish.on("exit", (code) => {
    console.error(`⚠️ Stockfish Worker Exited with code ${code}`);
});
