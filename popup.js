/**
 * Used to build the GPX output
 */
const builder = require('xmlbuilder');
const moment = require('moment-timezone');

var background = chrome.extension.getBackgroundPage();

var twaList = [];
var btwList = [];
var ttwLast = "T+ 0:00";
var twaLast = undefined;
var btwLast = undefined;

function createCell(value, row) {
    var cell = document.createElement("td");
    cell.innerHTML = value;
    row.appendChild(cell);
}

function ttwStyling(value, cell) {
    cell.align = "left";
    cell.innerHTML = value;
}

function dtwStyling(value, cell) {
    cell.align = "left";
    cell.innerHTML = value;
}

function dtgStyling(value, cell) {
    cell.align = "left";
    cell.innerHTML = value;
}

function twsStyling(value1, value2, cell) {
    var tws_foil = value1.replace(" kt", "");
    var twa_bd = value2.replace("\u00B0", "");
    if (tws_foil >= 11.1 && tws_foil <= 39.9 && Math.abs(twa_bd) >= 71 && Math.abs(twa_bd) <= 169) {
        cell.style.backgroundColor = "black";
        cell.style.color = "white";
    }
    cell.innerHTML = tws_foil + " kt";
}

function twaStyling(value, cell) {
    var twa_bd = value.replace("\u00B0", "");
    if (twa_bd >= 0) {
        cell.style.color = "green";
    } else {
        cell.style.color = "red";
    }
    cell.innerHTML = Math.abs(twa_bd) + "\u00B0";
}

function btwStyling(value, cell) {
    cell.style.color = "blue";
    cell.innerHTML = value;
}

function sailStyling(value, cell) {
    switch (value.trim()) {
            // Upwind sail
        case "Jib":
            cell.style.backgroundColor = "#FFD479";
            break;
        case "LJ":
            cell.style.backgroundColor = "#FFFC79";
            break;
        case "Stay":
            cell.style.backgroundColor = "#D4FB79";
            break;
            // Downwind sail
        case "Spi":
            cell.style.backgroundColor = "#76D6FF";
            break;
        case "LG":
            cell.style.backgroundColor = "#7A81FF";
            break;
        case "HG":
            cell.style.backgroundColor = "#D783FF";
            break;
            // Reaching sail
        case "C0":
            cell.style.backgroundColor = "#FF7E79";
            break;
    }
    cell.innerHTML = value;
}

function atwaStyling(value, cell) {
    if (value >= 0) {
        cell.style.color = "green";
    } else {
        cell.style.color = "red";
    }
    if (value !== "-") {
        cell.innerHTML = Math.abs(value) + "\u00B0";
    } else {
        cell.style.color = "black";
        cell.innerHTML = value;
    }
}

function abtwStyling(value, cell) {
    cell.style.color = "blue";
    if (value !== "-") {
        cell.innerHTML = value + "\u00B0";
    } else {
        cell.style.color = "black";
        cell.innerHTML = value;
    }
}

function createCellWithCustomStyling(value, row, customStyling) {
    var cell = document.createElement("td");
    customStyling(value, cell);
    row.appendChild(cell);
}

function createCellWithCustomStyling2(value1, value2, row, customStyling) {
    var cell = document.createElement("td");
    customStyling(value1, value2, cell);
    row.appendChild(cell);
}

function space(value) {
    if (value < 10) {
        value = " " + value;
    }
    return value;
}

function zero(value) {
    if (value < 10) {
        value = "0" + value;
    }
    return value;
}

function dmsConv(latitude, longitude) {
    var latAbs = Math.abs(latitude);
    var latDeg = Math.trunc(latAbs);
    var latMin = Math.trunc((latAbs - latDeg) * 60);
    var latSec = Math.trunc((((latAbs - latDeg) * 60) - latMin ) * 60);
    var latCard = (latitude >= 0) ? "N" : "S";

    var lonAbs = Math.abs(longitude);
    var lonDeg = Math.trunc(lonAbs);
    var lonMin = Math.trunc((lonAbs - lonDeg) * 60);
    var lonSec = Math.trunc((((lonAbs - lonDeg) * 60) - lonMin ) * 60);
    var lonCard = (longitude >= 0) ? "E" : "W";

    return zero(latDeg) + "\u00B0" + zero(latMin) + "\u0027" + zero(latSec) + "\u0022" + latCard + " - " + zero(lonDeg) + "\u00B0" + zero(lonMin) + "\u0027" + zero(lonSec) + "\u0022" + lonCard;
}

