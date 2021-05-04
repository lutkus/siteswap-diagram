// const siteswap=[7,7,7,8,6]; //The base siteswap
let siteswap=[7,7,7,8,2,7,7,7,2,6]; //The base siteswap
let throws = 30; // The number of throws to show
let lineWidth = 15; // Thickness of the line showing the pattern
let lineColor = "black"; 
let backgroundColor = "white";
// let separatorColor = "white";
let centerLineColor = "blue";
let centerLineWidth = 10;
let separatorWidth = 10; // How much thicker the separator line is than the pattern line
let showLastCatches = 0; // 1=show last catches; 0=end at last throw
let showValueAtPeak = false;
let showValueAtThrow = false;
let showCenterLine = false;
let catching = false;
let unidirectional = false;
let invert = false;
let widthIncrement = 100;
let valueSize = 15;
let valueBackgroundColor = "white";
let valueOutlineColor = "black";
let valueTextColor = "black";
let valueTextSize = 20;
let showOnlyFirstThrows = false;

setInput();
refresh();

function refresh() {

let pattern = siteswap;
while (pattern.length < throws) {
    pattern = pattern.concat(siteswap);
}
pattern = pattern.slice(0,throws);

let siteswapContainer = document.getElementById('siteswapContainer');
siteswapContainer.innerHTML = '';

let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("id","siteswap");
const width = +widthIncrement + (pattern.length + (showLastCatches * pattern[pattern.length-1])) * +widthIncrement;
svg.setAttribute("viewBox", "0 0 "+width+" 1000");
svg.setAttribute("style","background-color:"+backgroundColor);

if (showCenterLine) {
    let lineCenter = document.createElementNS("http://www.w3.org/2000/svg", "line"); 
    lineCenter.setAttribute("stroke",centerLineColor);
    lineCenter.setAttribute("stroke-width",centerLineWidth);
    lineCenter.setAttribute("x1",widthIncrement);
    lineCenter.setAttribute("y1",500);
    lineCenter.setAttribute("x2",+widthIncrement + +widthIncrement * pattern.length + pattern[pattern.length-1]);
    lineCenter.setAttribute("y2",500);
    svg.appendChild(lineCenter);
}

for (let i=0; i<pattern.length; i++) {
    let direction = -1;
    if (!unidirectional) {
        if (i % 2) {
            direction = 1
        } else {
            direction = -1;
        }
    }
    let catchSide = 1;
    if (catching) {
        if (pattern[i] % 2) {
            catchSide = 1;
        } else {
            catchSide = -1;
        }
    }
    if (invert) {
        direction = direction * (-1);
    }

    const centerPoint = 500;
    const startX = +widthIncrement + ( +widthIncrement * i);
    const startY = centerPoint;
    const endX = startX + (+widthIncrement * pattern[i]);
    const endY = centerPoint;
    const peakX = startX + ((+widthIncrement * pattern[i]) / 2);
    const peakY = centerPoint + catchSide*direction*(100 * pattern[i] / 2);


    // let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    // circle.setAttribute("cx",startX);
    // circle.setAttribute("r","5");
    // circle.setAttribute("stroke",lineColor);
    // circle.setAttribute("stroke-width","1");
    // if (i % 2) {
    //     circle.setAttribute("fill","blue"); 
    //     circle.setAttribute("cy","502");
    // } else {
    //     circle.setAttribute("fill","red");
    //     circle.setAttribute("cy","498");
    // }
    // svg.appendChild(circle);

    const points = startX+","+startY+" "+peakX+","+peakY+" "+endX+","+endY;

    let separator = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    separator.setAttribute("stroke",backgroundColor);
    separator.setAttribute("stroke-width",+lineWidth + +separatorWidth);
    separator.setAttribute("stroke-linecap","butt");
    separator.setAttribute("fill",backgroundColor);
    separator.setAttribute("fill-opacity",0);
    separator.setAttribute("points", points);

    // This neatens the overlap between throws. It would be better to actually calculate the length, and
    // subtract the polyline's width from each side. Instead of doing that math, I just chop off 5% from the start and end.
    separator.setAttribute("pathLength","100");
    separator.setAttribute("stroke-dasharray","90 10");
    separator.setAttribute("stroke-dashoffset","-5");

    svg.appendChild(separator);

    let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("stroke",lineColor);
    polyline.setAttribute("stroke-width",lineWidth);
    polyline.setAttribute("stroke-linecap","round");
    polyline.setAttribute("stroke-linejoin","round");
    polyline.setAttribute("fill",backgroundColor);
    polyline.setAttribute("fill-opacity",0);
    polyline.setAttribute("points", points);
    svg.appendChild(polyline);

    if (showValueAtPeak) {
        let label = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        label.setAttribute("cx",peakX);
        label.setAttribute("cy",peakY);
        label.setAttribute("r",valueSize);
        label.setAttribute("stroke",valueOutlineColor);
        label.setAttribute("stroke-width","2");
        label.setAttribute("fill",valueBackgroundColor)        
        svg.appendChild(label);

        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x",peakX);
        text.setAttribute("y",peakY);
        text.setAttribute("font-size",valueTextSize);
        text.setAttribute("fill",valueTextColor);
        text.setAttribute("text-anchor","middle");
        text.setAttribute("alignment-baseline","middle");
        text.textContent = pattern[i];
        svg.appendChild(text);
    }

    let firstThrow = true;
    if (showOnlyFirstThrows) {
        for (let j=i-1; j>=0; j--) {
            if (pattern[j] == i-j) {
                firstThrow = false;
            }
        }
    }
    if (showValueAtThrow && firstThrow) {
        let label = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        label.setAttribute("cx",startX);
        label.setAttribute("cy",startY);
        label.setAttribute("r",valueSize);
        label.setAttribute("stroke",valueOutlineColor);
        label.setAttribute("stroke-width","2");
        label.setAttribute("fill",valueBackgroundColor)        
        svg.appendChild(label);

        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x",startX);
        text.setAttribute("y",startY);
        text.setAttribute("text-anchor","middle");
        text.setAttribute("alignment-baseline","middle");
        text.setAttribute("font-size",valueTextSize);
        text.setAttribute("fill",valueTextColor);
        text.textContent = pattern[i];
        svg.appendChild(text);
    }    
}
siteswapContainer.appendChild(svg);

// Ladder diagram
const ladderWidth = 400;

let ladderContainer = document.getElementById('ladderContainer');
ladderContainer.innerHTML = '';

let ladderSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("id","ladder");
ladderSvg.setAttribute("viewBox", "0 0 "+width+" "+ (100+ +ladderWidth));
ladderSvg.setAttribute("style","background-color:"+backgroundColor);

const centerPoint = (+ladderWidth/2) + 50;
if (showCenterLine) {
    let ladderCenterLine = document.createElementNS("http://www.w3.org/2000/svg", "line"); 
    ladderCenterLine.setAttribute("stroke",centerLineColor);
    ladderCenterLine.setAttribute("stroke-width",centerLineWidth);
    ladderCenterLine.setAttribute("x1",widthIncrement);
    ladderCenterLine.setAttribute("y1",centerPoint);
    ladderCenterLine.setAttribute("x2",+widthIncrement + +widthIncrement * pattern.length + pattern[pattern.length-1]);
    ladderCenterLine.setAttribute("y2",centerPoint);
    ladderSvg.appendChild(ladderCenterLine);
}

for (let i=0; i<pattern.length; i++) {
    let side = (i % 2);
    if (invert) {
        side = (i+1) % 2;
    }
    const crosses = (pattern[i] % 2);

    const startX = +widthIncrement + ( +widthIncrement * i);
    const startY = 50 + (+ladderWidth * side);
    const endX = startX + (+widthIncrement * pattern[i]);
    const peakX = startX + ((+widthIncrement * pattern[i]) / 2);
    let peakY = centerPoint;
    const throwHeight = (+ladderWidth / 20)*pattern[i];
    if (side) {
        peakY = centerPoint - throwHeight;
    } else {
        peakY = centerPoint + throwHeight;
    }
    // const peakY = centerPoint;

    if (pattern[i] % 2) {
        let separator = document.createElementNS("http://www.w3.org/2000/svg", "line");
        separator.setAttribute("stroke",backgroundColor);
        separator.setAttribute("stroke-width",+lineWidth + +separatorWidth);
        separator.setAttribute("stroke-linecap","butt");
        separator.setAttribute("fill",backgroundColor);
        separator.setAttribute("fill-opacity",0);
        separator.setAttribute("x1", startX);
        separator.setAttribute("y1", startY);
        separator.setAttribute("x2", endX);

            // This neatens the overlap between throws. It would be better to actually calculate the length, and
        // subtract the polyline's width from each side. Instead of doing that math, I just chop off 5% from the start and end.
        separator.setAttribute("pathLength","100");
        separator.setAttribute("stroke-dasharray","90 10");
        separator.setAttribute("stroke-dashoffset","-5")

        svg.appendChild(separator);

        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("stroke",lineColor);
        line.setAttribute("stroke-width",lineWidth);
        line.setAttribute("stroke-linecap","round");
        line.setAttribute("x1",startX);
        line.setAttribute("y1",startY);
        line.setAttribute("x2",endX);
        var newSide = 0;
        if (side) {
            newSide = 0;
        } else {
            newSide = 1;
        }
        line.setAttribute("y2",50 + (+ladderWidth * newSide));
        separator.setAttribute("y2",50 + (+ladderWidth * newSide));
        ladderSvg.appendChild(separator);
        ladderSvg.appendChild(line);
    } else {
        // let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        // polyline.setAttribute("stroke",lineColor);
        // polyline.setAttribute("stroke-width",lineWidth);
        // polyline.setAttribute("stroke-linecap","round");
        // polyline.setAttribute("stroke-linejoin","round");
        // polyline.setAttribute("fill",backgroundColor);
        // polyline.setAttribute("fill-opacity",0);
        // var newSide = 0;
        // if (side) {
        //     newSide = 0;
        // } else {
        //     newSide = 1;
        // }
        // polyline.setAttribute("y2",50 + (+ladderWidth * newSide));
        
        // const points = startX+","+startY+" "+peakX+","+peakY+" "+endX+","+startY;
        // polyline.setAttribute("points", points);;
        // ladderSvg.appendChild(polyline);      
       
        let separator = document.createElementNS("http://www.w3.org/2000/svg", "path");
        separator.setAttribute("stroke",backgroundColor);
        separator.setAttribute("stroke-width",+lineWidth + +separatorWidth);
        separator.setAttribute("stroke-linecap","butt");
        separator.setAttribute("fill",backgroundColor);
        separator.setAttribute("fill-opacity",0);

        // This neatens the overlap between throws. It would be better to actually calculate the length, and
        // subtract the polyline's width from each side. Instead of doing that math, I just chop off 5% from the start and end.
        separator.setAttribute("pathLength","100");
        separator.setAttribute("stroke-dasharray","90 10");
        separator.setAttribute("stroke-dashoffset","-5")        

        let path = document.createElementNS("http://www.w3.org/2000/svg", "path"); 
        path.setAttribute("stroke",lineColor);
        path.setAttribute("stroke-width",lineWidth);
        path.setAttribute("stroke-linecap","round");
        path.setAttribute("stroke-linejoin","round");
        path.setAttribute("fill",backgroundColor);
        path.setAttribute("fill-opacity",0);
        const d = "M"+startX+","+startY+" Q"+peakX+","+peakY+" "+endX+","+startY;
        path.setAttribute("d",d);
        separator.setAttribute("d",d);
        ladderSvg.appendChild(separator);

        ladderSvg.appendChild(path);
    }

    let firstThrow = true;
    if (showOnlyFirstThrows) {
        for (let j=i-1; j>=0; j--) {
            if (pattern[j] == i-j) {
                firstThrow = false;
            }
        }
    }
    if (showValueAtThrow && firstThrow) {
        let label = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        label.setAttribute("cx",startX);
        label.setAttribute("cy",startY);
        label.setAttribute("r",valueSize);
        label.setAttribute("stroke",valueOutlineColor);
        label.setAttribute("stroke-width","2");
        label.setAttribute("fill",valueBackgroundColor)        
        ladderSvg.appendChild(label);

        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x",startX);
        text.setAttribute("y",startY);
        text.setAttribute("font-size",valueTextSize);
        text.setAttribute("fill",valueTextColor);
        text.setAttribute("text-anchor","middle");
        text.setAttribute("alignment-baseline","middle");
        text.textContent = pattern[i];
        ladderSvg.appendChild(text);
    }

}
ladderContainer.appendChild(ladderSvg);
}

