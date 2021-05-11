let siteswap:number[]=[7,7,7,8,2,7,7,7,2,6]; //The base siteswap
let throws:number = 30; // The number of throws to show
let lineWidth:number = 25; // Thickness of the line showing the pattern
let lineColor:string = "yellow"; 
let backgroundColor:string = "#0F4336";
let separatorColor:string = "black";
let centerLineColor:string = "red";
let centerLineWidth:number = 5;
let separatorWidth:number = 10; // How much thicker the separator line is than the pattern line
let showLastCatches:boolean = false; 
let showValueAtPeak:boolean = false;
let showValueAtThrow:boolean = false;
let showCenterLine:boolean = false;
let catching:boolean = false;
let unidirectional:boolean = false;
let invert:boolean = false;
let widthIncrement:number = 100;
let valueSize:number = 20;
let valueBackgroundColor:string = "white";
let valueOutlineColor:string = "black";
let valueTextColor:string = "black";
let valueTextSize:number = 25;
let showOnlyFirstThrows:boolean = false;
let flatten:boolean = true;

const prefixes = ['line','value','separator','text'];
let currentSelection = -1;
let pattern = siteswap;


setInput();
refresh();
disableInputs();

function refresh() {
    pattern = siteswap;
    while (pattern.length < throws) {
        pattern = pattern.concat(siteswap);
    }
    pattern = pattern.slice(0,throws);

    // When drawing the separator line, it is sometimes necessary to know
    // what the last throw of the given object was.
    let catchOrigin = [];
    for (let i=0; i<pattern.length; i++) {
        const currentThrow = pattern[i];
        catchOrigin[i+currentThrow] = currentThrow;
    }

    let lastLandingBeat = pattern.length;
    if (showLastCatches) {
        let landings: number[] = [];
        for (let i=0; i<pattern.length; i++) {
            landings.push(i+pattern[i]);
        }
        lastLandingBeat = Math.max(...landings) + 1;
    }

    let height = 1000;
    if (unidirectional) {
        height = 600;
    }

    const width = widthIncrement + lastLandingBeat * widthIncrement;
    let siteswapContainer: HTMLElement = document.getElementById('siteswapContainer');
    siteswapContainer.innerHTML = '';
    let siteswapSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    siteswapSvg.addEventListener('focus', () =>{
        this.addEventListener('keyup', logKey);
    });

    siteswapSvg.setAttribute("id","siteswap");
    siteswapSvg.setAttribute("viewBox", "0 0 "+width+" "+height);
    siteswapSvg.setAttribute("style","background-color:"+backgroundColor);

    if (showCenterLine) {
        let lineCenter = document.createElementNS("http://www.w3.org/2000/svg", "line"); 
        lineCenter.setAttribute("stroke",centerLineColor);
        lineCenter.setAttribute("stroke-width",String(centerLineWidth));
        lineCenter.setAttribute("x1",String(widthIncrement));
        lineCenter.setAttribute("y1",String(500));
        lineCenter.setAttribute("x2",String(widthIncrement + widthIncrement * pattern.length + pattern[pattern.length-1]));
        lineCenter.setAttribute("y2",String(500));
        siteswapSvg.appendChild(lineCenter);
    }

    const fullWidth = lineWidth + separatorWidth;
    let corners = [];

    const highestThrow = Math.max(...pattern);
    let heightMultiplier = 100;
    if (highestThrow > 9) {
        heightMultiplier = (9 / highestThrow) * 100;
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

        let firstThrow = true;
            for (let j=i-1; j>=0; j--) {
                if (pattern[j] == i-j) {
                    firstThrow = false;
                }
        }

        const centerPoint = 500;
        const startX = widthIncrement + (widthIncrement * i);
        const startY = centerPoint;
        const endX = startX + (widthIncrement * pattern[i]);
        const endY = centerPoint;
        const peakX = startX + ((widthIncrement * pattern[i]) / 2);
        let peakY = centerPoint + catchSide*direction*(heightMultiplier * pattern[i] / 2);
    
        if (flatten && pattern[i] <= 1) {
            peakY = centerPoint;
        }



        // Draw separator line

        if (firstThrow) {
            let sepLineStartPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            sepLineStartPoint.setAttribute("cx",String(startX));
            sepLineStartPoint.setAttribute("cy",String(startY));
            sepLineStartPoint.setAttribute("r",String(fullWidth/2));
            sepLineStartPoint.setAttribute("fill",separatorColor);
            // sepLineStartPoint.setAttribute("stroke-width","2"); //debug
            // sepLineStartPoint.setAttribute("stroke","blue"); //debug
            // sepLineStartPoint.setAttribute("opacity","0.5"); //debug
            siteswapSvg.appendChild(sepLineStartPoint); 
        }

        let sepLineEndPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        sepLineEndPoint.setAttribute("cx",String(peakX));
        sepLineEndPoint.setAttribute("cy",String(peakY));
        sepLineEndPoint.setAttribute("r",String(fullWidth/2));
        sepLineEndPoint.setAttribute("fill",separatorColor); 
        // sepLineEndPoint.setAttribute("stroke-width","2"); //debug
        // sepLineEndPoint.setAttribute("stroke","blue"); //debug
        // sepLineEndPoint.setAttribute("opacity","0.5"); //debug       
        siteswapSvg.appendChild(sepLineEndPoint);

        let sepLineEndPoint2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        sepLineEndPoint2.setAttribute("cx",String(endX));
        sepLineEndPoint2.setAttribute("cy",String(endY));
        sepLineEndPoint2.setAttribute("r",String(fullWidth/2));
        sepLineEndPoint2.setAttribute("fill",separatorColor);    
        // sepLineEndPoint2.setAttribute("stroke-width","2"); //debug
        // sepLineEndPoint2.setAttribute("stroke","blue"); //debug
        // sepLineEndPoint2.setAttribute("opacity","0.5"); //debug    
        siteswapSvg.appendChild(sepLineEndPoint2);
        // let downLine = generateLine(peakX,peakY,endX,endY,lineWidth,lineColor,null, siteswapSvg);
        // addListeners(downLine, i);
        // siteswapSvg.appendChild(downLine);

        let fixCorner = null;
        if ((catchOrigin[i] % 2 == 0 || unidirectional) && corners[i] != null){
            if (direction == -1) {
                fixCorner = {point1: corners[i].upperLeft, point2: corners[i].lowerLeft, clockwise: true};
            } else {
                fixCorner = {point1: corners[i].upperRight, point2: corners[i].lowerRight, clockwise: false};
            }
        }
        
        siteswapSvg.appendChild(generateLine(startX,startY,peakX,peakY,fullWidth,separatorColor,fixCorner, siteswapSvg));
        siteswapSvg.appendChild(generateLine(peakX,peakY,endX,endY,fullWidth,separatorColor,null, siteswapSvg));

        // Draw siteswap line
        let lineStartPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        lineStartPoint.setAttribute("cx",String(startX));
        lineStartPoint.setAttribute("cy",String(startY));
        lineStartPoint.setAttribute("r",String(lineWidth/2));
        lineStartPoint.setAttribute("fill",lineColor);        
        addListeners(lineStartPoint, 'line', i);
        siteswapSvg.appendChild(lineStartPoint);

        let lineEndPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        lineEndPoint.setAttribute("cx",String(peakX));
        lineEndPoint.setAttribute("cy",String(peakY));
        lineEndPoint.setAttribute("r",String(lineWidth/2));
        lineEndPoint.setAttribute("fill",lineColor);        
        addListeners(lineEndPoint,'line', i);
        siteswapSvg.appendChild(lineEndPoint);

        let upLine = generateLine(startX,startY,peakX,peakY,lineWidth,lineColor,null, siteswapSvg);
        addListeners(upLine, 'line', i);
        siteswapSvg.appendChild(upLine);

        let lineEndPoint2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        lineEndPoint2.setAttribute("cx",String(endX));
        lineEndPoint2.setAttribute("cy",String(endY));
        lineEndPoint2.setAttribute("r",String(lineWidth/2));
        lineEndPoint2.setAttribute("fill",lineColor);        
        addListeners(lineEndPoint2,'line', i);
        siteswapSvg.appendChild(lineEndPoint2);

        let downLine = generateLine(peakX,peakY,endX,endY,lineWidth,lineColor,null, siteswapSvg);
        addListeners(downLine,'line', i);
        siteswapSvg.appendChild(downLine);

        // In order to correctly draw the separator for the line that connects
        // with this one, we need to save this line's info
        const infoToSave = generateBreadthPoints({x:peakX, y:peakY}, {x:endX, y:endY}, fullWidth); 
        corners[i+pattern[i]] = infoToSave;

        //TODO: remove below section
        // const points = startX+","+startY+" "+peakX+","+peakY+" "+endX+","+endY;
        // let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        // polyline.setAttribute("stroke","blue");
        // polyline.setAttribute("stroke-width",String(2));
        // polyline.setAttribute("stroke-linecap","round");
        // polyline.setAttribute("stroke-linejoin","round");
        // polyline.setAttribute("fill-opacity",String(0));
        // polyline.setAttribute("points", points);
        // svg.appendChild(polyline);
        ///TODO: remove above section

        if (showValueAtPeak) {
            let label = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            label.setAttribute("cx",String(peakX));
            label.setAttribute("cy",String(peakY));
            label.setAttribute("r",String(valueSize));
            label.setAttribute("stroke",valueOutlineColor);
            label.setAttribute("stroke-width","2");
            label.setAttribute("fill",valueBackgroundColor);        
            addListeners(label, 'value', i);
            siteswapSvg.appendChild(label);
    
            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x",String(peakX));
            text.setAttribute("y",String(peakY));
            text.setAttribute("font-size",String(valueTextSize));
            text.setAttribute("fill",valueTextColor);
            text.setAttribute("text-anchor","middle");
            text.setAttribute("alignment-baseline","middle");
            text.textContent = intToSiteswapDigit(pattern[i]);
            addListeners(text, 'text', i);
            siteswapSvg.appendChild(text);
        }
    

        if (showValueAtThrow) {
            if (!showOnlyFirstThrows || firstThrow) {
                let label = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                label.setAttribute("cx",String(startX));
                label.setAttribute("cy",String(startY));
                label.setAttribute("r",String(valueSize));
                label.setAttribute("stroke",valueOutlineColor);
                label.setAttribute("stroke-width","2");
                label.setAttribute("fill",valueBackgroundColor);
                addListeners(label, 'value', i);
                siteswapSvg.appendChild(label);
        
                let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x",String(startX));
                text.setAttribute("y",String(startY));
                text.setAttribute("text-anchor","middle");
                text.setAttribute("alignment-baseline","middle");
                text.setAttribute("font-size",String(valueTextSize));
                text.setAttribute("fill",valueTextColor);
                text.textContent = intToSiteswapDigit(pattern[i]);
                addListeners(text, 'text', i);
                siteswapSvg.appendChild(text);
            }
        }    
    }

    siteswapContainer.appendChild(siteswapSvg);

    // Ladder diagram
    const ladderWidth = 400;
    const throwStartingPoint = 50;
    const throwBuffer = 40;

    let ladderContainer = document.getElementById('ladderContainer');
    ladderContainer.innerHTML = '';

    let ladderSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    ladderSvg.addEventListener('focus', function(){
        this.addEventListener('keyup', logKey);
    });
    ladderSvg.setAttribute("id","ladder");
    ladderSvg.setAttribute("viewBox", "0 0 "+width+" "+ (100+ladderWidth));
    ladderSvg.setAttribute("style","background-color:"+backgroundColor);

    const centerPoint = (ladderWidth/2) + throwStartingPoint;
    if (showCenterLine) {
        let ladderCenterLine = document.createElementNS("http://www.w3.org/2000/svg", "line"); 
        ladderCenterLine.setAttribute("stroke",centerLineColor);
        ladderCenterLine.setAttribute("stroke-width",String(centerLineWidth));
        ladderCenterLine.setAttribute("x1",String(widthIncrement));
        ladderCenterLine.setAttribute("y1",String(centerPoint));
        ladderCenterLine.setAttribute("x2",String(widthIncrement + widthIncrement * pattern.length + pattern[pattern.length-1]));
        ladderCenterLine.setAttribute("y2",String(centerPoint));
        ladderSvg.appendChild(ladderCenterLine);
    }

    corners = [];
    const maxPossibleHeight = centerPoint - throwStartingPoint - throwBuffer;

    heightMultiplier = maxPossibleHeight / 9;
    if (highestThrow > 9) {
        heightMultiplier = maxPossibleHeight / highestThrow;
    }

    for (let i=0; i<pattern.length; i++) {
        let side = (i % 2);
        if (invert) {
            side = (i+1) % 2;
        }
        const crosses = (pattern[i] % 2);
    
        const startX = widthIncrement + (widthIncrement * i);
        const startY = throwStartingPoint + (ladderWidth * side);
        const endX = startX + (widthIncrement * pattern[i]);
        const peakX = startX + ((widthIncrement * pattern[i]) / 2);
        let firstThrow = true;
            for (let j=i-1; j>=0; j--) {
                if (pattern[j] == i-j) {
                    firstThrow = false;
                }
        }

        if (pattern[i] % 2) {
            // Draw straight lines that cross from one side to the other
            var newSide = 0;
            if (side) {
                newSide = 0;
            } else {
                newSide = 1;
            }
            const endY = throwStartingPoint + (ladderWidth * newSide);

            if (firstThrow) {
                let sepLineStartPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                sepLineStartPoint.setAttribute("cx",String(startX));
                sepLineStartPoint.setAttribute("cy",String(startY));
                sepLineStartPoint.setAttribute("r",String(fullWidth/2));
                sepLineStartPoint.setAttribute("fill",separatorColor);
                // sepLineStartPoint.setAttribute("stroke-width","2"); //debug
                // sepLineStartPoint.setAttribute("stroke","blue"); //debug
                // sepLineStartPoint.setAttribute("opacity","0.5"); //debug
                ladderSvg.appendChild(sepLineStartPoint); 
            }
    
            let sepLineEndPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            sepLineEndPoint.setAttribute("cx",String(endX));
            sepLineEndPoint.setAttribute("cy",String(endY));
            sepLineEndPoint.setAttribute("r",String(fullWidth/2));
            sepLineEndPoint.setAttribute("fill",separatorColor); 
            // sepLineEndPoint.setAttribute("stroke-width","2"); //debug
            // sepLineEndPoint.setAttribute("stroke","blue"); //debug
            // sepLineEndPoint.setAttribute("opacity","0.5"); //debug       
            ladderSvg.appendChild(sepLineEndPoint);

            let fixCorner = null;
            if (corners[i] != null){
                if (side ==1 ) {
                    fixCorner = {point1: corners[i].upperLeft, point2: corners[i].lowerLeft, clockwise: true};
                } else {
                    fixCorner = {point1: corners[i].upperRight, point2: corners[i].lowerRight, clockwise: false};
                }
            }

            ladderSvg.appendChild(generateLine(startX,startY,endX,endY,fullWidth,separatorColor,fixCorner, ladderSvg));

            let lineStartPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            lineStartPoint.setAttribute("cx",String(startX));
            lineStartPoint.setAttribute("cy",String(startY));
            lineStartPoint.setAttribute("r",String(lineWidth/2));
            lineStartPoint.setAttribute("fill",lineColor);
            addListeners(lineStartPoint,'line', i);
            ladderSvg.appendChild(lineStartPoint);

            let lineEndPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            lineEndPoint.setAttribute("cx",String(endX));
            lineEndPoint.setAttribute("cy",String(endY));
            lineEndPoint.setAttribute("r",String(lineWidth/2));
            lineEndPoint.setAttribute("fill",lineColor);        
            addListeners(lineEndPoint, 'line', i);
            ladderSvg.appendChild(lineEndPoint);

            let currentLine = generateLine(startX,startY,endX,endY,lineWidth,lineColor,null, ladderSvg);
            addListeners(currentLine,'line', i);
            currentLine.classList.add(String(i));
            ladderSvg.appendChild(currentLine);

            // In order to correctly draw the separator for the line that connects
            // with this one, we need to save this line's info
            const infoToSave = generateBreadthPoints({x:startX, y:startY}, {x:endX, y:endY}, fullWidth); 
            corners[i+pattern[i]] = infoToSave;

            // let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            // line.setAttribute("stroke","blue");
            // line.setAttribute("stroke-width","2");
            // line.setAttribute("x1",String(startX));
            // line.setAttribute("y1",String(startY));
            // line.setAttribute("x2",String(endX));
            // line.setAttribute("y2",String(endY));
            // ladderSvg.appendChild(line);
        } else {
            // Draw lines that start and end on the same side, peaking somewhere in the middle
            var newSide = 0;
            if (side) {
                newSide = 0;
            } else {
                newSide = 1;
            }
            let peakY;
            if (flatten && (pattern[i] == 2) || pattern[i] == 0) {
                peakY = startY;
            } else {
                if (side) {
                    peakY = startY - (pattern[i] * heightMultiplier) - throwBuffer;
                } else {
                    peakY = startY + (pattern[i] * heightMultiplier) + throwBuffer;
                }
            }


            if (firstThrow) {
                let sepLineStartPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                sepLineStartPoint.setAttribute("cx",String(startX));
                sepLineStartPoint.setAttribute("cy",String(startY));
                sepLineStartPoint.setAttribute("r",String(fullWidth/2));
                sepLineStartPoint.setAttribute("fill",separatorColor);
                // sepLineStartPoint.setAttribute("stroke-width","2"); //debug
                // sepLineStartPoint.setAttribute("stroke","blue"); //debug
                // sepLineStartPoint.setAttribute("opacity","0.5"); //debug
                ladderSvg.appendChild(sepLineStartPoint); 
            }
    
            let sepLineEndPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            sepLineEndPoint.setAttribute("cx",String(peakX));
            sepLineEndPoint.setAttribute("cy",String(peakY));
            sepLineEndPoint.setAttribute("r",String(fullWidth/2));
            sepLineEndPoint.setAttribute("fill",separatorColor); 
            // sepLineEndPoint.setAttribute("stroke-width","2"); //debug
            // sepLineEndPoint.setAttribute("stroke","blue"); //debug
            // sepLineEndPoint.setAttribute("opacity","0.5"); //debug       
            ladderSvg.appendChild(sepLineEndPoint);
    
            let sepLineEndPoint2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            sepLineEndPoint2.setAttribute("cx",String(endX));
            sepLineEndPoint2.setAttribute("cy",String(startY));
            sepLineEndPoint2.setAttribute("r",String(fullWidth/2));
            sepLineEndPoint2.setAttribute("fill",separatorColor);    
            // sepLineEndPoint2.setAttribute("stroke-width","2"); //debug
            // sepLineEndPoint2.setAttribute("stroke","blue"); //debug
            // sepLineEndPoint2.setAttribute("opacity","0.5"); //debug    
            ladderSvg.appendChild(sepLineEndPoint2);
    
            let fixCorner = null;
            if (corners[i] != null){
                if (side ==1 ) {
                    fixCorner = {point1: corners[i].upperLeft, point2: corners[i].lowerLeft, clockwise: true};
                } else {
                    fixCorner = {point1: corners[i].upperRight, point2: corners[i].lowerRight, clockwise: false};
                }
            }
            
            ladderSvg.appendChild(generateLine(startX,startY,peakX,peakY,fullWidth,separatorColor,fixCorner, ladderSvg));
            ladderSvg.appendChild(generateLine(peakX,peakY,endX,startY,fullWidth,separatorColor,null, ladderSvg));



            let lineStartPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            lineStartPoint.setAttribute("cx",String(startX));
            lineStartPoint.setAttribute("cy",String(startY));
            lineStartPoint.setAttribute("r",String(lineWidth/2));
            lineStartPoint.setAttribute("fill",lineColor);
            addListeners(lineStartPoint, 'line', i);
            ladderSvg.appendChild(lineStartPoint);

            let lineMidPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            lineMidPoint.setAttribute("cx",String(peakX));
            lineMidPoint.setAttribute("cy",String(peakY));
            lineMidPoint.setAttribute("r",String(lineWidth/2));
            lineMidPoint.setAttribute("fill",lineColor);
            addListeners(lineMidPoint,'line', i);
            ladderSvg.appendChild(lineMidPoint);

            let lineEndPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            lineEndPoint.setAttribute("cx",String(endX));
            lineEndPoint.setAttribute("cy",String(startY));
            lineEndPoint.setAttribute("r",String(lineWidth/2));
            lineEndPoint.setAttribute("fill",lineColor);
            addListeners(lineEndPoint,'line', i);
            ladderSvg.appendChild(lineEndPoint);

            let lineUp = generateLine(startX,startY,peakX,peakY,lineWidth,lineColor,null, ladderSvg);
            addListeners(lineUp,'line', i);
            ladderSvg.appendChild(lineUp);

            let lineDown = generateLine(peakX,peakY,endX,startY,lineWidth,lineColor,null, ladderSvg);
            addListeners(lineDown,'line', i);
            ladderSvg.appendChild(lineDown);

            // In order to correctly draw the separator for the line that connects
            // with this one, we need to save this line's info
            const infoToSave = generateBreadthPoints({x:peakX, y:peakY}, {x:endX, y:startY}, fullWidth); 
            corners[i+pattern[i]] = infoToSave;

            // const points = startX+","+startY+" "+peakX+","+peakY+" "+endX+","+startY;
            // let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            // polyline.setAttribute("stroke","blue");
            // polyline.setAttribute("stroke-width","2");
            // polyline.setAttribute("fill-opacity","0");
            // polyline.setAttribute("points", points);;
            // ladderSvg.appendChild(polyline);

        }


        if (showValueAtThrow) {
            if (!showOnlyFirstThrows || firstThrow) {
                let label = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                label.setAttribute("cx",String(startX));
                label.setAttribute("cy",String(startY));
                label.setAttribute("r",String(valueSize));
                label.setAttribute("stroke",String(valueOutlineColor));
                label.setAttribute("stroke-width","2");
                label.setAttribute("fill",valueBackgroundColor)        
                addListeners(label, 'value', i);
                ladderSvg.appendChild(label);
        
                let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x",String(startX));
                text.setAttribute("y",String(startY));
                text.setAttribute("font-size",String(valueTextSize));
                text.setAttribute("fill",valueTextColor);
                text.setAttribute("text-anchor","middle");
                text.setAttribute("alignment-baseline","middle");
                text.textContent = intToSiteswapDigit(pattern[i]);
                addListeners(text, 'text', i);
                ladderSvg.appendChild(text);
            }
        }
    }
    ladderContainer.appendChild(ladderSvg);

    click(currentSelection, true);
}

