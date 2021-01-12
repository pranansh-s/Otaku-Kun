var path = require('path');

const htPdf = require('html-pdf');
const ejs = require('ejs');

const fs = require('fs');

var {BrowserWindow, dialog} = require('electron').remote;

let savedjson = JSON.parse(fs.readFileSync('savedPath.json'))
var pathDownload = savedjson.name;

var config = {
  height: "960px",
  width: "720px",
  orientation: "potrait",
  timeout: '100000'
};

let options = {
  title : "Select Download Destination",
  buttonLabel : "Select",
  properties:["openDirectory"]
};

async function getPath(){
  pathDownload = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), options);
  pathDownload = pathDownload.filePaths[0];
  let data = {
    name : pathDownload
  };
  data = JSON.stringify(data);
  fs.writeFileSync('savedPath.json', data);
}

document.getElementById('selectPath').addEventListener("click", getPath);

function pdf(link, name){
  var pages = [];
  request(link, (error, response, html) => {
    if(!error && response.statusCode == 200){
      const dwn = cheerio.load(html);

      //Get all links to images in order
      res = dwn('#arraydata').text();
      pages = res.split(',');

      //Create a html file from it using ejs template
      fs.readFile('pdfTemplate.ejs', "utf-8", (error, content) => {
        if(!error){
          const html = ejs.render(content, {pages,});

          //Convert html to valid pdf file
          htPdf.create(html, config).toStream((err, stream) => {
            stream.pipe(fs.createWriteStream(path.join(pathDownload, name.replace(/[<>:"/\|?*]/g,"") + '.pdf')));
            alert('Downloaded ' + name);
          });
        }
        else alert(error);
      });
    }
  });
}
