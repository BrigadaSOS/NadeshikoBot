const deepl = require('../../utils/translateService');

module.exports = {
	name: 'excel',
	description: 'Nothing',
	run: async (client, interaction, args) => {
        array = [];
        finalArray = [];
        contador = 0;

        const LineByLineReader = require('line-by-line'),
        lr = new LineByLineReader('./translate.txt');
        const fs = require('fs');

        lr.on('line', function(line) {
            lr.pause();
            async function translate() {
                result_translated = await deepl.translateService(line);
                finalArray.push(result_translated);
                contador += 1;
                console.log(contador + ' | ' + result_translated);
                
                lr.resume();
            }
            translate();
        });

        lr.on('end', function() {
            console.log(finalArray);
            const text = finalArray.join('\n');
            fs.writeFileSync('./results.txt', text, 'utf8');

        });


	},
};