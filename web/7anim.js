var cheerio = require('cheerio');
var request = require('request');
var requestPromise = require('request-promise');

const Abase_url = "https://4anime.to/anime/?s=";

function anime(uri){
  //Strip input text to make url
  var uri = sb.value.replace(/ /g, '+');

  //Request a html page from link
  request(Abase_url + uri, (error, response, html) => {
    if(!error && response.statusCode == 200){
      var $ = cheerio.load(html,  { ignoreWhitespace: true });

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
        requestPromise(l, (error, response, html) => {
          page = cheerio.load(html,  { ignoreWhitespace: true });

          var descr = page('#description-mob').text().substring(12);
          if(page('#fullcontent').length != 0) descr = page('#fullcontent').text();
          descr = descr.replace("READ LESS", " ");
          descr = descr.replace("READ MORE", " ");

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

          //Add extra details
          var details = document.createElement('span');
          details.id = 'details';
          newCard.appendChild(details);
          var info = page('.detail').find('.data');
          info.each((i, det) => {
            if(i == 0) details.innerText += "Type: " + page(det).text() + "\n";
            if(i == 1) details.innerText += "Studio: " + page(det).text() + "\n";
            if(i == 2) details.innerText += "Release Date(JP): " + page(det).text() + ",";
            if(i == 3) details.innerText += " " + page(det).text() + "\n";
            if(i == 4) details.innerText += "Status: " + page(det).text() + "\n";
            if(i == 5) details.innerText += "Language: " + page(det).text() + "\n";
          });
        }).then(() => {
          setTimeout(2000, loading(false));
        });

        //Instance of link card
        newCard.addEventListener('click', () => {
          Array.from(document.getElementById('links').children).forEach((el) => {el.remove();});

          overlay.style.display = "block";
          document.querySelector('body').style.overflow = "hidden";

          request(l, (error, response, html) => {
            page = cheerio.load(html,  { ignoreWhitespace: true });

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
  });
}