function generateLine(x1:number, y1:number, x2:number, y2:number, thickness:number, color:string, previousLine, svg) {
    if (y1==y2) {
        // this is a horizontal line
    }
    // naming convention like upper/lower, right/left are names only, and might not reflect reality
    // For a single line, they should all be accurate with respect to each other.
    // But a different line might be backwards, up-side-down, etc., compared to the first line.
    const lowerPoint = {x:x1,y:y1};
    const upperPoint = {x:x2,y:y2};

    const breadthPoints = generateBreadthPoints(upperPoint, lowerPoint, thickness);

    let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("fill",color);
    let points:string = pointToString(breadthPoints.lowerRight) + pointToString(breadthPoints.lowerLeft) + 
            pointToString(breadthPoints.upperLeft) + pointToString(breadthPoints.upperRight);
    if (previousLine != null) {
        let intercept = getIntercept(previousLine.point1,previousLine.point2,breadthPoints.upperLeft,breadthPoints.lowerLeft);
        if (previousLine.clockwise) {
            points = pointToString(breadthPoints.lowerRight) + pointToString({x:x1,y:y1}) + pointToString(intercept) +
                pointToString(breadthPoints.upperLeft) + pointToString(breadthPoints.upperRight);
        } else {
            intercept = getIntercept(previousLine.point1,previousLine.point2,breadthPoints.upperRight,breadthPoints.lowerRight);
            points = pointToString(breadthPoints.lowerLeft) + pointToString({x:x1,y:y1}) + pointToString(intercept) +
                pointToString(breadthPoints.upperRight) + pointToString(breadthPoints.upperLeft) + pointToString(breadthPoints.lowerLeft);
                // let debugCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                // debugCircle.setAttribute("cx",String(breadthPoints.lowerLeft.x));
                // debugCircle.setAttribute("cy",String(breadthPoints.lowerLeft.y));
                // debugCircle.setAttribute("r","5");
                // debugCircle.setAttribute("fill","red");        
                // svg.appendChild(debugCircle);
        }
    }
    polygon.setAttribute("points", points);
    // polygon.setAttribute("stroke-width","2"); //debug
    // polygon.setAttribute("stroke","blue"); //debug
    // if (color != "black") { //debug
    //     polygon.setAttribute("opacity","0.5"); //debug
    // } //debug



    return polygon;
}

