chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  var formElement = document.activeElement;
  var start = formElement.selectionStart;
  var end = formElement.selectionEnd;

  formElement.value = formElement.value.substring(0, start)
  + request
  + formElement.value.substring(end, formElement.value.length);

  formElement.setSelectionRange(start + request.length, start + request.length);
});