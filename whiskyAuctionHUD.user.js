
// ==UserScript==
// @name     whiskyAuctionHUD
// @version  0.1
// @grant    none
// @include      https://whisky.auction/*
// @updateURL    https://github.com/JorisFouet/auctionHUD/raw/main/whiskyAuctionHUD.user.js
// @downloadURL  https://github.com/JorisFouet/auctionHUD/raw/main/whiskyAuctionHUD.user.js
// ==/UserScript==
const defaultTxt = 'google it!';
const store = JSON.parse(window.localStorage.getItem('myStore') || '{}');

//add links to each lot item
for(const elt of document.getElementsByClassName('lotItem')){
  const lotId = elt.getAttribute('id').toString().match(/lot_(\d+)$/)[1];
  const partialTitle = elt.getElementsByClassName('lotName1')[0].innerText;
  const lotTitle = partialTitle + ' ' + elt.getElementsByClassName('lotName2')[0].innerText;
  addLink(elt, 
          partialTitle,
          store[lotTitle] || store[lotId], 
          lotTitle,
          lotId);
}

//create link
function addLink(elt, partialTitle, txt, title, lotId){
  const url = 'https://www.google.com/search?channel=fs&client=ubuntu&q=' + encodeURI(title);
  txt = txt || defaultTxt;
  const link = document.createElement('a');
  link.setAttribute('target', '_blank');
  link.setAttribute('href', url);
  link.setAttribute('title', 'google this item and then comment it');
  link.innerHTML = txt;
  link.classList.add('tampermonkey-annotation');
  link.style.display = 'block';
  link.style.color = 'rgb(150, 70, 73)';
  link.style.margin = '0px 0px 10px 0px';
  
  //create meter
  const meter = document.createElement('span');
  meter.classList.add('tampermonkey-meter');
  link.style.display = 'block';
  meter.style.backgroundImage = 'url(https://chuckprudence.com/mp3/bar.png)';
  meter.style.backgroundRepeat = 'no-repeat';
  meter.style.display = 'block';
  meter.style.height = '20px';
  meter.style.width = '0px';
  const myEstimate = parseInt(txt.match(/\d*$/));
  const winningBid = parseInt(elt.getElementsByClassName('winningBid value')[0].innerText.match(/\d*$/)[0]);
  
  //fill it by value
  let nextBid = winningBid;
  if(winningBid < 10){
    nextBid = winningBid + 1;
  }
  else if(winningBid < 30){
    nextBid = winningBid + 2;
  }
  else if(winningBid < 100){
    nextBid = winningBid + 5;
  }
  else if(winningBid < 500){
    nextBid = winningBid + 10;
  }
  else{
    nextBid = winningBid + 25;
  }
  const fullPrice = nextBid * 1.18 + 2;
  meter.style.width = Math.max(0, Math.trunc(80 * (myEstimate - fullPrice) / myEstimate)) + 'px';
  
  //click the watch button for good deals
  if(myEstimate > fullPrice){
    const btn = elt.getElementsByClassName('btnFollow')[0];
    if(btn.classList.contains('notFollowing')){
			elt.getElementsByClassName('btnFollow')[0].click();      
    }
  }
  
  //on click
  link.addEventListener('click', function (event) {
    event.stopPropagation();
    event.preventDefault();
    
    //google the item title
    window.open(url);
    window.open('https://whisky.auction/auctions/search?filter=all&pageSize=180&src=' + encodeURI(partialTitle));
    
    //prompt comment on item
    const comment = prompt('what do you think of ' + title, txt == defaultTxt ? '' : txt);
    if(null !== comment){
      
      //store comment
      store[title] = comment;
      window.localStorage.setItem('myStore', JSON.stringify(store));
      
      //display comment
      link.remove();
			addLink(elt, partialTitle, comment, title, lotId);
    }
    
    //ignore click
    event.stopPropagation();
    event.preventDefault();
    return false;
  });
  
  //set link before title
  const existingMeter = elt.getElementsByClassName('tampermonkey-meter');
  if(existingMeter.length){
    existingMeter[0].remove();
  }
  const existingLink = elt.getElementsByClassName('tampermonkey-annotation');
  if(existingLink.length){
    existingLink[0].remove();
  }
  
  if(txt == defaultTxt){
    elt.getElementsByClassName('lot-statuses')[0].prepend(link);
  }
  else{
    elt.getElementsByClassName('lot-statuses')[0].prepend(meter);
    (elt.getElementsByClassName('lot-title')[0] || elt.getElementsByClassName('product-title')[0]).append(link);
  }
}