function getInput() {
    showValueAtPeak = document.getElementById("showValueAtPeakCheck").checked;
    if (document.getElementById("showLastCatchesCheck").checked) {
        showLastCatches = 1;
    } else {
        showLastCatches = 0;
    }
    showValueAtThrow = document.getElementById("showValueAtThrowCheck").checked; 
    showCenterLine = document.getElementById("showCenterLineCheck").checked;
    lineWidth = document.getElementById("lineWidthInput").value;
    centerLineWidth = document.getElementById("centerLineWidthInput").value;
    separatorWidth = document.getElementById("separatorWidthInput").value;
    throws = document.getElementById("throwsInput").value;
    siteswap = Array.from(document.getElementById("siteswapInput").value);
    catching = document.getElementById("catchingCheck").checked;
    unidirectional = document.getElementById("unidirectionalCheck").checked; 
    if (unidirectional) {
        catching = false;
        document.getElementById("catchingCheck").checked = catching; 
    }
    invert = document.getElementById("invertCheck").checked; 
    showOnlyFirstThrows = document.getElementById("showOnlyFirstThrowsCheck").checked;
    backgroundColor = document.getElementById("backgroundColorInput").value;
    lineColor = document.getElementById("lineColorInput").value;
    centerLineColor = document.getElementById("centerLineColorInput").value;
    // separatorColor = document.getElementById("separatorColorInput").value;
    widthIncrement = document.getElementById("widthIncrementInput").value;
    valueSize = document.getElementById("valueSizeInput").value;
    valueBackgroundColor = document.getElementById("valueBackgroundColorInput").value;
    valueOutlineColor = document.getElementById("valueOutlineColorInput").value;
    valueTextColor = document.getElementById("valueTextColorInput").value;
    valueTextSize = document.getElementById("valueTextSizeInput").value;
    refresh();
  }

