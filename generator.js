// const siteswap=[7,7,7,8,6]; //The base siteswap
let siteswap=[7,7,7,8,2,7,7,7,2,6]; //The base siteswap
let throws = 30; // The number of throws to show
let lineWidth = 15; // Thickness of the line showing the pattern
let lineColor = "black"; 
let backgroundColor = "white";
let separatorColor = "white";
let centerLineColor = "blue";
let separatorWidth = 10; // How much thicker the separator line is than the pattern line
let showLastCatches = 0; // 1=show last catches; 0=end at last throw
let showValueAtPeak = true;
let showValueAtThrow = false;
let showCenterLine = false;
let passing = true;
let unidirectional = false;
let widthIncrement = 100;

setInput();
refresh();

function refresh() {

let pattern = siteswap;
// for (let i=1;i<throws;i++) {
//     pattern = pattern.concat(siteswap);
// }
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
    lineCenter.setAttribute("stroke-width",lineWidth);
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
    let pass = 1;
    if (passing) {
        if (pattern[i] % 2) {
            pass = 1;
        } else {
            pass = -1;
        }
    }

    const centerPoint = 500;
    const startX = +widthIncrement + ( +widthIncrement * i);
    const startY = centerPoint;
    const endX = startX + (+widthIncrement * pattern[i]);
    const endY = centerPoint;
    const peakX = startX + ((+widthIncrement * pattern[i]) / 2);
    const peakY = centerPoint + pass*direction*(100 * pattern[i] / 2);


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
    separator.setAttribute("stroke",separatorColor);
    separator.setAttribute("stroke-width",+lineWidth + +separatorWidth);
    separator.setAttribute("stroke-linecap","butt");
    separator.setAttribute("fill",separatorColor);
    separator.setAttribute("fill-opacity",0);
    separator.setAttribute("points", points);
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
        label.setAttribute("r",(+lineWidth + +separatorWidth)/2);
        label.setAttribute("stroke",lineColor);
        label.setAttribute("stroke-width","1");
        label.setAttribute("fill","white")        
        svg.appendChild(label);

        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x",peakX);
        text.setAttribute("y",peakY);
        text.setAttribute("class","small");
        text.setAttribute("text-anchor","middle");
        text.setAttribute("alignment-baseline","middle");
        text.textContent = pattern[i];
        svg.appendChild(text);
    }

    if (showValueAtThrow) {
        let label = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        label.setAttribute("cx",startX);
        label.setAttribute("cy",startY);
        label.setAttribute("r",(+lineWidth + +separatorWidth)/2);
        label.setAttribute("stroke",lineColor);
        label.setAttribute("stroke-width","1");
        label.setAttribute("fill","white")        
        svg.appendChild(label);

        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x",startX);
        text.setAttribute("y",startY);
        text.setAttribute("class","small");
        text.setAttribute("text-anchor","middle");
        text.setAttribute("alignment-baseline","middle");
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
    ladderCenterLine.setAttribute("stroke-width",lineWidth);
    ladderCenterLine.setAttribute("x1",widthIncrement);
    ladderCenterLine.setAttribute("y1",centerPoint);
    ladderCenterLine.setAttribute("x2",+widthIncrement + +widthIncrement * pattern.length + pattern[pattern.length-1]);
    ladderCenterLine.setAttribute("y2",centerPoint);
    ladderSvg.appendChild(ladderCenterLine);
}

