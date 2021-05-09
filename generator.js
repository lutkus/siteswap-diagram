// const siteswap=[7,7,7,8,6]; //The base siteswap
let siteswap=[7,7,7,8,2,7,7,7,2,6]; //The base siteswap
let throws = 30; // The number of throws to show
let lineWidth = 30; // Thickness of the line showing the pattern
let lineColor = "black"; 
let backgroundColor = "white";
// let separatorColor = "white";
let centerLineColor = "blue";
let centerLineWidth = 10;
let separatorWidth = 20; // How much thicker the separator line is than the pattern line
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
let pointy = false;
let flatten = true;

setInput();
refresh();
disableInputs();

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
//TODO: showLastCatches assumes the last throw is caught last. Does not factor in when earlier throws are caught after last throw.
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
    let peakY = centerPoint + catchSide*direction*(100 * pattern[i] / 2);

    if (flatten && pattern[i] == 1) {
        peakY = centerPoint;
    }


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
    // separator.setAttribute("points", points);

    // This neatens the overlap between throws. It would be better to actually calculate the length, and
    // subtract the polyline's width from each side. Instead of doing that math, I just chop off 5% from the start and end.
    separator.setAttribute("pathLength","100");
    separator.setAttribute("stroke-dasharray","90 10");
    separator.setAttribute("stroke-dashoffset","-5");

    svg.appendChild(separator);

    // svg.appendChild(lineToRectangle(startX, startY, peakX, peakY, lineWidth, backgroundColor, separatorWidth, direction*catchSide, true));
    // svg.appendChild(lineToRectangle(endX, endY, peakX, peakY, lineWidth, backgroundColor, separatorWidth, direction*catchSide, false));
    generateLines(svg, startX, startY, peakX, peakY, lineWidth, backgroundColor, separatorWidth);
    generateLines(svg, endX, endY, peakX, peakY, lineWidth, backgroundColor, separatorWidth);

    let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

    // dark = right, non-dark = left
    // blue = pass, orange = self
    // let darkness = "";
    // let color = "";
    // if (pattern[i]%2) {
    //     color = "blue";
    // } else {
    //     color = "orange";
    // }
    // if (i%4 == 0) {
    //     darkness = "dark";
    // }
    // if ((i+3)%4 == 0) {
    //     darkness = "dark";
    // }
    // polyline.setAttribute("stroke",darkness+color);

    polyline.setAttribute("stroke",lineColor);
    polyline.setAttribute("stroke-width",lineWidth);
    polyline.setAttribute("stroke-linecap","round");
    polyline.setAttribute("stroke-linejoin","round");
    polyline.setAttribute("fill",backgroundColor);
    polyline.setAttribute("fill-opacity",0);
    polyline.setAttribute("points", points);
    // svg.appendChild(polyline);

    generateLines(svg, startX, startY, peakX, peakY, lineWidth, lineColor, 0);
    generateLines(svg, endX, endY, peakX, peakY, lineWidth, lineColor, 0);

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
    // let peakY = centerPoint;
    const throwHeight = (+ladderWidth / 20)*pattern[i];
    if (side) {
        peakY = centerPoint - throwHeight;
    } else {
        peakY = centerPoint + throwHeight;
    }

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
        separator.setAttribute("stroke-dashoffset","-5");

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

        if (pointy) {

            var newSide = 0;
            if (side) {
                newSide = 0;
            } else {
                newSide = 1;
            }
            if (flatten && pattern[i] == 2) {
                peakY = startY;
            } else {
                if (side) {
                    peakY = startY - (18*pattern[i]) - 50;
                } else {
                    peakY = startY + (18*pattern[i]) + 50;
                }
            }
            const points = startX+","+startY+" "+peakX+","+peakY+" "+endX+","+startY;
            let separator = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            separator.setAttribute("stroke",backgroundColor);
            separator.setAttribute("stroke-width",+lineWidth + +separatorWidth);
            separator.setAttribute("stroke-linecap","round");
            separator.setAttribute("stroke-linejoin","round");
            separator.setAttribute("fill",backgroundColor);
            separator.setAttribute("fill-opacity",0);
            separator.setAttribute("points", points);
            // This neatens the overlap between throws. It would be better to actually calculate the length, and
            // subtract the polyline's width from each side. Instead of doing that math, I just chop off 5% from the start and end.
            separator.setAttribute("pathLength","100");
            separator.setAttribute("stroke-dasharray","80 20");
            separator.setAttribute("stroke-dashoffset","-10");
            ladderSvg.appendChild(separator);

            let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            polyline.setAttribute("stroke",lineColor);
            polyline.setAttribute("stroke-width",lineWidth);
            polyline.setAttribute("stroke-linecap","round");
            polyline.setAttribute("stroke-linejoin","round");
            polyline.setAttribute("fill",backgroundColor);
            polyline.setAttribute("fill-opacity",0);
            polyline.setAttribute("points", points);;
            ladderSvg.appendChild(polyline);
        } else {
            if (flatten && pattern[i] == 2) {
                peakY = startY;
            }
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
            separator.setAttribute("stroke-dashoffset","-5");   

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

//TODO: fix separator for slopes other than 1. 
//TODO: make sparator include the peaks
function generateLines(svg,x1,y1,x2,y2,thickness,color,sepThickness) {
    const slope = (y2-y1)/(x2-x1);
    const radius = (+thickness + +sepThickness)/2;
    const sepRadius = sepThickness ? +sepThickness : 0;

    const xOffset = radius*Math.sin(Math.atan(slope));
    const yOffset = radius*Math.cos(Math.atan(slope));

    const rightX1 = x1 + xOffset;
    const rightY1 = y1 - yOffset; 
    const right1 = rightX1+","+rightY1;

    const leftX1 = x1 - xOffset;
    const leftY1 = y1 + yOffset; 
    const left1 = leftX1+","+leftY1;
    
    const rightX2 = x2 + xOffset;
    const rightY2 = y2 - yOffset; 
    const right2 = rightX2+","+rightY2;

    const leftX2 = x2 - xOffset;
    const leftY2 = y2 + yOffset; 
    const left2 = leftX2+","+leftY2;

    let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("fill",color);
    polygon.setAttribute("stroke-width",0);
    polygon.setAttribute("stroke",color);
    // polygon.setAttribute("opacity",0.5);
    polygon.setAttribute("points", right1+" "+left1+" "+left2+" "+right2);
    svg.appendChild(polygon);
    
    if (sepRadius == 0) {
        // Round the edges for lines, but not for separators.
        let circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle1.setAttribute("cx",x1);  
        circle1.setAttribute("cy",y1);
        circle1.setAttribute("r",radius);
        circle1.setAttribute("fill",color);        
        svg.appendChild(circle1);

        let circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle2.setAttribute("cx",x2);  
        circle2.setAttribute("cy",y2);
        circle2.setAttribute("r",radius);
        circle2.setAttribute("fill",color);        
        svg.appendChild(circle2);    
    } else {
        const xOffsetS = (thickness/2)*Math.cos(Math.atan(slope));
        const yOffsetS = (thickness/2)*Math.sin(Math.atan(slope));
        const lineEdgeX = x1+xOffsetS;
        const lineEdgeY = y1+yOffsetS;
        const newRight1 = (lineEdgeX+xOffset) + "," + (lineEdgeY-yOffset); 
        const newLeft1 = (lineEdgeX-xOffset) + "," + (lineEdgeY+yOffset); 

        polygon.setAttribute("points",newRight1+" "+newLeft1+" "+left2+" "+right2)
        polygon.setAttribute("stroke-width",2);
        polygon.setAttribute("stroke","blue");
        polygon.setAttribute("opacity",0.4);

        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx",x2);  
        circle.setAttribute("cy",y2);
        circle.setAttribute("r",radius);
        circle.setAttribute("fill",color);        
        circle.setAttribute("stroke-width",2);
        circle.setAttribute("stroke","blue");
        svg.appendChild(circle); 
    }


}
/**
 * Given the x,y coordinates of a line's start and end points,
 * and the desired thickness, generate a polygon rectangle
 */
function lineToRectangleOld(x1,y1,x2,y2,thickness, color, sepThickness, direction, rising, svg) {
    //TODO: Implement so this also can draw horizontal lines (such as for flattened 1 throws)

    const numThickness = +thickness;
    const numSepThickness = sepThickness ? +sepThickness : 0;
    const slope = (y2-y1)/(x2-x1);

    const sideA = ((numThickness+numSepThickness)/2);
    const hypotenuse = sideA * slope;

    const skewedLeftX1 = x1 + hypotenuse;
    const skewedRightX1 = x1 - hypotenuse;
    const skewedLeftX2 = x2 + hypotenuse;
    const skewedRightX2 = x2 - hypotenuse;

    const a = (numThickness+numSepThickness)/2 * Math.sin(Math.atan(slope));
    const b = (numThickness+numSepThickness)/2 * Math.cos(Math.atan(slope));

    const lineX = (rising) ? x1 - b : x1 + b;
    const lineY = (rising) ? y1 - a : y1 + a;
    const upperCurve = lineX + "," + lineY;
    if (svg) {


        // let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        // circle.setAttribute("cx",lineX);  
        // circle.setAttribute("cy",lineY);
        // circle.setAttribute("r",5);
        // circle.setAttribute("fill","green")        
        // svg.appendChild(circle);

        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx",x1);  
        circle.setAttribute("cy",y1);
        circle.setAttribute("r",(numThickness)/2);
        circle.setAttribute("fill","red")        
        svg.appendChild(circle);

    }


    const xIntercept = (x1 + skewedRightX1)/2; 
    const yIntercept = (-1)*slope*(xIntercept-x1)+y1;

    const xOffset = xIntercept - x1;
    const yOffset = yIntercept - y1;

    let upperRight = skewedRightX1 + "," + y1;
    let upperLeft = skewedLeftX1 + "," + y1;
    let lowerRight = skewedRightX2 + "," + y2;
    let lowerLeft = skewedLeftX2 + "," + y2;


    upperRight = xIntercept + "," + yIntercept;
    upperLeft = (x1-xOffset) + "," + (y1-yOffset);
    lowerRight = (x2+xOffset) + "," + (y2+yOffset);
    lowerLeft = (x2-xOffset) + "," + (y2-yOffset);

    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("stroke-width","0");
    if (numSepThickness) {
        if (direction == -1) {
            const b1 = y1 - ((1)*slope*skewedLeftX1);
            const b2 = y1 - ((-1)*slope*skewedRightX1);
            const crossX = (b2-b1)/(2*slope);
            const crossY = (slope*crossX) + b1;
            upperLeft = crossX + "," + crossY;

            const b3 = y2 - ((1)*slope*skewedRightX2);
            const b4 = y2 - ((-1)*slope*skewedLeftX2);
            const crossX2 = (b4-b3)/(2*slope);
            const crossY2 = (slope*crossX2) + b3;
            lowerRight = crossX2 + "," + crossY2;

            if (svg) {

                // goal: want lowerLeft to have an x coordinate of x2+xOffset
                // and a y coordinate that connects the line to this dot.

                // let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                // circle.setAttribute("cx",x2);  
                // circle.setAttribute("cy",y2-yOffset);
                // circle.setAttribute("r",5);
                // circle.setAttribute("fill","red")        
                // svg.appendChild(circle);
            }
        } else {
            const b1 = y1 - ((1)*slope*skewedRightX1);
            const b2 = y1 - ((-1)*slope*skewedLeftX1);
            const crossX = (b2-b1)/(2*slope);
            const crossY = (slope*crossX) + b1;
            upperRight = crossX + "," + crossY;

            const b3 = y2 - ((1)*slope*skewedLeftX2);
            const b4 = y2 - ((-1)*slope*skewedRightX2);
            const crossX2 = (b4-b3)/(2*slope);
            const crossY2 = (slope*crossX2) + b3;
            lowerLeft = crossX2 + "," + crossY2;
        }

        polygon.setAttribute("stroke-width","2");
        polygon.setAttribute("stroke","blue");
        polygon.setAttribute("fill-opacity",.3);
    }





    const points = upperRight + " " + upperLeft + " " + lowerLeft + " " + lowerRight;
    polygon.setAttribute("fill",color);
    polygon.setAttribute("points", points);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke-width","0"); 
    path.setAttribute("fill",color);
    // path.setAttribute("d", "M"+startRight + " L" + startLeft + " L"+peakLeft + " L" + peakRight + " L" + endRight + " L"+ endLeft + " L" + lowerPeak + " Z");
    path.setAttribute("d", "M"+upperRight + " Q" + upperCurve + " " + upperLeft + " L" + lowerLeft + " L" + lowerRight + " Z");
    return polygon;
    // return path;
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
    pointy = document.getElementById("pointyCheck").checked; 
    invert = document.getElementById("invertCheck").checked; 
    showOnlyFirstThrows = document.getElementById("showOnlyFirstThrowsCheck").checked;
    flatten = document.getElementById("flattenCheck").checked;
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
    disableInputs();
    refresh();
  }

function setInput() {
    document.getElementById("showValueAtPeakCheck").checked = showValueAtPeak;
    document.getElementById("showLastCatchesCheck").checked = showLastCatches;
    document.getElementById("showValueAtThrowCheck").checked = showValueAtThrow; 
    document.getElementById("showCenterLineCheck").checked = showCenterLine; 
    document.getElementById("catchingCheck").checked = catching; 
    document.getElementById("unidirectionalCheck").checked = unidirectional; 
    document.getElementById("pointyCheck").checked = pointy; 
    document.getElementById("invertCheck").checked = invert; 
    document.getElementById("showOnlyFirstThrowsCheck").checked = showOnlyFirstThrows; 
    document.getElementById("flattenCheck").checked = flatten; 

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

// Based on checkboxes, disable any inputs that don't make sense to use
function disableInputs() {
    if (unidirectional) {
        document.getElementById("catchingCheck").disabled = true;
        catching = false;
    } else {
        document.getElementById("catchingCheck").disabled = false;
    }

    document.getElementById("centerLineColorInput").disabled = !showCenterLine; 
    document.getElementById("centerLineWidthInput").disabled = !showCenterLine; 
    
    document.getElementById("showOnlyFirstThrowsCheck").disabled = !showValueAtThrow;
    const showSomeValues = (showValueAtThrow || showValueAtPeak);
    document.getElementById("valueSizeInput").disabled = !showSomeValues;
    document.getElementById("valueBackgroundColorInput").disabled = !showSomeValues;
    document.getElementById("valueOutlineColorInput").disabled = !showSomeValues;
    document.getElementById("valueTextColorInput").disabled = !showSomeValues;
    document.getElementById("valueTextSizeInput").disabled = !showSomeValues;
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