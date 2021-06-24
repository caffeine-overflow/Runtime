
const { ChatGroup } = require("../models/chatGroup.js");
const { ChatMessage } = require("../models/chatMessage.js");
const errorHandler = require('../utils/errorhandler');

let getChatHistory = async (socket, chatGroup) => {
    try {
        socket.join(chatGroup.id);
        let messages = await ChatMessage.find({ 'group_id': chatGroup.id })
            .populate('author', { _id: 1, git_avatar: 1 })
            .sort({ _id: "descending" });

        socket.emit('receiveChatHistory', { messages });
    }
    catch (err) {
        console.log(err);
    }
}

let sendMessage = async (socket, message, io) => {
    let { author, group_id, content } = message;
    try {
        const chatMessage = await new ChatMessage({
            author: author,
            group_id: group_id,
            content: content,
            created_at: new Date().toLocaleString()
        }).save();

        let messages = await ChatMessage.find({ 'group_id': group_id })
            .populate('author', { _id: 1, git_avatar: 1 })
            .sort({ _id: "descending" });

        io.in(group_id).emit('receiveChatHistory', { messages });
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = { getChatHistory, sendMessage };