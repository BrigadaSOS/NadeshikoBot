const { TwitterApi } = require("twitter-api-v2");

module.exports = {
  name: "tweet",
  description: "Agarra un tweet aleatorio.",
  args: true,
  execute(message, args) {
    var stringUsername = args[0];
    gatherTweets(stringUsername, message);
  },
};

async function gatherTweets(stringUsername, message) {
  // Credentials Auth API Twitter
  const twitterClient = new TwitterApi({
    appKey: process.env.consumer_key,
    appSecret: process.env.consumer_secret,
    accessToken: process.env.access_token_key,
    accessSecret: process.env.access_token_secret,
  });

  const config = require("../../config.json");
  const Discord = require("discord.js");
  // Custom Webhook
  const webhookClient = new Discord.WebhookClient(
    config.webhookID,
    config.webhookToken
  );
  // Embed message variable for Discord
  const EmbedTwitter = new Discord.MessageEmbed();

  // Get user ID and URL from profile picture
  const userTwitter = await twitterClient.v2.userByUsername(stringUsername, {
    "user.fields": "profile_image_url",
  });
  idUser = userTwitter.data.id;
  urlAvatar = userTwitter.data.profile_image_url.replace("_normal", "");
  nameUser = userTwitter.data.name;

  // Get username
  usernameTwitter = userTwitter.data.username;

  // Get Tweet list from an user by ID
  const tweetList = await twitterClient.v2.userTimeline(idUser, {
    exclude: "replies,retweets",
    max_results: "100",
    expansions: "attachments.media_keys",
    "tweet.fields": "attachments",
    "media.fields": "media_key,url,height,type",
  });

  // Amount of tweets
  amountTweets = Object.keys(tweetList.data.data).length;
  const randomNumber = between(0, amountTweets - 1);
  console.log("--------------Tweet data-----------------");

  // Get tweet data by index
  console.log(tweetList.data.data[randomNumber]);

  // Get media key by index from a tweet
  try {
    console.log(tweetList.data.data[randomNumber].attachments.media_keys);
    console.log("-------------Include data----------------");
    console.log(tweetList.data.includes.media);
    console.log("-----------------------------------------");
    var string = tweetList.data.includes.media;
    var string2 = tweetList.data.data[randomNumber].attachments.media_keys;

    for (let x in string2) {
      keyTweet = tweetList.data.data[randomNumber].attachments.media_keys[x];
      console.log("Key_media_tweet: " + keyTweet);
    }

    let savedMedia;
    for (let i in string) {
      keyInclude = string[i].media_key;
      if (keyInclude == keyTweet) {
        keyCoincidence = string[i].media_key;
        savedMedia = string[i].url;
      }
      console.log("Key_include: " + keyInclude);
    }
    console.log("Key coincidence: " + keyCoincidence);

    urlImage = savedMedia;
    console.log(urlImage);

    tweetID = tweetList.data.data[randomNumber].id;
  } catch (error) {
    console.log("No hay archivos multimedia.");
    urlImage = null;
  }

  // Set properties to EmbedTwitter
  contentTweet = tweetList.tweets[randomNumber].text.replace(
    /https?:\/\/t\.co\/\S+\s*$/g,
    ""
  );

  EmbedTwitter.setDescription(contentTweet).setColor("#0099ff");

  if (urlImage != null) {
    EmbedTwitter.setImage(urlImage);
  }

  message.channel
    .createWebhook(nameUser, {
      avatar: urlAvatar,
    })
    .then((webhook) => console.log(`Created webhook ${webhook}`))
    .catch(console.error);

  try {
    const webhooks = await message.channel.fetchWebhooks();
    const webhook = webhooks.first();

    await webhook.send(EmbedTwitter, {
      embeds: [EmbedTwitter],
    });
  } catch (error) {
    console.error("Error trying to send: ", error);
  }
}

// Random number form an interval
function between(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