function generateBreadthPoints(upperPoint,lowerPoint,width) {
    const slope = getSlope(upperPoint,lowerPoint);
    const xOffset = (width/2)*Math.sin(Math.atan(slope));
    const yOffset = (width/2)*Math.cos(Math.atan(slope));
    const lowerRight = {x: lowerPoint.x - xOffset, y: lowerPoint.y + yOffset};
    const lowerLeft = {x: lowerPoint.x + xOffset, y: lowerPoint.y - yOffset};
    const upperRight = {x: upperPoint.x - xOffset, y: upperPoint.y + yOffset};
    const upperLeft = {x: upperPoint.x + xOffset, y: upperPoint.y - yOffset};
    return {lowerLeft: lowerLeft, lowerRight: lowerRight, upperRight: upperRight, upperLeft: upperLeft};
}

function getSlope(point1,point2) {
    return (point2.y-point1.y)/(point2.x-point1.x);
}

function getIntercept(line1Point1,line1Point2,line2Point1,line2Point2) {
    const line1Slope= getSlope(line1Point1,line1Point2);
    const line2Slope = getSlope(line2Point1,line2Point2);
    const interceptX = (line1Point1.y - line1Slope*line1Point1.x - line2Point1.y + line2Slope*line2Point1.x) / (line2Slope-line1Slope);
    const interceptY = line1Slope * interceptX + (line1Point1.y - line1Slope*line1Point1.x);
    return {x:interceptX,y:interceptY};
}

