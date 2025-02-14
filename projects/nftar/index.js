// nftar/index.js

// Load environment variables from .env file.
require('dotenv').config();

const app = require('./src/app');
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const {
    Alchemy,
    Network,
} = require('alchemy-sdk');
const http = require('http');
const process = require('process');
const storage = require('nft.storage');

const main = async (api) => {
    // Inject client for our storage service into the context. We read the
    // API key for the service from the environment variable STORAGE_KEY.
    //
    // NB: app.context is the prototype from which the request ctx is
    // created.
    api.context.storage = new storage.NFTStorage({
        token: process.env.TOKEN_NFT_STORAGE,
    });

    // Import the wallet as a mnemonic. Assumes the default Ethereum
    // path and standard English wordlist.
    // const mnemonic = process.env.WALLET_MNEMONIC;
    // api.context.wallet = await ethers.Wallet.fromMnemonic(mnemonic);
    const web3 = new createAlchemyWeb3(process.env.INTERNAL_ALCHEMY_PUBLIC_API_URL);
    api.context.web3 = web3;
    api.context.wallet = web3.eth.accounts.privateKeyToAccount(process.env.KEY_MINT_PFP);

    // An Alchemy API client.
    api.context.alchemy = new Alchemy({
        apiKey: process.env.APIKEY_ALCHEMY_PUBLIC,
        network: Network[process.env.ALCHEMY_NETWORK],
        maxRetries: 10,
    });

    // The Ethereum minting contract address.
    api.context.pfp_contract = process.env.INTERNAL_MINT_PFP_OPERATOR_ADDRESS;
    api.context.invite_contract = process.env.INTERNAL_INVITE_OPERATOR_ADDRESS;

    // set the app api key
    api.context.apiKey = process.env.NFTAR_API_KEY;

    // This key, if set, will allow the caller to bypass the 409 error thrown
    // when requesting generation of a PFP that already exists. For testing.
    api.context.devKey = process.env.NFTAR_DEV_KEY;

    // Cloudflare environment configuration.
    api.context.cloudflare = {
        r2: {
            bucket: process.env.INTERNAL_CLOUDFLARE_R2_BUCKET,
            endpoint: process.env.INTERNAL_CLOUDFLARE_R2_API_ENDPOINT,
            publicURL: process.env.INTERNAL_CLOUDFLARE_R2_PUBLIC_URL,
            customDomain: process.env.INTERNAL_CLOUDFLARE_R2_CUSTOM_DOMAIN,
            accessKeyId: process.env.SECRET_CLOUDFLARE_R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_CLOUDFLARE_R2_SECRET_ACCESS_KEY
        }
    };

    // The port to listen on.
    const port = parseInt(process.env.PORT) || 3000;

    return { api, port };
};

(async () => {
    const { api, port } = await main(app);
    http.createServer(api.callback()).listen(port);
})();
