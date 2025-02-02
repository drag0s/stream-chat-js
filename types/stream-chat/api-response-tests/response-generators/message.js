const uuidv4 = require('uuid/v4');
const fs = require('fs');
const utils = require('../utils');

const johnID = `john-${uuidv4()}`;

async function updateMessage() {
	const authClient = await utils.getTestClientForUser(johnID, {});
	const channel = authClient.channel('messaging', 'poppins');
	await channel.watch();
	const { message } = await channel.sendMessage({ text: `Test message` });
	await authClient.updateMessage({
		id: message.id,
		text: 'I mean, awesome chat',
	});
}

async function sendMessage() {
	const authClient = await utils.getTestClientForUser(johnID, {});
	const channel = authClient.channel('messaging', 'poppins');
	await channel.watch();
	return await channel.sendMessage({ text: `Test message` });
}

async function deleteMessage() {
	const authClient = await utils.getTestClientForUser(johnID, {});
	const channel = authClient.channel('messaging', 'poppins');
	await channel.watch();
	const { message } = await channel.sendMessage({ text: `Test message` });

	await authClient.deleteMessage(message.id);
}

async function sendAction() {
	const authClient = await utils.getTestClientForUser(johnID, {});
	const channel = authClient.channel('messaging', 'poppins');
	await channel.watch();
	const { message } = await channel.sendMessage({ text: `/giphy wave` });

	const messageID = message.id;
	return await channel.sendAction(messageID, {
		image_action: 'shuffle',
	});
}

async function getReplies() {
	const serverAuthClient = utils.getTestClient(true);
	const userID = 'tommaso-' + uuidv4();
	const channelID = `free4all-` + uuidv4();
	const thierry = {
		id: uuidv4(),
		instrument: 'saxophone',
	};

	await utils.getTestClient(true).updateUser(thierry);
	await utils.getTestClient(true).updateUser({ id: userID, instrument: 'guitar' });
	const channel = serverAuthClient.channel('team', channelID, {
		created_by: { id: thierry.id },
		members: [userID, thierry.id],
	});
	await channel.create();

	const response = await channel.sendMessage({
		text: '@thierry how are you doing?',
		user: { id: userID },
		mentioned_users: [thierry.id],
	});
	await channel.sendMessage({
		text: '@tommaso I am doing great?',
		user: { id: thierry.id },
		mentioned_users: [userID],
		parent_id: response.message.id,
	});
	await channel.query();
	const parent = channel.state.messages[channel.state.messages.length - 1];

	return await channel.getReplies(parent.id);
}

module.exports = {
	updateMessage,
	sendMessage,
	deleteMessage,
	sendAction,
	getReplies,
};