function parseSiteswap(siteswapString: string): number[] {
    const siteswapChars = siteswapString.split('');
    let siteswapArray:number[] = [];
    for (const digit of siteswapString) {
        if (parseInt(digit) < 10) {
            siteswapArray.push(parseInt(digit));
        } else {
            const charCode = digit.toLowerCase().charCodeAt(0);
            if (charCode >= 'a'.charCodeAt(0) && charCode <= 'z'.charCodeAt(0)) {
                siteswapArray.push(charCode - 'a'.charCodeAt(0) + 10);
            }
        }
    }
    return siteswapArray; 
}

function siteswapToString(siteswapArray: number[]): string {
    let siteswapString = '';
    for (const digit of siteswapArray) {
        siteswapString += intToSiteswapDigit(digit);
    }
    return siteswapString;
}

function intToSiteswapDigit(digit: number): string {
    if (digit < 10) {
        return String(digit);
    } else {
        return String.fromCharCode(digit - 10 + 'a'.charCodeAt(0));
    }
}

function pointToString(point): string {
    return point.x + "," + point.y + " ";
}

function addListeners(element: SVGElement, prefix: string, throwIndex: number) {
    element.addEventListener('mouseover', function(){mouseOverEffect(throwIndex)}, false);
    element.addEventListener('mouseout', function(){mouseOutEffect(throwIndex)}, false);
    element.addEventListener('click', function(){click(throwIndex,false)}, false);
    element.classList.add(prefix+String(throwIndex));
}

