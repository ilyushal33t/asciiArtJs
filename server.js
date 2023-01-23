const axios = require('axios');
const express=require('express');
const app = express();
const fs = require('fs');
const PORT = 8000
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const bodyParser = require("body-parser");

const server_options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['json', 'js', 'css'],
    index: false,
    redirect: false,
    setHeaders (res, path, stat) {
      res.set('x-timestamp', Date.now())
      res.set('Access-Control-Allow-Origin', 'https://www.twitch.tv')
    }
};


//"data:image/png;base64,"+fs.readFileSync(file, 'base64');
async function base64_encode_url(url) {
  let image = await axios.get(url, {responseType: 'arraybuffer'});
    return Buffer.from(image.data).toString('base64');
}

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())


app.get('/', function(req,res){
   res.sendFile(__dirname + '/index.html')
});

app.post('/based',async function(req,res){
    console.log(req.body)
    let base64 = await base64_encode_url(req.body.url);
    let based = {
        data: 'data:image/png;base64,' + base64
    }
    

    io.emit('loaded_based64_img', based);

    res.end();
  });

app.use('/js',express.static(path.join(__dirname,'js'),server_options));
app.use('/css',express.static(path.join(__dirname,'css'),server_options));


server.listen(PORT,function(){
     console.log("Express Started on Port " + PORT);
});