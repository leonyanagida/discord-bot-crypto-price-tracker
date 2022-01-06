import axios from "axios";
import { Client, Intents } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

function fetchCryptoPrice(): void {
  axios
    .get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${process.env.CURRENCY}&ids=${process.env.COIN_ID}`
    )
    .then((res) => {
      if (res.data && res.data[0]) {
        const currentPrice = res.data[0].current_price || 0;
        const percentageChange = res.data[0].price_change_percentage_24h || 0;
        const priceChange = res.data[0].price_change_24h || 0;
        const symbol = res.data[0].symbol || "?";

        // Set the presence of the bot to show the price and percentage change
        client?.user?.setPresence({
          activities: [
            {
              name: `${priceChange.toFixed(2)} (${percentageChange.toFixed(
                2
              )}%)`,
            },
          ],
          status: "online",
        });

        // Change the nickname of the bot to show the current price
        client.guilds.cache.map((guild) => {
          if (guild.id === process.env.SERVER_ID) {
            guild?.me?.setNickname(
              `
              ${symbol.toUpperCase()} ${
                process.env.CURRENCY_SYMBOL
              }${currentPrice
                .toLocaleString()
                .replace(/,/g, process.env.THOUSAND_SEPARATOR)}
            `
            );
          }
        });
      } else console.log("The coin does not exist:", process.env.COIN_ID);
    })
    .catch((error) =>
      console.log("Error fetching data from the coingecko api!", error)
    );
}

// Runs when client connects to Discord
client.on("ready", () => {
  console.log("Client has connected to Discord...");

  // Initial fetch api
  fetchCryptoPrice();

  // How often to call the coingecko api
  setInterval(
    fetchCryptoPrice,
    Math.max(1, Number(process.env.API_UPDATE_FREQUENCY) || 1) * 60 * 1000
  );
});

// Discord login
client.login(process.env.DISCORD_BOT_TOKEN);
