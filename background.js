chrome.runtime.onMessage.addListener((res) => {
  if (res.name == "stop") {
    stop();
  }
});

chrome.alarms.onAlarm.addListener((res) => {
  if (res.name == "spider") {
    spider();
  } else if (res.name == "queryTab") {
    queryTab();
  }
});

function queryTab() {
  var index = 0;
  chrome.windows.getCurrent({ populate: true }, (res) => {
    res.tabs.forEach((el) => {
      if (el.active == true) {
        index = el.index + 1;
        if (index == res.tabs.length) {
          index = 0;
        }
      }
    });
    chrome.tabs.highlight({ tabs: index });
  });
}

function spider() {
  fetch("http://127.0.0.1:8080/spider/redis/tjstate", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((result) => {
      result.Items.forEach((el) => {
        chrome.tabs.update({
          url: "https://www.muniao.com/room/" + el.muniaoID + ".html",
        });
      });
    });
}

function stop() {
  chrome.alarms.clearAll();
}