for (let i=0; i<pattern.length; i++) {
    const side = (i % 2);
    const crosses = (pattern[i] % 2);

    const startX = +widthIncrement + ( +widthIncrement * i);
    const startY = 50 + (+ladderWidth * side);
    const endX = startX + (+widthIncrement * pattern[i]);
    const peakX = startX + ((+widthIncrement * pattern[i]) / 2);
    const peakY = centerPoint;

    if (pattern[i] % 2) {
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
        ladderSvg.appendChild(line);
    } else {
        let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        polyline.setAttribute("stroke",lineColor);
        polyline.setAttribute("stroke-width",lineWidth);
        polyline.setAttribute("stroke-linecap","round");
        polyline.setAttribute("stroke-linejoin","round");
        polyline.setAttribute("fill",backgroundColor);
        polyline.setAttribute("fill-opacity",0);
        var newSide = 0;
        if (side) {
            newSide = 0;
        } else {
            newSide = 1;
        }
        polyline.setAttribute("y2",50 + (+ladderWidth * newSide));
        
        const points = startX+","+startY+" "+peakX+","+peakY+" "+endX+","+startY;
        polyline.setAttribute("points", points);;
        // ladderSvg.appendChild(polyline);      
        
        let path = document.createElementNS("http://www.w3.org/2000/svg", "path"); 
        path.setAttribute("stroke",lineColor);
        path.setAttribute("stroke-width",lineWidth);
        path.setAttribute("stroke-linecap","round");
        path.setAttribute("stroke-linejoin","round");
        path.setAttribute("fill",backgroundColor);
        path.setAttribute("fill-opacity",0);
        const d = "M"+startX+","+startY+" Q"+peakX+","+peakY+" "+endX+","+startY;
        path.setAttribute("d",d);

        ladderSvg.appendChild(path);
    }

    if (showValueAtThrow) {
        let label = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        label.setAttribute("cx",startX);
        label.setAttribute("cy",startY);
        label.setAttribute("r",(+lineWidth + +separatorWidth)/2);
        label.setAttribute("stroke",lineColor);
        label.setAttribute("stroke-width","1");
        label.setAttribute("fill","white")        
        ladderSvg.appendChild(label);

        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x",startX);
        text.setAttribute("y",startY);
        text.setAttribute("class","small");
        text.setAttribute("text-anchor","middle");
        text.setAttribute("alignment-baseline","middle");
        text.textContent = pattern[i];
        ladderSvg.appendChild(text);
    }

}
ladderContainer.appendChild(ladderSvg);
console.log(ladderSvg)
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
    separatorWidth = document.getElementById("separatorWidthInput").value;
    throws = document.getElementById("throwsInput").value;
    siteswap = Array.from(document.getElementById("siteswapInput").value);
    passing = document.getElementById("passingCheck").checked;
    unidirectional = document.getElementById("unidirectionalCheck").checked; 
    if (unidirectional) {
        passing = false;
        document.getElementById("passingCheck").checked = passing; 
    }
    backgroundColor = document.getElementById("backgroundColorInput").value;
    lineColor = document.getElementById("lineColorInput").value;
    centerLineColor = document.getElementById("centerLineColorInput").value;
    separatorColor = document.getElementById("separatorColorInput").value;
    widthIncrement = document.getElementById("widthIncrementInput").value;
    refresh();
  }

function setInput() {
    document.getElementById("showValueAtPeakCheck").checked = showValueAtPeak;
    document.getElementById("showLastCatchesCheck").checked = showLastCatches;
    document.getElementById("showValueAtThrowCheck").checked = showValueAtThrow; 
    document.getElementById("showCenterLineCheck").checked = showCenterLine; 
    document.getElementById("passingCheck").checked = passing; 
    document.getElementById("unidirectionalCheck").checked = unidirectional; 

    document.getElementById("lineWidthInput").value = lineWidth;
    document.getElementById("separatorWidthInput").value = separatorWidth;
    document.getElementById("throwsInput").value = throws;
    document.getElementById("siteswapInput").value = siteswap.join('');
    document.getElementById("backgroundColorInput").value = backgroundColor;
    document.getElementById("lineColorInput").value = lineColor;
    document.getElementById("centerLineColorInput").value = centerLineColor;
    document.getElementById("separatorColorInput").value = separatorColor;
    document.getElementById("widthIncrementInput").value = widthIncrement;
}

function download() {
    var element = document.createElement('a');
    const text = document.getElementById("siteswapContainer").innerHTML;
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', 'siteswap'+siteswap.join('')+'.svg');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}