var parentVid = document.getElementById('parent-vid');
var iframe = document.getElementById('vid');
var nxt = document.getElementById('next');
var prev = document.getElementById('previous');

function streamPage(link){
  request(link, (error, response, html) => {
    if(!error && response.statusCode == 200){
      const $ = cheerio.load(html);
      var parent = $('.mirror_source').prev().html().match(/\bhttps?:\/\/\S+/gi)[0];
      parent = parent.substring(0, parent.length - 5);

      parentVid.style.display = "flex";
      iframe.setAttribute('src', parent);

      nxt.setAttribute('href', $('.anipager-next').find('a').attr('href'));
      prev.setAttribute('href', $('.anipager-prev').find('a').attr('href'));
    }
  });
}

nxt.onclick = function(){
  streamPage(this.href);
  return false;
}

prev.onclick = function(){
  streamPage(this.href);
  return false;
}

document.getElementById('cl').addEventListener('click', () => {
  parentVid.style.display = "none";
  iframe.setAttribute('src', "undefined");
});