function atwaCalc(twaList) {
    const
    twaData = twaList;
    Math.radians = function (degrees) {
        return degrees * Math.PI / 180;
    },
        Math.degrees = function (radians) {
        return radians * 180 / Math.PI;
    };

    let
    arX = [],
        arY = [],
        somX = 0,
        somY = 0,
        avgX = 0,
        avgY = 0,
        atwa = 0;

    for (const [i, angle] of twaData.entries()) {
        arX[i] = Math.cos(Math.radians(angle));
        arY[i] = Math.sin(Math.radians(angle));
    }

    for (const value of arX) {
        somX += value;
    }
    avgX = somX / arX.length;

    for (const value of arY) {
        somY += value;
    }
    avgY = somY / arY.length;

    atwa = Math.round(Math.degrees(Math.atan2(avgY, avgX)));
    if (isNaN (atwa)) {
        atwa = "-";
    }
    return atwa ;
}

function abtwCalc(btwList) {
    const
    btwData = btwList;
    Math.radians = function (degrees) {
        return degrees * Math.PI / 180;
    },
        Math.degrees = function (radians) {
        return radians * 180 / Math.PI;
    };

    let
    arX = [],
        arY = [],
        somX = 0,
        somY = 0,
        avgX = 0,
        avgY = 0,
        abtw = 0;

    for (const [i, angle] of btwData.entries()) {
        arX[i] = Math.cos(Math.radians(angle));
        arY[i] = Math.sin(Math.radians(angle));
    }

    for (const value of arX) {
        somX += value;
    }
    avgX = somX / arX.length;

    for (const value of arY) {
        somY += value;
    }
    avgY = somY / arY.length;

    abtw = Math.round(Math.degrees(Math.atan2(avgY, avgX)));
    if (isNaN (abtw)) {
        abtw = "-";
    } else if (abtw < 0) {
        abtw += 360;
    }
    return abtw;
}

function reinitializeDisplay() {
    document.getElementById("pointsTable").innerHTML = "";
}

function TzToLocal(date, time, timezone) {
    var tzGuess = moment.tz.guess();

    if ((timezone === "CET") || (timezone === "CEST")) {
        var CetOrCestToUtc = moment.tz(date + " " + time, "Europe/Paris").utc();
        var localDateTz = moment.utc(CetOrCestToUtc).tz(tzGuess);
    } else if (timezone === "UTC") {
        var localDateTz = moment.utc(date + " " + time).tz(tzGuess);
    }

    var offset = localDateTz.utcOffset();
    var absOffset = Math.abs(offset);
    var sign = (offset > 0) ? "+" : "-";
    var hoursOffset = Math.trunc(absOffset / 60);
    var MinutesHoursOffset = (hoursOffset === 0) ? "\u00b1" + "0" : sign + hoursOffset;
    var minutesOffset = absOffset % 60;
    var HoursMinutesOffset = (minutesOffset === 0) ? MinutesHoursOffset : sign + hoursOffset + ":" + minutesOffset;

    var formatDate = localDateTz.format('YYYY-MM-DD');
    var formatTime = localDateTz.format('HH:mm');
    var formatTimeZone = "UTC" + HoursMinutesOffset;
    return [formatDate, formatTime, formatTimeZone];
}

