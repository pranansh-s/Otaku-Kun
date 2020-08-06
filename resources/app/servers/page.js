var cheerio = require('cheerio');
var request = require('request');

var sb = document.getElementById('s-bar');
var s = document.getElementById('bar');

var dwn_c = document.getElementById('dwn-page');
var overlay = document.getElementById('overlay');

const base_url = "https://mangakakalot.com/search/story/";
var searched = false;

sb.style.width = "60px";

function scrape(event){
  //Check if the search box was empty and if there was a "click" or "Enter-key" event
  if(sb.value != "" && (event.type == 'click' || (event.type == 'keypress' && event.keyCode == 13))){
    if(!searched){
      document.querySelector('h1').style.animationName = "myAnimation";
    }
    //Clear all previous search results
    searched = true;
    Array.from(document.getElementById('res').children).forEach((el) => {
      el.remove();
    });

    s.style.top = "3%";
    s.style.transform = "translate(-50%, -3%)";

    sb.focus();
    sb.style.width = "500px";

    //Strip input text to make url
    var uri = sb.value.replace(/ /g, '_');

    //Request a html page from link
    request(base_url+uri, (error, response, html) => {
      //Check search result (error and response)
      if(!error && response.statusCode == 200){
        const $ = cheerio.load(html);

        //Get all results for search in a Node List
        $('.story_item').each((i, el) => {
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

          //Add a name to the card
          var mainH = $(el).find('.story_name');
          var nameHolder = document.createElement('span');
          var name = mainH.text().trim().toUpperCase();

          var nameC = name;
          if(name.length > 37) var nameC = nameC.substring(0, 36).trim() + "...";

          newCard.appendChild(nameHolder);
          nameHolder.innerText = nameC;

          //Add a description the card
          var descr;
          var l = mainH.find('a').attr('href');
          request(l, (error, response, html) => {
            if(!error && response.statusCode == 200){
              var page = cheerio.load(html);

              descr = page('.panel-story-info-description').text().substring(15);
              if(descr == "") descr = page('#noidungm').text();
              var descrC = descr;
              if(descrC.length >= 340) descrC = descr.substring(0, 340) + "...";
              descrC = descrC.trim().replace(/(\r\n|\n|\r)/gm," ");

              var descrH = document.createElement('span');
              newCard.appendChild(descrH);
              descrH.id = 'description';
              descrH.innerText = descrC;
            }
          });

          //Add extra details
          $(el).find('span').each((x, det) => {
            var details = document.createElement('span');
            details.id = 'details';
            newCard.appendChild(details);

            details.innerText = det.children[0].data;
            if(det.children[0].data[0] == 'A'){
              details.innerText = details.innerText.split(',')[0];
            }
          })

          //Add a pfp to the card
          var imgL = $(el).find('img').attr('src');
          var imgHolder = document.createElement('div');
          newCard.appendChild(imgHolder);

          var img = imgHolder.appendChild(document.createElement('img'));
          imgHolder.appendChild(img);

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

            request(l, (error, response, html) => {
              page = cheerio.load(html);
              var list = page('.chapter-list');
              if(list.length == 0) list = page('.row-content-chapter');

              list.find('a').each((x, ele) => {
                if(x != 0){
                  var link_chap = page(ele).attr('href');
                  var name_chap = page(ele).text();

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
                }
              });
            });
          });
        });
      }
    });
  }
}


//js animations for search bar
document.getElementById('btn').addEventListener("mouseover", () => {
  document.getElementsByClassName('iconR')[0].style.borderRadius = "0px 7px 7px 0px";
  sb.style.width = "500px";
  sb.style.textShadow = "0 0 0 #000000";
});

sb.addEventListener("mouseout", () => {
  if(sb.value == "" && !searched){
    sb.style.width = "60px";
    document.getElementsByClassName('iconR')[0].style.borderRadius = "7px";
  }
});

document.getElementById('close').addEventListener('click', () => {
  document.querySelector('body').style.overflow = "scroll";
  document.getElementById("border").scrollTo(0, 0);
  overlay.style.display = "none";
});

sb.addEventListener('blur', () => { if(!searched) sb.style.width = "60px"; });

//On search button click
document.getElementById('btn').addEventListener("click", scrape);
sb.addEventListener("keypress", scrape);
