const { MessageEmbed } = require('discord.js');
const vision = require('@google-cloud/vision');
// const credentials = require('../credentials-google.json');
const download = require('image-downloader');

module.exports = {
	name: 'Scan-Image',
    type: 'MESSAGE',
	run: async (client, interaction) => {
        const clientVision = new vision.ImageAnnotatorClient({
            credentials,
        });
    },
};