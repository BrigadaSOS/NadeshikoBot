const deepl = require('../utils/translateService');

module.exports = {
    name: 'deepl',
    description: 'Translate a sentences with DeepL',
    options: [
      {
      name: 'deepl',
      description: 'Translate something.',
      type: 'STRING',
      required: true,
      },
    ],
    run: async(client, interaction, args) =>{
        result = await deepl.translateService(args[0]);
        interaction.editReply(result);
    },
}