function mouseOverEffect(value:number) {
    if (currentSelection == value % siteswap.length || value == -1) {
        return;
    }
    
    let position = value % siteswap.length;
    while (position < pattern.length) {
        ['line','value'].forEach((prefix) => { 
            let elements = document.getElementsByClassName(prefix+String(position));
            Array.from(elements).forEach((el) => {
                el.setAttribute("fill","lightblue");
            });
        });
        position += siteswap.length;
    }
}

function mouseOutEffect(value:number) {
    if (currentSelection == value % siteswap.length || value == -1) {
        return;
    }

    let position = value % siteswap.length;
    while (position < pattern.length) {
        let lines = document.getElementsByClassName('line'+String(position));
        Array.from(lines).forEach((el) => {
            el.setAttribute("fill",lineColor);
        });
        let values = document.getElementsByClassName('value'+String(position));
        Array.from(values).forEach((el) => {
            el.setAttribute("fill",valueBackgroundColor);
        });
        position += siteswap.length;
    }
}

function click(value:number, refreshSelection: boolean) {
    const oldSelection = currentSelection;
    if (value == -1) {
        currentSelection = -1;
    } else {
        if ((currentSelection == value % siteswap.length) && !refreshSelection) {
            currentSelection = -1;
        } else {
            currentSelection = value % siteswap.length;
            if (oldSelection != -1) {
                const distance = Math.abs(currentSelection - oldSelection);
                const newMax = siteswap[Math.max(currentSelection,oldSelection)] + distance;
                const newMin = siteswap[Math.min(currentSelection,oldSelection)] - distance;
                if (newMax <= 36 && newMin >= 0) {
                    siteswap[Math.max(currentSelection,oldSelection)] = newMin;
                    siteswap[Math.min(currentSelection,oldSelection)] = newMax; 
                    currentSelection = -1;
                    mouseOutEffect(oldSelection);
                    refresh();
                    setInput();
                }
            }
        }
    }
    mouseOutEffect(oldSelection);

    if (currentSelection == -1) {
        return;
    }
    let position = currentSelection;
    while (position < pattern.length) {
        ['line','value'].forEach((prefix) => { 
            let elements = document.getElementsByClassName(prefix+String(position));
            Array.from(elements).forEach((el) => {
                el.setAttribute("fill","blue");
            });
        });
        position += siteswap.length;
    }
}

