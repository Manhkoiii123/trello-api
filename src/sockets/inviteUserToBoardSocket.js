export const inviteUserToBoardSocket = (socket) => {
  socket.on("invite-user-to-board", (invitation) => {
    // emit ngược lại cho mọi client khác (goại trừ chính thằng gửi req lên) để fe check
    socket.broadcast.emit("invite-user-to-board-be", invitation);
  });
};
