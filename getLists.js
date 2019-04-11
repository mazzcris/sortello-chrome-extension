window.sortello = window.sortello || {interval: null};

function handleButtons (err, list) {
  if (err) {
    return
  }

  if (!listHasButton(list)) {
    addButton(list);
  }

  if (!listSortable(list) && listHasButton(list)) {
    disableButton(list);
  }

  if (listSortable(list) && listHasButton(list)) {
    enableButton(list);
  }

  if (listSortable(list) && !listHasButton(list) && !buttonIsComplete(list)) {
    disableButton(list);
  }
}

function cardAppeared (list, cb) {

  let i = 10;

  if (!listSortable(list)) {
    cb(false, list);
    return;
  }

  let interval = setInterval(function () {
    let oneCard = list.querySelectorAll('a.list-card')[0];
    if (oneCard != null && oneCard.href.trim().length > 0) {
      clearInterval(interval);
      cb(false, list);
      return;
    }

    if (i === 0) {
      clearInterval(interval);
      cb(true);
      return;
    }
    i--;
  }, 200);

}

function getCardId(list){
  let oneCard = list.querySelectorAll('a.list-card')[0];
  if(oneCard !== undefined){
    let oneCardHref = oneCard.href;
    let oneCardUrl = oneCardHref.replace("https://trello.com/c/", "");
    return oneCardUrl.replace(/\/(.*)/g, "");
  }else{
    return "#";
  }

}

function addButton (list) {
  let oneCardId = getCardId(list);
  let newElement = '<a tooltip="#" style="height:19px;" class="list-header-extras-menu dark-hover sortello-link" title="Sort cards with Sortello" target="_blank" href="http://sortello.com/app.html?extId=' + oneCardId + '">' +
      '<span class="icon-sm" style="background: url(' + chrome.runtime.getURL('icon.png') + '); background-size: contain;" title="Prioritize with Sortello now!">' +
      '</span>' +
      '</a>';
  let extras = list.getElementsByClassName('list-header-extras')[0];
  extras.innerHTML = newElement + extras.innerHTML;
}

function disableButton (list) {
  let toDisable = list.getElementsByClassName('sortello-link')[0];
  let url = chrome.runtime.getURL('icon-grey.png');
  toDisable.getElementsByClassName("icon-sm")[0].style.backgroundImage = 'url('+url+')';
  toDisable.href="#";
  toDisable.setAttribute('tooltip', "Add more than 1 card please!");
}

function enableButton (list) {
  let toEnable = list.getElementsByClassName('sortello-link')[0];
  let oneCardId = getCardId(list);
  let url = chrome.runtime.getURL('icon.png');
  toEnable.getElementsByClassName("icon-sm")[0].style.backgroundImage = 'url('+url+')';
  toEnable.getElementsByClassName("icon-sm")[0].title = "Prioritize with Sortello now!";
  toEnable.href= "http://sortello.com/app.html?extId=" + oneCardId;
  toEnable.setAttribute('tooltip', "Prioritize with Sortello now!");
}

function listSortable (list) {
  return list.getElementsByClassName('list-card js-member-droppable').length >= 2;
}

function listHasButton (list) {
  return list.getElementsByClassName('sortello-link').length > 0;
}

function buttonIsComplete (list) {
  let suffix = 'extId=';
  let sortelloLink = list.getElementsByClassName('sortello-link');
  if (sortelloLink.href === undefined) {
    return false
  }
  return sortelloLink.href.indexOf(suffix, this.length - suffix.length) !== -1;
}

function showingTrelloBoard () {
  let url = window.location.href;
  let thisRegex = new RegExp('trello.com/b/');
  return thisRegex.test(url);
}

function setButtons () {
  let lists = document.getElementsByClassName('list');

  for (let i = 0; i < lists.length; i++) {
    let list = lists[i];
    if(!buttonIsComplete(list)){
      cardAppeared(list, handleButtons);
    }
  }
}

clearInterval(window.sortello.interval);
if (showingTrelloBoard()) {
  setButtons();
  window.sortello.interval = setInterval(setButtons, 2000);
}