function displayTable(localTime) {
    points.forEach(function (element) {
        var row = document.createElement("tr");
        document.getElementById("pointsTable").appendChild(row);
        if (localTime) {
            var localTZ = TzToLocal(element.date, element.time, element.timezone);
            createCell(localTZ[0], row);
            createCell(localTZ[1], row);
            createCell(localTZ[2], row);
        } else {
            createCell(element.date, row);
            createCell(element.time, row);
            createCell(element.timezone, row);
        }
        var position = dmsConv(element.latitude, element.longitude);
        createCell(position, row);
        createCellWithCustomStyling(element.ttw, row, ttwStyling);
        createCellWithCustomStyling(element.dtw, row, dtwStyling);
        createCellWithCustomStyling(element.dtg, row, dtgStyling);
        createCell(element.twd, row);
        createCellWithCustomStyling2(element.tws, element.twa, row, twsStyling);
        createCellWithCustomStyling(element.twa, row, twaStyling);
        createCellWithCustomStyling(element.btw, row, btwStyling);
        createCellWithCustomStyling(element.sail, row, sailStyling);
        createCell(element.stw, row);
        createCellWithCustomStyling(element.atwa, row, atwaStyling);
        createCellWithCustomStyling(element.abtw, row, abtwStyling);
        var manifest = chrome.runtime.getManifest();
        document.getElementById("version").innerHTML = manifest.version;
    });
    // on CLONE le contenu dans "pointsTable2" :
	if( document.getElementById("pointsTable2") != null && document.getElementById("pointsTable2") != 'undefined' ) {
		document.getElementById("pointsTable2").innerHTML = document.getElementById("pointsTable").innerHTML;
	}
}

var displayLocal = function () {
    reinitializeDisplay();
    if (document.getElementById("localtime").checked) {
        chrome.storage.local.set({"localTime" : true});
        displayTable(true);
    } else {
        chrome.storage.local.set({"localTime" : false});
        displayTable(false);
    }
};

document.getElementById("localtime").addEventListener("change", displayLocal);
var exportGpx = function () {
    let xml = builder.create('gpx');
    xml.att('xmlns','http://www.topografix.com/GPX/1/1');
    xml.att('xmlns:xsi','http://www.w3.org/2001/XMLSchema-instance');
    xml.att('xsi:schemaLocation','http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd');
    xml.att('version','1.0');
    xml.att('creator','Route Zezo.org');

    let route = xml.ele('rte');
    route.ele('name', 'RZ ' + points[0].race);
    for (point of points) {
        if (point.latitude !== undefined && point.longitude !== undefined) {
            let routePoint = route.ele('rtept', {lat: point.latitude, lon: point.longitude});
            if ((point.timezone === "CET") || (point.timezone === "CEST")) {
                routePoint.ele('time', moment.tz(point.date + " " + point.time, "Europe/Paris").toISOString());
            } else if (point.timezone === "UTC") {
                routePoint.ele('time', moment.utc(point.date + " " + point.time).toISOString());
            }
            routePoint.ele('name', point.ttw);
        }
    }
    let xmlString = xml.end({pretty: true});
    let gpxOutput = document.getElementById("gpxOutput");
    gpxOutput.innerText = "";
    gpxOutput.innerText = xmlString;
};
document.getElementById("gpxExport").addEventListener("click", exportGpx);

chrome.storage.local.get("localTime", function (result) {
    if (result.localTime === true) {
        document.getElementById("localtime").checked = true;
        displayLocal();
    } else {
        document.getElementById("localtime").checked = false;
    }
});
reinitializeDisplay();
var points = background.points[background.currentTab];

function genIteNext(ttwCurr) {
    var ttwCurr = ttwCurr.match(/.*?([0-9]{1,3}):([0-9]{2})/);
    var ttwHours = parseInt(ttwCurr[1], 10);
    var ttwMinutes = parseInt(ttwCurr[2], 10);
    var ttwNext = [];
    if (ttwMinutes + 10 < 60) {
        ttwNext = "T+" + space(ttwHours) + ":" + zero(ttwMinutes + 10);
    } else {
        ttwNext = "T+" + space(ttwHours + 1) + ":" + zero(ttwMinutes - 50);
    }
    return ttwNext;
}

for (var i = 0; i < points.length; i++) {
    points[i].atwa = atwaCalc(twaList);
    points[i].abtw = abtwCalc(btwList);
    while (points[i].ttw !== ttwLast) {
        twaList.push(parseInt(twaLast,10));
        btwList.push(parseInt(btwLast,10));
        ttwLast = genIteNext(ttwLast);
    }
    twaLast = parseInt(points[i].twa, 10);
    btwLast = parseInt(points[i].btw, 10);
    if (twaList.length === 0) {
        twaList.push(twaLast);
        btwList.push(btwLast);
    } else if (twaList[0] * twaLast < 0) {
        twaList = [twaLast];
        btwList = [btwLast];
    } else {
        twaList.push(twaLast);
        btwList.push(btwLast);
    }
    ttwLast = genIteNext(ttwLast);
}

displayTable(false);