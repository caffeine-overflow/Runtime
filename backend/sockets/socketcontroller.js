
const { ChatGroup } = require("../models/chatGroup.js");
const { ChatMessage } = require("../models/chatMessage.js");
const { User } = require("../models/user.js");

//*get all the chat groups for the user
let getChatGroups = async (socket, user) => {
    let chatgroups = await ChatGroup.find({ 'users': user.user_id }).populate("users");
    let current_user = await User.findById(user.user_id);

    //*force the user to join all the available chat groups
    socket.join(chatgroups.map(c => c._id));
    socket.emit('receiveChatGroup', { chatgroups, current_user });
}

//*get the chat history for a specific chatgroup
let getChatHistory = async (socket, data) => {
    try {
        //*add the user id to the seen_by array
        await ChatGroup.findByIdAndUpdate(data.chatGroup, { $addToSet: { seen_by: data.user_id } },
            function (err, docs) {
                if (err) {
                    console.log(err)
                }
                else {
                }
            }
        );

        let messages = await ChatMessage.find({ 'group_id': data.chatGroup })
            .populate('author', { _id: 1, git_avatar: 1 })
            .sort({ _id: "descending" });

        socket.emit('receiveChatHistory', { chatGroupId: data.chatGroup, messages });
    }
    catch (err) {
        console.log(err);
    }
}

//*send message fuction
let sendMessage = async (socket, message, io) => {
    let { author, group_id, content } = message;
    try {
        await new ChatMessage({
            author: author,
            group_id: group_id,
            content: content,
            created_at: new Date().toLocaleString()
        }).save();

        //*make the seen_by array empty since there is a new message
        ChatGroup.findByIdAndUpdate(group_id, { seen_by: [] },
            function (err, docs) {
                if (err) {
                    console.log(err)
                }
                else {
                }
            }
        );

        let messages = await ChatMessage.find({ 'group_id': group_id })
            .populate('author', { _id: 1, git_avatar: 1 })
            .sort({ _id: "descending" });

        //*send to everybody in the same chat group
        io.in(group_id).emit('receiveChatHistory', { chatGroupId: group_id, messages });
    }
    catch (err) {
        console.log(err);
    }
}

//*function to update seen_to array accordingly
let onMessageSeen = async (socket, chatGroup, user_id) => {
    await ChatGroup.findByIdAndUpdate(chatGroup, { $addToSet: { seen_by: user_id } },
        function (err, docs) {
            if (err) {
                console.log(err)
            }
            else {
            }
        }
    );
    let chatgroups = await ChatGroup.find({ 'users': user_id }).populate("users");
    let current_user = await User.findById(user_id);

    socket.emit('receiveChatGroup', { chatgroups, current_user });
}

module.exports = { getChatHistory, sendMessage, onMessageSeen, getChatGroups };