function setInput() {
    document.getElementById("showValueAtPeakCheck").checked = showValueAtPeak;
    document.getElementById("showLastCatchesCheck").checked = showLastCatches;
    document.getElementById("showValueAtThrowCheck").checked = showValueAtThrow; 
    document.getElementById("showCenterLineCheck").checked = showCenterLine; 
    document.getElementById("catchingCheck").checked = catching; 
    document.getElementById("unidirectionalCheck").checked = unidirectional; 
    document.getElementById("invertCheck").checked = invert; 
    document.getElementById("showOnlyFirstThrowsCheck").checked = showOnlyFirstThrows; 

    document.getElementById("lineWidthInput").value = lineWidth;
    document.getElementById("centerLineWidthInput").value = centerLineWidth;
    document.getElementById("separatorWidthInput").value = separatorWidth;
    document.getElementById("throwsInput").value = throws;
    document.getElementById("siteswapInput").value = siteswap.join('');
    document.getElementById("backgroundColorInput").value = backgroundColor;
    document.getElementById("lineColorInput").value = lineColor;
    document.getElementById("centerLineColorInput").value = centerLineColor;
    // document.getElementById("separatorColorInput").value = separatorColor;
    document.getElementById("widthIncrementInput").value = widthIncrement;
    document.getElementById("valueSizeInput").value = valueSize;
    document.getElementById("valueBackgroundColorInput").value = valueBackgroundColor;
    document.getElementById("valueOutlineColorInput").value = valueOutlineColor;
    document.getElementById("valueTextColorInput").value = valueTextColor;
    document.getElementById("valueTextSizeInput").value = valueTextSize;
}

function download(elementId) {
    var element = document.createElement('a');
    const text = document.getElementById(elementId+"Container").innerHTML;
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', elementId+siteswap.join('')+'.svg');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}