var cheerio = require('cheerio');
var request = require('request');

const Abase_url = "https://4anime.to/anime/?s=";
const gogo = "https://4anime.to/";

function anime(uri){
  //Strip input text to make url
  var uri = sb.value.replace(/ /g, '+');

  //Request a html page from link
  request(Abase_url + uri, (error, response, html) => {
    if(!error && response.statusCode == 200){
      var $ = cheerio.load(html);

      var cards = $('#headerDIV_95').find('a');
      if(cards.length == 0){
        document.getElementById('NF').style.display = "block";
        loading(false);
        return;
      }
      cards.each((i, el) => {
        var newCard = initCard();

        //Add a name to the card
        var mainH = $(el).find('div');
        var nameHolder = document.createElement('span');
        var name = mainH.text().trim().toUpperCase();

        var nameC = name;
        if(name.length > 37) var nameC = nameC.substring(0, 36).trim() + "...";

        newCard.appendChild(nameHolder);
        nameHolder.innerText = nameC;

        //Add a pfp to the card
        var imgL = $(el).find('img').attr('src');
        var imgHolder = document.createElement('div');
        newCard.appendChild(imgHolder);

        var img = imgHolder.appendChild(document.createElement('img'));
        imgHolder.appendChild(img);
        img.setAttribute('src', imgL);

        //Add a description to the card
        var l = $(el).attr('href');
        request(l, (error, response, html) => {
          page = cheerio.load(html);

          var descr = page('#description-mob').text().substring(12);
          descr.replace("READ MORE", "");
          descr.replace("READ LESS", "");
          var descrC = descr;
          if(descrC.length >= 340) descrC = descrC.substring(0, 340) + "...";

          var descrH;
          if(descrC.length == 0){
            descrC = "No Information";
            descrH = document.createElement('i');
          }
          else descrH = document.createElement('span');
          newCard.appendChild(descrH);
          descrH.innerText = descrC;
          descrH.id = 'description';
        });

        //Instance of link card
        newCard.addEventListener('click', () => {
          Array.from(document.getElementById('links').children).forEach((el) => {el.remove();});

          overlay.style.display = "block";
          document.querySelector('body').style.overflow = "hidden";

          request(l, (error, response, html) => {
            page = cheerio.load(html);

            //Add a description to the card
            var descr = page('#description-mob').text().substring(12);
            var descrC = descr;
            if(descrC.length >= 340) descrC = descrC.substring(0, 340) + "...";

            dwn_c.querySelector('#name').innerText = name;
            dwn_c.querySelector('#content').innerText = descr;

            var episodes = page('.watchpage ul').find('li');
            episodes.each((no, ele) => {
              var link_ep = page(ele).find('a').attr('href');
              var name_ep = (no + 1);

              var newli = document.createElement('li');
              var ahref = document.createElement('a');

              document.getElementById('links').appendChild(newli);

              newli.appendChild(ahref);
              ahref.setAttribute('href', link_ep);
              ahref.innerText = name_ep;

              ahref.onclick = function(){
                streamPage(this.href);
                return false;
              }
            });
          });
        });
      });
    }
    loading(false);
  });
}