function logKey(e) {
    console.log("key: ",e.key);
    if (currentSelection == -1) {
        switch (e.key) {
            case '+':
            case 'ArrowUp':
                if (Math.max(...siteswap) < 35) {
                    siteswap = siteswap.map(x=>x+1);
                }
                break;
            case '-':
            case 'ArrowDown':
                if (Math.min(...siteswap) > 0) {
                    siteswap = siteswap.map(x=>x-1);
                }
                break;
            default:
                return;
        }
        refresh();
        setInput();
    } else {
        let newVal;
        switch (e.key) {
            case '+':
            case 'ArrowUp':
                newVal = siteswap[currentSelection] + siteswap.length;
                if (newVal <= 36) {
                    siteswap[currentSelection] = newVal;
                }
                break;
            case '-':
            case 'ArrowDown':
                newVal = siteswap[currentSelection] - siteswap.length;
                if (newVal >= 0) {
                    siteswap[currentSelection] = newVal;
                }
                break;
            default:
                return;
        }
        refresh();
        setInput();
    }
  }

function getInput() {
    siteswap = parseSiteswap((document.getElementById("siteswapInput") as HTMLInputElement).value);
    // by parsing and updating the siteswap field, any invalid characters are removed
    (document.getElementById("siteswapInput") as HTMLInputElement).value = siteswapToString(siteswap);

    showValueAtPeak = (document.getElementById("showValueAtPeakCheck") as HTMLInputElement).checked;
    showLastCatches = (document.getElementById("showLastCatchesCheck") as HTMLInputElement).checked;
    showValueAtThrow = (document.getElementById("showValueAtThrowCheck") as HTMLInputElement).checked; 
    showCenterLine = (document.getElementById("showCenterLineCheck") as HTMLInputElement).checked;
    lineWidth = +(document.getElementById("lineWidthInput") as HTMLInputElement).value;
    centerLineWidth = +(document.getElementById("centerLineWidthInput") as HTMLInputElement).value;
    separatorWidth = +(document.getElementById("separatorWidthInput") as HTMLInputElement).value;
    throws = +(document.getElementById("throwsInput") as HTMLInputElement).value;

    catching = (document.getElementById("catchingCheck") as HTMLInputElement).checked;
    unidirectional = (document.getElementById("unidirectionalCheck") as HTMLInputElement).checked; 
    invert = (document.getElementById("invertCheck") as HTMLInputElement).checked; 
    showOnlyFirstThrows = (document.getElementById("showOnlyFirstThrowsCheck") as HTMLInputElement).checked;
    flatten = (document.getElementById("flattenCheck") as HTMLInputElement).checked;
    backgroundColor = (document.getElementById("backgroundColorInput") as HTMLInputElement).value;
    lineColor = (document.getElementById("lineColorInput") as HTMLInputElement).value;
    centerLineColor = (document.getElementById("centerLineColorInput") as HTMLInputElement).value;
    separatorColor = (document.getElementById("separatorColorInput") as HTMLInputElement).value;
    widthIncrement = +(document.getElementById("widthIncrementInput") as HTMLInputElement).value;
    valueSize = +(document.getElementById("valueSizeInput") as HTMLInputElement).value;
    valueBackgroundColor = (document.getElementById("valueBackgroundColorInput") as HTMLInputElement).value;
    valueOutlineColor = (document.getElementById("valueOutlineColorInput") as HTMLInputElement).value;
    valueTextColor = (document.getElementById("valueTextColorInput") as HTMLInputElement).value;
    valueTextSize = +(document.getElementById("valueTextSizeInput") as HTMLInputElement).value;

    disableInputs();
    refresh();
  }

