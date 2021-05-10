// const siteswap=[7,7,7,8,6]; //The base siteswap
let siteswap=[7,7,7,8,2,7,7,7,2,6]; //The base siteswap
let throws = 12; // The number of throws to show
let lineWidth = 30; // Thickness of the line showing the pattern
let lineColor = "black"; 
let backgroundColor = "white";
let separatorColor = "white";
let centerLineColor = "blue";
let centerLineWidth = 5;
let separatorWidth = 20; // How much thicker the separator line is than the pattern line
let showLastCatches = 0; // 1=show last catches; 0=end at last throw
let showValueAtPeak = false;
let showValueAtThrow = false;
let showCenterLine = false;
let catching = false;
let unidirectional = false;
let invert = false;
let widthIncrement = 120;
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

// When drawing the separator line, it is sometimes necessary to know
// what the last throw of the given object was.
let catchOrigin = [];
for (let i=0; i<pattern.length; i++) {
    const currentThrow = +pattern[i];
    catchOrigin[i+currentThrow] = currentThrow;
}

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

    // const points = startX+","+startY+" "+peakX+","+peakY+" "+endX+","+endY;

    // let separator = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    // separator.setAttribute("stroke",backgroundColor);
    // separator.setAttribute("stroke-width",+lineWidth + +separatorWidth);
    // separator.setAttribute("stroke-linecap","butt");
    // separator.setAttribute("fill",backgroundColor);
    // separator.setAttribute("fill-opacity",0);
    // separator.setAttribute("points", points);

    // This neatens the overlap between throws. It would be better to actually calculate the length, and
    // subtract the polyline's width from each side. Instead of doing that math, I just chop off 5% from the start and end.
    // separator.setAttribute("pathLength","100");
    // separator.setAttribute("stroke-dasharray","90 10");
    // separator.setAttribute("stroke-dashoffset","-5");

    // svg.appendChild(separator);

    //TODO: get the separator also working for "Sort by catcher" mode
    generateLines(svg, startX, startY, peakX, peakY, lineWidth, separatorColor, separatorWidth, ((catchOrigin[i]+1)%2) || unidirectional, catchSide*direction);
    generateLines(svg, endX, endY, peakX, peakY, lineWidth, separatorColor, separatorWidth);

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

    // polyline.setAttribute("stroke",lineColor);
    // polyline.setAttribute("stroke-width",lineWidth);
    // polyline.setAttribute("stroke-linecap","round");
    // polyline.setAttribute("stroke-linejoin","round");
    // polyline.setAttribute("fill",backgroundColor);
    // polyline.setAttribute("fill-opacity",0);
    // polyline.setAttribute("points", points);
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
        label.setAttribute("fill",separatorColor)        
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
        label.setAttribute("fill",separatorColor)        
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
        separator.setAttribute("stroke",separatorColor);
        separator.setAttribute("stroke-width",+lineWidth + +separatorWidth);
        separator.setAttribute("stroke-linecap","butt");
        separator.setAttribute("fill",separatorColor);
        separator.setAttribute("fill-opacity",0);
        separator.setAttribute("x1", startX);
        separator.setAttribute("y1", startY);
        separator.setAttribute("x2", endX);

        // This neatens the overlap between throws. It would be better to actually calculate the length, and
        // subtract the polyline's width from each side. Instead of doing that math, I just chop off 5% from the start and end.
        separator.setAttribute("pathLength","100");
        separator.setAttribute("stroke-dasharray","90 10");
        separator.setAttribute("stroke-dashoffset","-5");

        // svg.appendChild(separator);

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
        const y2 = 50 + (+ladderWidth * newSide);
        line.setAttribute("y2",50 + (+ladderWidth * newSide));
        separator.setAttribute("y2",50 + (+ladderWidth * newSide));
        generateLines(ladderSvg, startX, startY, endX, y2, lineWidth, separatorColor, separatorWidth, false);
        generateLines(ladderSvg, startX, startY, endX, y2, lineWidth, lineColor, 0);
        // ladderSvg.appendChild(separator);
        // ladderSvg.appendChild(line);
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
            separator.setAttribute("stroke",separatorColor);
            separator.setAttribute("stroke-width",+lineWidth + +separatorWidth);
            separator.setAttribute("stroke-linecap","round");
            separator.setAttribute("stroke-linejoin","round");
            separator.setAttribute("fill",separatorColor);
            separator.setAttribute("fill-opacity",0);
            separator.setAttribute("points", points);
            // This neatens the overlap between throws. It would be better to actually calculate the length, and
            // subtract the polyline's width from each side. Instead of doing that math, I just chop off 5% from the start and end.
            separator.setAttribute("pathLength","100");
            separator.setAttribute("stroke-dasharray","80 20");
            separator.setAttribute("stroke-dashoffset","-10");
            // ladderSvg.appendChild(separator);
            // TODO generateLines needs to account for the fact that we are connecting lines that might not have the same slope.
            // This was not an issue in siteswap diagram, but it is in the ladder diagram.
            generateLines(ladderSvg, startX, startY, peakX, peakY, lineWidth, separatorColor, separatorWidth, catchOrigin[i] != null, side?-1:1);
            generateLines(ladderSvg, endX, startY, peakX, peakY, lineWidth, separatorColor, separatorWidth);

            let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            polyline.setAttribute("stroke",lineColor);
            polyline.setAttribute("stroke-width",lineWidth);
            polyline.setAttribute("stroke-linecap","round");
            polyline.setAttribute("stroke-linejoin","round");
            polyline.setAttribute("fill",separatorColor);
            polyline.setAttribute("fill-opacity",0);
            polyline.setAttribute("points", points);;
            // ladderSvg.appendChild(polyline);
            generateLines(ladderSvg, startX, startY, peakX, peakY, lineWidth, lineColor, 0);
            generateLines(ladderSvg, endX, startY, peakX, peakY, lineWidth, lineColor, 0);
        } else {
            if (flatten && pattern[i] == 2) {
                peakY = startY;
            }
            let separator = document.createElementNS("http://www.w3.org/2000/svg", "path");
            separator.setAttribute("stroke",separatorColor);
            separator.setAttribute("stroke-width",+lineWidth + +separatorWidth);
            separator.setAttribute("stroke-linecap","butt");
            separator.setAttribute("fill",separatorColor);
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
            path.setAttribute("fill",separatorColor);
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

function generateLines(svg,x1,y1,x2,y2,thickness,color,sepThickness, fixIntercept, down) {
    const slope = (y2-y1)/(x2-x1);
    const radius = (+thickness + +sepThickness)/2;
    const sepRadius = sepThickness ? +sepThickness : 0;

    //TODO: delete xOffset and yOffset
    const xOffset = radius*Math.sin(Math.atan(slope));
    const yOffset = radius*Math.cos(Math.atan(slope));

    const breadth1 = calculateBreadthPoints({x:x1,y:y1},slope,radius*2);
    const left1 = breadth1.x1 + "," + breadth1.y1;
    const right1 = breadth1.x2 + "," + breadth1.y2;

    const breadth2 = calculateBreadthPoints({x:x2,y:y2},slope,radius*2);
    const left2 = breadth2.x1 + "," + breadth2.y1;
    const right2 = breadth2.x2 + "," + breadth2.y2;

    let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("fill",color);
    polygon.setAttribute("points", right1+" "+left1+" "+left2+" "+right2);
    
    if (sepRadius == 0) {
        // Round the edges for lines, but not for separators.
        let circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle1.setAttribute("cx",x1);  
        circle1.setAttribute("cy",y1);
        circle1.setAttribute("r",radius);
        circle1.setAttribute("fill",color);
        // circle1.setAttribute("opacity",0.5);
        svg.appendChild(circle1);

        let circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle2.setAttribute("cx",x2);  
        circle2.setAttribute("cy",y2);
        circle2.setAttribute("r",radius);
        circle2.setAttribute("fill",color);        
        // circle2.setAttribute("opacity",0.5);
        svg.appendChild(circle2);    

        //debug
        // polygon.setAttribute("stroke-width",2);
        // polygon.setAttribute("stroke","yellow");
        // polygon.setAttribute("opacity",0.5);
    } else {
        //debug
        // polygon.setAttribute("stroke-width",2);
        // polygon.setAttribute("stroke","blue");
        // polygon.setAttribute("opacity",0.5);


        // Do the special things required for separators.
        let circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle2.setAttribute("cx",x2);  
        circle2.setAttribute("cy",y2);
        circle2.setAttribute("r",radius);
        circle2.setAttribute("fill",color);        
        svg.appendChild(circle2); 

        //debug
        // circle2.setAttribute("stroke-width",2);
        // circle2.setAttribute("stroke","blue");
        // circle2.setAttribute("opacity",0.5);

        if(fixIntercept && (y1!=y2)) {
            // check if y1=y2 to avoid attempting invalid math for a horizintal line.

            const xOffsetS = (thickness/2)*Math.cos(Math.atan(slope));
            const yOffsetS = (thickness/2)*Math.sin(Math.atan(slope));
            const lineEdgeX = x1+xOffsetS;
            const lineEdgeY = y1+yOffsetS;
            // const newRight1 = (lineEdgeX+xOffset) + "," + (lineEdgeY-yOffset); 
            // const newLeft1 = (lineEdgeX-xOffset) + "," + (lineEdgeY+yOffset);

            // The point defined by newRight1 will work where lines intersect at 90 degree angles.
            // At other angles, the separator may cover part of the previous line that we don't
            // want to be covered. Therefore, some extra math is required. Instead of having an edge
            // that forms a right angle with the side, we need an edge that is parallel to the previous line.
            const previousLineSlope = (-1) * slope;
            const previousLineX1 = (down == -1) ? lineEdgeX-xOffset : lineEdgeX+xOffset;
            const previousLineY1 = (down == -1) ? lineEdgeY+yOffset : lineEdgeY-yOffset;
            const previousLinePoint = {x:previousLineX1,y:previousLineY1};
            // Previous line's equation is: y = previousLineSlope * x + (previousLineY1 - slope*previousLineX1)

            const currentLineX1 = (down == -1) ? lineEdgeX+xOffset : lineEdgeX-xOffset;
            const currentLineY1 = (down == -1) ? lineEdgeY-yOffset : lineEdgeY+yOffset;
            const currentLinePoint = {x:currentLineX1,y:currentLineY1};
            // Current line's equation is: y = slope * x + (currentLineY1 - slope*currentLineX1)

            // Calculate x value where the lines intersect:
            // previousLineSlope * x + (previousLineY1 - slope*previousLineX1) = currentLineSlope * x + (currentLineY1 - slope*currentLineX1)
            const interceptPoint = calculateIntercept(previousLinePoint,previousLineSlope,currentLinePoint,slope);
            const intercept = interceptPoint.x + "," + interceptPoint.y;




            //debug
            // polygon.setAttribute("stroke-width",2);
            // polygon.setAttribute("stroke","red");
            // polygon.setAttribute("opacity",0.5);

            const breadthPreviousLine = calculateBreadthPoints({x:x1,y:y1},(-1)*slope,+thickness);

            const notchCornerPoint = (down == -1) ? {x:breadthPreviousLine.x2,y:breadthPreviousLine.y2} 
                : {x:breadthPreviousLine.x1,y:breadthPreviousLine.y1};
            const notchCorner = pointToString(notchCornerPoint);

            const notchUpperEdgeBreadthPoint = (down == -1) ? {x:breadth1.x2,y:breadth1.y2} : {x:breadth1.x1,y:breadth1.y1}; 
            const notchUpperEdgePoint = calculateIntercept(notchCornerPoint,(-1)*slope,{x:notchUpperEdgeBreadthPoint.x,y:notchUpperEdgeBreadthPoint.y},slope);
            const notchUpperEdge = pointToString(notchUpperEdgePoint);

            const circleInterceptBreadthPoint = (down == -1) ? {x:breadth1.x1,y:breadth1.y1} : {x:breadth1.x2,y:breadth1.y2};
            const circleInterceptPoint = calculateIntercept({x:x1,y:y1},(-1)*slope,{x:circleInterceptBreadthPoint.x,y:circleInterceptBreadthPoint.y},slope);
            const circleIntercept = pointToString(circleInterceptPoint);

            const points = (down == -1) ? notchUpperEdge + " " + notchCorner +" "+ x1+","+y1 + " " + circleIntercept +" "+left2+" "+right2
                : circleIntercept + " " + x1+","+y1 + " " + notchCorner + " " + notchUpperEdge +" "+left2+" "+right2;
            polygon.setAttribute("points",points);

            // let debugCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            // debugCircle.setAttribute("cx",notchCornerPoint.x);  
            // debugCircle.setAttribute("cy",notchCornerPoint.y);
            // debugCircle.setAttribute("r",5);
            // debugCircle.setAttribute("fill","green");        
            // svg.appendChild(debugCircle); 
        } else {
                        //TODO: get the circle right. It should be placed at the end of the "previous throw", rather than the start of the "current throw"
                        let circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                        circle1.setAttribute("cx",x1);  
                        circle1.setAttribute("cy",y1);
                        circle1.setAttribute("r",radius);
                        circle1.setAttribute("fill",color);        
                        // svg.appendChild(circle1);      
            
                        //debug
                        // circle1.setAttribute("stroke-width",2);
                        // circle1.setAttribute("stroke","red");
                        // circle1.setAttribute("opacity",0.5); 
        }
    }
    svg.appendChild(polygon);
}

/**
 * Calculate the point where two lines intercept,
 * given a point and slope for each line.
 * @param {x,y} line1Point a single point from the first line
 * @param  line1Slope the slope of the first line
 * @param {x,y} line2Point a sline point from the second line
 * @param line2Slope the slope of the second line
 * @returns {x,y} intercept point of the two lines
 */
function calculateIntercept(line1Point, line1Slope, line2Point, line2Slope) {
    const interceptX = (line1Point.y - line1Slope*line1Point.x - line2Point.y + line2Slope*line2Point.x) / (line2Slope-line1Slope);
    const interceptY = line1Slope * interceptX + (line1Point.y - line1Slope*line1Point.x);
    return {x:interceptX,y:interceptY};
}

/**
 * Given a single point and slope of a line, which represents the length of a rectangle,
 * running through the middle of said rectangle, calculate the x,y coordinates of the two
 * points representing the rectangle's breadth. The breadth line is perpendicular to the
 * provided line, and its width is equal to the provided width.
 * @param {x,y} point 
 * @param slope 
 * @param width 
 * @returns {x1,y1,x2,y2}
 */
function calculateBreadthPoints(point,slope,width) {
    const xOffset = (width/2)*Math.sin(Math.atan((-1)*slope));
    const yOffset = (width/2)*Math.cos(Math.atan((-1)*slope));

    const x1 = point.x + xOffset;
    const y1 = point.y + yOffset; 

    const x2 = point.x - xOffset;
    const y2 = point.y - yOffset; 

    return {x1:x1,y1:y1,x2,x2,y2,y2};
}

function pointToString(point) {
    return point.x + "," + point.y;
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
    // separatorColor = document.getElementById("backgroundColorInput").value;
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