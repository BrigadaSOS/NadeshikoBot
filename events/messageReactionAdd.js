const client = require('../index');

// Listener of reactions 
client.on('messageReactionAdd', async (reaction) => {
	if (reaction.partial) {
		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
		try {
			await reaction.fetch();

		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
        console.log('React');
        if (reaction.message.author.bot === true && 
            reaction.message.author.id === client.user.id && 
            reaction.emoji.name == '❌') {
            reaction.message.delete();
        }
	}
});