function setInput() {
    (document.getElementById("showValueAtPeakCheck") as HTMLInputElement).checked = showValueAtPeak;
    (document.getElementById("showLastCatchesCheck") as HTMLInputElement).checked = showLastCatches;
    (document.getElementById("showValueAtThrowCheck") as HTMLInputElement).checked = showValueAtThrow; 
    (document.getElementById("showCenterLineCheck") as HTMLInputElement).checked = showCenterLine; 
    (document.getElementById("catchingCheck") as HTMLInputElement).checked = catching; 
    (document.getElementById("unidirectionalCheck") as HTMLInputElement).checked = unidirectional; 
    (document.getElementById("invertCheck") as HTMLInputElement).checked = invert; 
    (document.getElementById("showOnlyFirstThrowsCheck") as HTMLInputElement).checked = showOnlyFirstThrows; 
    (document.getElementById("flattenCheck") as HTMLInputElement).checked = flatten; 

    (document.getElementById("lineWidthInput") as HTMLInputElement).value = String(lineWidth);
    (document.getElementById("centerLineWidthInput") as HTMLInputElement).value = String(centerLineWidth);
    (document.getElementById("separatorWidthInput") as HTMLInputElement).value = String(separatorWidth);
    (document.getElementById("throwsInput") as HTMLInputElement).value = String(throws);
    (document.getElementById("siteswapInput") as HTMLInputElement).value = siteswapToString(siteswap);
    (document.getElementById("backgroundColorInput") as HTMLInputElement).value = backgroundColor;
    (document.getElementById("lineColorInput") as HTMLInputElement).value = lineColor;
    (document.getElementById("centerLineColorInput") as HTMLInputElement).value = centerLineColor;
    (document.getElementById("separatorColorInput") as HTMLInputElement).value = separatorColor;
    (document.getElementById("widthIncrementInput") as HTMLInputElement).value = String(widthIncrement);
    (document.getElementById("valueSizeInput") as HTMLInputElement).value = String(valueSize);
    (document.getElementById("valueBackgroundColorInput") as HTMLInputElement).value = valueBackgroundColor;
    (document.getElementById("valueOutlineColorInput") as HTMLInputElement).value = valueOutlineColor;
    (document.getElementById("valueTextColorInput") as HTMLInputElement).value = valueTextColor;
    (document.getElementById("valueTextSizeInput") as HTMLInputElement).value = String(valueTextSize);
}

