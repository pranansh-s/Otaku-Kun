var cheerio = require('cheerio');
var request = require('request');

const htPdf = require('html-pdf');
const ejs = require('ejs');

const fs = require('fs');

const dialog = require('electron').remote.dialog;
var {BrowserWindow} = require('electron').remote;

let savedjson = JSON.parse(fs.readFileSync('savedPath.json'))
var pathDownload = savedjson.name;

var config = {
  height: "960px",
  width: "720px",
  orientation: "potrait",
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
      var res = dwn('.container-chapter-reader');
      if(res.length == 0) res = dwn('.vung-doc');

      var img = new Image();
      res.find('img').each((i, el) => {
        var lk = dwn(el).attr('src');
        var check = lk.charAt(10);

        var ind = 1;
        if(check == '.') ind = 0;

        lk = lk.substring(0, 9) + '8' + lk.substring(10 + ind, 19 + ind) + '8' + lk.substring(20 + 2 * ind);
        pages.push(lk);
      });

      //Create a html file from it using ejs template
      fs.readFile('pdfTemplate.ejs', "utf-8", (error, content) => {
        if(!error){
          const html = ejs.render(content, {pages,});

          //Convert html to valid pdf file
          htPdf.create(html, config).toStream((err, stream) => {
            stream.pipe(fs.createWriteStream(pathDownload + "\\" + name.replace(/[<>:"/\|?*]/g,"") + '.pdf'));
            alert('Downloaded ' + name);
          });
        }
        else alert(error);
      });
    }
  });
}
//
// module.exports = { pdf };
