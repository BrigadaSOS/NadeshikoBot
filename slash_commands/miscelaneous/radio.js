const axios = require('axios');

module.exports = {
	name: 'radio',
	description: 'Listen some radio.',

	run: async (client, interaction) => {
        const response_countries_cities = await axios.get('http://radio.garden/api/ara/content/places')
        response_json = response_countries_cities.data.data.list;
            
        // console.log(response_json)
        total = Object.keys(response_json).length;
        list_countries = []

        // get list of countries with their cities
        for (let index = 0; index < total; index++) {
            list_countries.push([response_json[index].id, response_json[index].country, response_json[index].title])
        }
        console.log(list_countries)

        // get info from a specific city and their stations by id
        id_city = list_countries[0][0]; 
        console.log(id_city)
        response_city_info = await axios.get(`http://radio.garden/api/ara/content/page/${id_city}`)
        console.log(response_city_info.data.data.content[0])
        console.log('////////////////////////////////////////')
        length_items = response_city_info.data.data.content[0].items.length
        console.log(response_city_info.data.data.content[0].items[length_items - 1])
        /*
        console.log('-----------')
        console.log(response_city_info.data.data.content[1])
        console.log('-----------')
        console.log(response_city_info.data.data.content[2])
        console.log('-----------')
        console.log(response_city_info.data.data.content[3])
        console.log('-----------')
        console.log(response_city_info.data.data.content[4])
        console.log('-----------')
        console.log(response_city_info.data.data.content[5]) */

    },
};