// Based on checkboxes, disable any inputs that don't make sense to use
function disableInputs() {
    if (unidirectional) {
        (document.getElementById("catchingCheck") as HTMLInputElement).disabled = true;
        catching = false;
        (document.getElementById("invertCheck") as HTMLInputElement).disabled = true;
        invert = false;
    } else {
        (document.getElementById("catchingCheck") as HTMLInputElement).disabled = false;
        (document.getElementById("invertCheck") as HTMLInputElement).disabled = false;
    }

    (document.getElementById("centerLineColorInput") as HTMLInputElement).disabled = !showCenterLine; 
    (document.getElementById("centerLineWidthInput") as HTMLInputElement).disabled = !showCenterLine; 
    
    (document.getElementById("showOnlyFirstThrowsCheck") as HTMLInputElement).disabled = !showValueAtThrow;
    const showSomeValues = (showValueAtThrow || showValueAtPeak);
    (document.getElementById("valueSizeInput") as HTMLInputElement).disabled = !showSomeValues;
    (document.getElementById("valueBackgroundColorInput") as HTMLInputElement).disabled = !showSomeValues;
    (document.getElementById("valueOutlineColorInput") as HTMLInputElement).disabled = !showSomeValues;
    (document.getElementById("valueTextColorInput") as HTMLInputElement).disabled = !showSomeValues;
    (document.getElementById("valueTextSizeInput") as HTMLInputElement).disabled = !showSomeValues;
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