const { MessageEmbed } = require('discord.js');

const axios = require('axios');
const { list } = require('pm2');

module.exports = {
	name: 'domain',
	description: 'Lorem ipsum.',

	run: async (client, interaction) => {
		const message = await interaction.fetchReply();

        const domain_info = await searchDomainInfo('brigadasos.com');
        console.log(domain_info);
        const relatedDomains = await generateRelatedDomains(domain_info);
        console.log(relatedDomains);
        
		const embed = new MessageEmbed()
			.setTitle('Dominio')
			.setDescription(`s`)
			.setColor('eb868f');
		interaction.editReply({ embeds: [embed] });

	},
};


async function searchDomainInfo(domain_name_input){
    domain_name = domain_name_input;
    api_key_whois = 'at_z87gUpqgITQINjhiopFTOuBGWMzKL';
    base_provider = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${api_key_whois}&domainName=${domain_name}&outputFormat=JSON&da=1`

    const response_raw_whois = await axios.get(base_provider);
    response_data_whois = response_raw_whois.data;
    
    createdDate = response_raw_whois.data.WhoisRecord.audit.createdDate;
    domainAvailability = response_raw_whois.data.WhoisRecord.domainAvailability;
    domainNameExt = response_raw_whois.data.WhoisRecord.domainNameExt;
    registrarName = response_raw_whois.data.WhoisRecord.registrarName;
    expiresDate = response_raw_whois.data.WhoisRecord.registryData.expiresDate;

    if (expiresDate !== undefined){
        if (expiresDate.includes('sponsoring')){ expiresDate = undefined; }
    }

    var result = {
        DomainName: domain_name_input,
        DomainNoExt: domain_name_input.split('.', 1).toString(),
        DomainAvailability: domainAvailability,
        CompanyName: registrarName,
        DateRegister: createdDate,
        ExpiresDate: expiresDate,
        ExtDomain: domainNameExt,
        price: parseFloat(generateRandomPriceUSD(1, 100)),
    }

    return result;
}


async function generateRelatedDomains(domain_info){
    name_domain = domain_info.DomainNoExt;
    list_extensions = ['com', 'net', 'xyz', 'art', 'digital', 'uk', 'pro', 'cc', 'mx', 'fm'];
    const shuffled = list_extensions.sort(() => Math.random() - 0.5)
    result_list = [];
    for (let i = 0; i < 5; i++) {        
        result = await searchDomainInfo(`${name_domain}.${shuffled[i]}`);
        result_list.push(result)
    }
    return(result_list);
}

function generateRandomPriceUSD(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min)-0.1+'9';
}

