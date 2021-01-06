var parentVid = document.getElementById('parent-vid');
var iframe = document.getElementById('vid');

function streamPage(link){
  request(link, (error, response, html) => {
    if(!error && response.statusCode == 200){
      parentVid.style.display = "block";
      const $ = cheerio.load(html);
      const parent = $('source');

      iframe.setAttribute('src', parent.attr('src'));
    }
  });
}

document.getElementById('cl').addEventListener('click', () => {
  parentVid.style.display = "none";
  iframe.setAttribute('src', "undefined");
});
