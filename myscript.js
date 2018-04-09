"use strict";

const pattern = /updi\(event,'([0-9]{4}-[0-9]{2}-[0-9]{2}) ([0-9]{2}:[0-9]{2}) ([A-Z]{3,4}).*(T[+-]{1}.*?[0-9]{1,}:[0-9]{2}).*<br>Distances:.*?([0-9]{1,}\.[0-9]{1,}nm)\/([0-9]{1,}\.[0-9]{1,}nm)<br><b>Wind:<\/b> ([0-9]*?.*) (.*? kt).*\(<b>TWA(.*?)<\/b>\)<br><b>Heading:<\/b>(.*?)<b>Sail:<\/b>(.*?)<br><b>Boat Speed:<\/b>(.*?)'/g
const points = [];
try {
    Array.prototype.slice.call(document.getElementsByTagName("img")).forEach(function (element) {
        var event = element.getAttribute("onmouseover");
        if (event !== null) {
            var match = pattern.exec(event);

            const date = match[1];
            const time = match[2];
            const timezone = match[3];
            const ttw = match[4];
            const dtw = match[5];
            const dtg = match[6];
            const twd = match[7];
            const tws = match[8];
            const twa = match[9];
            const btw = match[10];
            const sail = match[11];
            const stw = match[12];
		   
            points.push({
                date : date,
                time : time,
                timezone : timezone,
                ttw : ttw,
                dtw : dtw,
                dtg : dtg,
                twd : twd,
                tws : tws,
                twa : twa,
                btw : btw,
                sail : sail,
                stw : stw
           });
            pattern.lastIndex = 0;
        }
    });

    chrome.runtime.sendMessage(points);
} catch (e) {
    console.error(e);
    chrome.runtime.sendMessage([]);
}