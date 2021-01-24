var cheerio = require('cheerio');
var request = require('request');
var requestPromise = require('request-promise');

var icons = ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png", "8.png", "9.png", "10.png", "11.png", "12.png"];

const Mbase_url = "http://manga-reader.fun/search?q=";

function loading(show){
  if(show){
    document.getElementById("hide").id = "loader";
    document.getElementById("res").style.opacity = "0%";
    document.loadIcon.src = "./loadIcons/" + icons[Math.floor(Math.random() * (icons.length))];
  }
  else{
    document.getElementById("loader").id = "hide";
    document.getElementById("res").style.opacity = "100%";
  }
}

//Check for legitimate search
function scrape(event){
  //Check if the search box was empty and if there was a "click" or "Enter-key" event
  if(sb.value != "" && (event.type == 'click' || (event.type == 'keypress' && event.keyCode == 13))){
    if(document.getElementById("choose").className=="active") toggleDropdown();
    if(!searched) document.querySelector('h1').style.animationName = "myAnimation";
    document.getElementById('NF').style.display = "none";
    //Clear all previous search results
    searched = true;
    Array.from(document.getElementById('res').children).forEach((el) => {el.remove();});
    s.style.top = "3%";
    s.style.transform = "translate(-50%, -3%)";

    sb.focus();
    sb.style.width = "35vw";

    loading(true);

    if(toSearchfor == "manga") manga();
    else anime();
  }
}

function initCard(){
  //For each of items create a new Div to represent
  var newCard = document.createElement('li');
  document.getElementById('res').appendChild(newCard);

  var leftP = document.createElement('div');
  var rightP = document.createElement('div');
  leftP.id = 'leftp';
  rightP.id = 'rightp';
  newCard.id = 'card';
  newCard.append(leftP);
  newCard.append(rightP);
  return newCard;
}

function manga(){
  //Strip input text to make url
  var uri = sb.value.replace(/ /g, '+');

  //Request a html page from link
  requestPromise(Mbase_url+uri, (error, response, html) => {
    //Check search result (error and response)
    if(!error && response.statusCode == 200){
      var $ = cheerio.load(html,  { ignoreWhitespace: true });

      //Get all results for search in a Node List
      var cards = $('.list-truyen-item-wrap');
      if(cards.length == 0){
        document.getElementById('NF').style.display = "block";
        loading(false);
        return;
      }
      cards.each((i, el) => {
        var newCard = initCard();

        //Add a name to the card
        var mainH = $(el).find('h3');
        var nameHolder = document.createElement('span');
        var name = mainH.text().trim().toUpperCase();

        var nameC = name;
        if(name.length > 37) var nameC = nameC.substring(0, 36).trim() + "...";

        newCard.appendChild(nameHolder);
        nameHolder.innerText = nameC;

        //Add a description to the card
        var descr = $(el).find('p').text();
        descr = descr.replace("Read more", "");
        var descrC = descr;
        if(descrC.length >= 340) descrC = descrC.substring(0, 340) + "...";
        descrC = descrC.trim().replace(/(\r\n|\n|\r)/gm," ");

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
        details.innerText += "Views: " + $(el).find('span').text();
        details.appendChild(document.createElement('br'));
        details.innerText += "Latest: " + $(el).find('a')[2].firstChild.data;

        //Add a pfp to the card
        var imgL = $(el).find('img').attr('src');
        var imgHolder = document.createElement('div');
        newCard.appendChild(imgHolder);

        var img = imgHolder.appendChild(document.createElement('img'));
        imgHolder.appendChild(img);

        if(imgL[0] == '/') imgL = "https:" + imgL;
        img.setAttribute('src', imgL);

        //Instance of download card
        newCard.addEventListener('click', () => {
          Array.from(document.getElementById('links').children).forEach((el) => {
            el.remove();
          });

          overlay.style.display = "block";
          document.querySelector('body').style.overflow = "hidden";

          dwn_c.querySelector('#name').innerText = name;
          dwn_c.querySelector('#content').innerText = descr;

          var l = mainH.find('a').attr('href');
          request(l, (error, response, html) => {
            page = cheerio.load(html,  { ignoreWhitespace: true });
            var list = page('.chapter-list');
            if(list.length == 0) list = page('.row-content-chapter');

            var chap = 1;
            list.find('a').each((x, ele) => {
              var link_chap = page(ele).attr('href');
              var name_chap = String(chap);
              chap++;

              var newli = document.createElement('li');
              var ahref = document.createElement('a');
              document.getElementById('links').appendChild(newli);
              newli.appendChild(ahref);
              ahref.setAttribute('href', link_chap);
              ahref.innerText = name_chap;

              ahref.onclick = function(){
                pdf(link_chap, name_chap);
                return false;
              }
            });
          });
        });
      });
    }
  }).then(() => {
    setTimeout(2000, loading(false));
  });
}

//On search button click
document.getElementById('iconR').addEventListener("click", scrape);
sb.addEventListener("keypress", scrape);
