import { Injectable } from '@angular/core';
import { Fixcorner } from './fixcorner';
import { Point } from './point';

@Injectable({
  providedIn: 'root'
})
export class DrawingService {

  constructor() { }

  public generateLine(x1:number, y1:number, x2:number, y2:number, thickness:number, color:string, previousLine:Fixcorner) {
    if (y1==y2) {
        // this is a horizontal line
    }
    // naming convention like upper/lower, right/left are names only, and might not reflect reality
    // For a single line, they should all be accurate with respect to each other.
    // But a different line might be backwards, up-side-down, etc., compared to the first line.
    const lowerPoint = {x:x1,y:y1};
    const upperPoint = {x:x2,y:y2};

    const breadthPoints = this.generateBreadthPoints(upperPoint, lowerPoint, thickness);

    let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("fill",color);
    let points:string = this.pointToString(breadthPoints.lowerRight) + this.pointToString(breadthPoints.lowerLeft) + 
            this.pointToString(breadthPoints.upperLeft) + this.pointToString(breadthPoints.upperRight);
    if (previousLine != null) {
        let intercept = this.getIntercept(previousLine.point1,previousLine.point2,breadthPoints.upperLeft,breadthPoints.lowerLeft);
        if (previousLine.clockwise) {
            points = this.pointToString(breadthPoints.lowerRight) + this.pointToString({x:x1,y:y1}) + this.pointToString(intercept) +
                this.pointToString(breadthPoints.upperLeft) + this.pointToString(breadthPoints.upperRight);
        } else {
            intercept = this.getIntercept(previousLine.point1,previousLine.point2,breadthPoints.upperRight,breadthPoints.lowerRight);
            points = this.pointToString(breadthPoints.lowerLeft) + this.pointToString({x:x1,y:y1}) + this.pointToString(intercept) +
                this.pointToString(breadthPoints.upperRight) + this.pointToString(breadthPoints.upperLeft) + this.pointToString(breadthPoints.lowerLeft);
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
        // polygon.setAttribute("opacity","0.5"); //debug
    // } //debug



    return polygon;
  }

  public generateBreadthPoints(upperPoint:Point,lowerPoint:Point,width:number) {
    const slope = this.getSlope(upperPoint,lowerPoint);
    const xOffset = (width/2)*Math.sin(Math.atan(slope));
    const yOffset = (width/2)*Math.cos(Math.atan(slope));
    const lowerRight = {x: lowerPoint.x - xOffset, y: lowerPoint.y + yOffset};
    const lowerLeft = {x: lowerPoint.x + xOffset, y: lowerPoint.y - yOffset};
    const upperRight = {x: upperPoint.x - xOffset, y: upperPoint.y + yOffset};
    const upperLeft = {x: upperPoint.x + xOffset, y: upperPoint.y - yOffset};
    return {lowerLeft: lowerLeft, lowerRight: lowerRight, upperRight: upperRight, upperLeft: upperLeft};
  }

  public getSlope(point1:Point,point2:Point) {
    return (point2.y-point1.y)/(point2.x-point1.x);
  }

  public getIntercept(line1Point1:Point,line1Point2:Point,line2Point1:Point,line2Point2:Point) {
    const line1Slope= this.getSlope(line1Point1,line1Point2);
    const line2Slope = this.getSlope(line2Point1,line2Point2);
    const interceptX = (line1Point1.y - line1Slope*line1Point1.x - line2Point1.y + line2Slope*line2Point1.x) / (line2Slope-line1Slope);
    const interceptY = line1Slope * interceptX + (line1Point1.y - line1Slope*line1Point1.x);
    return {x:interceptX,y:interceptY};
  }

  private pointToString(point:Point): string {
    return point.x + "," + point.y + " ";
  }

  public downloadSvg(elementId:string, siteswap:string) {
    var element = document.createElement('a');
    const text: string|undefined = document.getElementById(elementId+"Container")?.innerHTML;
    if (text == undefined) {
      return; //error
    }
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', elementId+siteswap+'.svg');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}
