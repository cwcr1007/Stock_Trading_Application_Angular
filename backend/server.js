const express = require("express");
const cors = require('cors');

const app = express();
app.use(cors());

const port = 3080;
const API_Key = 'c83i8diad3ift3bmact0';
const fetch = require('node-fetch');

app.use(express.static(process.cwd() + "/stock-proj/dist/stock-proj"))

app.get('/api', (req, res) => {
    res.send("Bob's stock search 2.0");
});

app.get('/', (req, res) =>{
    res.sendFile(process.cwd() + "stock-proj/dist/stock-proj/index.html")
})

app.get('/api/description/:ticker', async (req, res) => {
    let ticker = req.params.ticker.toUpperCase();
    let url = `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${API_Key}`;
    let response = await fetch(url);
    let data = await response.json();
    //console.log(data);
    res.json(data);
});

app.get('/api/history/:ticker/:resolution/:from&:to', async (req, res) => {
    let ticker = req.params.ticker.toUpperCase();
    let resolution = req.params.resolution;
    let from = req.params.from;
    let to = req.params.to;
    let url = `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=${resolution}&from=${from}&to=${to}&token=${API_Key}`;
    let response = await fetch(url);
    let data = await response.json();
    //console.log(data);
    res.json(data);
});

app.get('/api/price/:ticker', async (req, res) => {
    let ticker = req.params.ticker.toUpperCase();
    let url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_Key}`;
    let response = await fetch(url);
    let data = await response.json();
    //console.log(data);
    res.json(data);
});

app.get('/api/auto/:input', async (req, res) => {
    let query = req.params.input.toUpperCase();

    let url = `https://finnhub.io/api/v1/search?q=${query}&token=${API_Key}`;
    let response = await fetch(url);
    let data = await response.json();

    let arr = [];
    for (let i = 0; i < data.count; i++) {
        if (await data.result[i].type == "Common Stock" && !data.result[i].symbol.includes('.')) {
            arr.push(data.result[i]);
        }
    }
    //console.log(arr);
    res.send(JSON.stringify(arr));
});

app.get('/api/news/:ticker/:from&:to', async (req, res) => {
    let ticker = req.params.ticker.toUpperCase();
    let from = req.params.from;
    let to = req.params.to;
    let url = `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${API_Key}`;
    let response = await fetch(url);
    let data = await response.json();
    let arr = [];
    let count = 0;
    for (let i of await data) {
        if (i.image !== "" && count < 20) {
            arr.push(i);
            count = count + 1;
        }
    }
    //console.log(arr);
    res.send(JSON.stringify(arr));
});

app.get('/api/recommendation/:ticker', async (req, res) => {
    let ticker = req.params.ticker.toUpperCase();
    let url = `https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${API_Key}`;
    let response = await fetch(url);
    let data = await response.json();
    //console.log(data);
    res.json(data)
})

app.get('/api/social/:ticker/:from', async (req, res) => {
    let ticker = req.params.ticker.toUpperCase();
    let url = `https://finnhub.io/api/v1/stock/social-sentiment?symbol=${ticker}&from=2022-01-01&token=${API_Key}`;
    let response = await fetch(url);
    let data = await response.json();
    var dict = {
        reddit: 0,
        Rpositive: 0,
        Rnegative: 0,
        twitter: 0,
        Tpositive: 0,
        Tnegative: 0,
    };
    for(item of await data.reddit){
        dict["reddit"] += item.mention;
        dict["Rpositive"] += item.positiveMention;
        dict["Rnegative"] += item.negativeMention;
    }
    for(item of await data.twitter){
        dict["twitter"] += item.mention;
        dict["Tpositive"] += item.positiveMention;
        dict["Tnegative"] += item.negativeMention;
    }
    //console.log(data);
    //console.log(dict);
    res.send(JSON.stringify(dict));
})

app.get('/api/peer/:ticker', async (req, res) => {
    let ticker = req.params.ticker.toUpperCase();
    let url = `https://finnhub.io/api/v1/stock/peers?symbol=${ticker}&token=${API_Key}`;
    let response = await fetch(url);
    let data = await response.json();
    //console.log(data);
    res.json(data);
})

app.get('/api/earnings/:ticker', async (req, res) => {
    let ticker = req.params.ticker.toUpperCase();
    let url = `https://finnhub.io/api/v1/stock/earnings?symbol=${ticker}&token=${API_Key}`;
    let response = await fetch(url);
    let data = await response.json();
    for(let item of await data){
        if(item.actual == null){
            item.actual = 0;
        }
    }
    //console.log(data);
    res.json(data)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

module.exports = app;