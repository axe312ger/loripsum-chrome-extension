function loripsum() {
  var main = createMenuItem('Lorem ipsum');

  // Paste last used loripsum text.
  chrome.contextMenus.create({
    'title': 'Use last configuration',
    'contexts': ['editable'],
    'parentId': main,
    'onclick': function () {
      pasteLastLoripsum();
    }
  });

  chrome.contextMenus.create({
    'type': 'separator',
    'parentId': main,
    'contexts': ['editable']
  });

  // Generate menu items to determine the number of paragraphs
  var paragraphs = [1,2,3,5,8];
  paragraphs.forEach(function(paragraphCount) {
    var countItem = createMenuItem(paragraphCount + ' paragraph' + (paragraphCount > 1 ? 's' : ''), main);

    // Generate menu items to determine the paragraphs length
    var lengths = ['short', 'medium', 'long', 'verylong'];
    lengths.forEach(function(length) {
      var lengthItem = createMenuItem(length, countItem);

      // For every length, generate multiple options to generate the blindtext.
      var plain = createMenuItem('plain', lengthItem, [paragraphCount, length, 'plaintext']);
      var html = createMenuItem('html', lengthItem);

      createMenuItem('just text', html, [paragraphCount, length]);
      createMenuItem('decorated text', html, [paragraphCount, length, 'decorate', 'links']);
      createMenuItem('decorated text with headings', html, [paragraphCount, length, 'decorate', 'links', 'headers']);
      createMenuItem('decorated text with headings and lists', html, [paragraphCount, length, 'decorate', 'links', 'headers', 'ul']);
      createMenuItem('decorated text with headings, lists, block quotes and code blocks.', html, [paragraphCount, length, 'decorate', 'links', 'headers', 'ul', 'bq', 'code']);
    });
  });

  // Bind shortcuts
  chrome.commands.onCommand.addListener(function(command) {
    switch (command) {
      case 'paste-last-loripsum':
        pasteLastLoripsum();
        break;
    }
  });

  function pasteLastLoripsum () {
    chrome.storage.sync.get('last-paste-params', function(items) {
      if (items['last-paste-params'].length > 0) {
        apiParams = items['last-paste-params'];
      } else {
        apiParams = ['5', 'medium', 'decorate', 'links'];
      }
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        pasteLoripsum(tabs[0], apiParams);
      });
    });
  }

  function pasteLoripsum (tab, apiParams) {
    var xhr = new XMLHttpRequest();

    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({'last-paste-params': apiParams});

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        chrome.tabs.sendRequest(tab.id, xhr.responseText);
      }
    };
    xhr.open('GET', 'http://loripsum.net/api/' + apiParams.join('/'), true);
    xhr.send();
  }

  function createMenuItem(title, parentId, params) {
    var item = {
      'title': title,
      'contexts': ['editable']
    };
    if (parent) {
      item.parentId = parentId;
    }
    if (params) {
      item.onclick = function(info, tab) {
        pasteLoripsum(tab, params);
      };
    }
    return chrome.contextMenus.create(item);
  }
}

loripsum();