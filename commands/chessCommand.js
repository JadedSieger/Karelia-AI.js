const { makeMove } = require('../chess'); // Import your existing chess logic

// Define the chessmove command
function handleChessMove(message, args) {
  const move = args[0];

  if (!move || !/^[a-h][1-8][a-h][1-8]$/.test(move)) {
    return message.reply("Invalid move. Please use algebraic notation (e.g., `e2e4`).");
  }

  makeMove(message.author.id, move, (aiMove) => {
    if (!aiMove) {
      return message.reply("⚠️ Unable to generate a move. Please try again.");
    }

    message.reply(`Your move: **${move}**\nKarelia moves: **${aiMove}**`);
  });
}

// Export the chessmove command
module.exports = {
  name: 'chessmove', // Command name
  description: 'Makes a chess move in algebraic notation (e.g., `e2e4`).', // Command description
  execute: handleChessMove, // Function to execute when the command is called
};