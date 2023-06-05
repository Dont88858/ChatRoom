import $ from 'jquery'

var popups = [];
function showPopup(message, time) {
  var overlay = $("#popup");
  var overlayContent = $("<div></div>");
  overlayContent.addClass("popup-content");
  overlayContent.text(message);

  var progressBar = $("<div></div>");
  progressBar.addClass("progress-bar");
  var progressBarFill = $("<div></div>");
  progressBarFill.addClass("progress-bar-fill");
  progressBar.append(progressBarFill);

  overlayContent.append(progressBar);
  overlay.append(overlayContent);
  overlay.css("display", "block");

  var popup = {
    element: overlayContent,
    progressBar: progressBarFill,
    startProgress: () => {
      var interval = 10;
      var startTime = Date.now();
      var width = 0;

      var progressInterval = setInterval(() => {
        var elapsedTime = Date.now() - startTime;
        width = (elapsedTime / time) * 100;
        popup.progressBar.css("width", width + "%");

        if (width >= 100) {
          clearInterval(progressInterval);
          overlay.find(overlayContent).remove();
          popups = popups.filter((item) => {
            return item.element !== overlayContent;
          });
    
          if (popups.length === 0) {
            overlay.css("display", "none");
          }
        }
      }, interval);
    }
  };

  popups.push(popup)
  popup.startProgress();
}

function TimeString(data){
    let date = new Date(data);
    let today = new Date();
    let yesterday = new Date()
    yesterday.setDate(today.getDate()-1);
    if(today.toDateString() === date.toDateString())
        return date.getHours().toString().padStart(2, '0')+":"+date.getMinutes().toString().padStart(2, '0');
    else if(yesterday.toDateString() === date.toDateString())
        return "ieri " + date.getHours().toString().padStart(2, '0')+":"+date.getMinutes().toString().padStart(2, '0');
    else
        return date.getDate().toString().padStart(2, '0') + "/"
            + (date.getMonth()+1).toString().padStart(2, '0') + " "
            + date.getHours().toString().padStart(2, '0') + ":"
            + date.getMinutes().toString().padStart(2, '0');
}

export {showPopup, TimeString};