import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConfigService } from '../config/config.service';
import { DrawingService } from '../drawing/drawing.service';
import { Quadrilateral } from '../drawing/quadrilateral';
import { EditorService } from '../editor/editor.service';
import { SiteswapService } from '../siteswap.service';

@Component({
  selector: 'app-ladder-diagram',
  templateUrl: './ladder-diagram.component.html',
  styleUrls: ['./ladder-diagram.component.css']
})
export class LadderDiagramComponent implements OnInit {


  configForm = new FormGroup({});

  constructor(
    private configService: ConfigService,
    private drawingService: DrawingService,
    private siteswapService: SiteswapService,
    private editorService: EditorService) { }

  ngOnInit(): void {
    this.configService.configForm.valueChanges.subscribe(() => { this.updateLadderDiagram() });
    this.updateLadderDiagram()
  }

  updateLadderDiagram() {
    const siteswap = this.configService.getSiteswap();
    let ladderContainer: HTMLElement | null = document.getElementById('ladderContainer');
    if (ladderContainer == null) {
      return;
    }
    ladderContainer.innerHTML = '';
    // ladderContainer.addEventListener('keyup',this.onKeyUp, false);

    if (siteswap == null || siteswap.length == 0) {
      return;
    }
    const config = this.configService.getValues();
    const pattern = this.siteswapService.getPattern(siteswap, config.numThrows);
    const lastLandingBeat = config.showFinalCatches ? this.siteswapService.getLastLandingBeat(pattern) : pattern.length;
    const fullThickness = config.lineThickness + config.sepThickness;

    const ladderWidth = 400;
    const throwStartingPoint = 50; //TODO: this isn't working quite how it should
    const throwBuffer = 40;

    const width = config.throwSpacing + lastLandingBeat * config.throwSpacing;
    let ladderSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    ladderSvg.setAttribute("id", "ladder");
    ladderSvg.setAttribute("viewBox", "0 0 " + width + " " + (100 + ladderWidth));
    ladderSvg.setAttribute("style", "background-color:" + config.backgroundColor);

    const centerPoint = (ladderWidth / 2) + throwStartingPoint;
    if (config.showCenterLine) {
      let ladderCenterLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ladderCenterLine.setAttribute("stroke", config.centerLineColor);
      ladderCenterLine.setAttribute("stroke-width", String(config.centerLineThickness));
      ladderCenterLine.setAttribute("x1", String(config.throwSpacing));
      ladderCenterLine.setAttribute("y1", String(centerPoint));
      ladderCenterLine.setAttribute("x2", String(config.throwSpacing + config.throwSpacing * pattern.length + pattern[pattern.length - 1]));
      ladderCenterLine.setAttribute("y2", String(centerPoint));
      ladderSvg.appendChild(ladderCenterLine);
    }

    let corners: Quadrilateral[] = [];
    const maxPossibleHeight = centerPoint - throwStartingPoint - throwBuffer;

    const highestThrow = Math.max(...pattern);
    let heightMultiplier: number = maxPossibleHeight / 9;
    if (highestThrow > 9) {
      heightMultiplier = maxPossibleHeight / highestThrow;
    }

    for (let i = 0; i < pattern.length; i++) {
      let side = (i % 2);
      if (config.invert) {
        side = (i + 1) % 2;
      }
      const crosses = (pattern[i] % 2);

      const startX = config.throwSpacing + (config.throwSpacing * i);
      const startY = throwStartingPoint + (ladderWidth * side);
      const endX = startX + (config.throwSpacing * pattern[i]);
      const peakX = startX + ((config.throwSpacing * pattern[i]) / 2);
      let firstThrow = true;
      for (let j = i - 1; j >= 0; j--) {
        if (pattern[j] == i - j) {
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
          sepLineStartPoint.setAttribute("cx", String(startX));
          sepLineStartPoint.setAttribute("cy", String(startY));
          sepLineStartPoint.setAttribute("r", String(fullThickness / 2));
          sepLineStartPoint.setAttribute("fill", config.sepColor);
          if (config.debug) {
            sepLineStartPoint.setAttribute("stroke-width", "2");
            sepLineStartPoint.setAttribute("stroke", "blue");
            sepLineStartPoint.setAttribute("opacity", "0.5");
          }
          ladderSvg.appendChild(sepLineStartPoint);
        }

        let sepLineEndPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        sepLineEndPoint.setAttribute("cx", String(endX));
        sepLineEndPoint.setAttribute("cy", String(endY));
        sepLineEndPoint.setAttribute("r", String(fullThickness / 2));
        sepLineEndPoint.setAttribute("fill", config.sepColor);
        if (config.debug) {
          sepLineEndPoint.setAttribute("stroke-width", "2"); //debug
          sepLineEndPoint.setAttribute("stroke", "blue"); //debug
          sepLineEndPoint.setAttribute("opacity", "0.5"); //debug       
        }
        ladderSvg.appendChild(sepLineEndPoint);

        let fixCorner = null;
        if (corners[i] != null) {
          if (side == 1) {
            fixCorner = { point1: corners[i].upperLeft, point2: corners[i].lowerLeft, clockwise: true };
          } else {
            fixCorner = { point1: corners[i].upperRight, point2: corners[i].lowerRight, clockwise: false };
          }
        }

        ladderSvg.appendChild(this.drawingService.generateLine(startX, startY, endX, endY, fullThickness, config.sepColor, fixCorner));

        let lineStartPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        lineStartPoint.setAttribute("cx", String(startX));
        lineStartPoint.setAttribute("cy", String(startY));
        lineStartPoint.setAttribute("r", String(config.lineThickness / 2));
        lineStartPoint.setAttribute("fill", config.lineColor);
        this.editorService.addListeners(lineStartPoint, 'line', i);
        ladderSvg.appendChild(lineStartPoint);

        let lineEndPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        lineEndPoint.setAttribute("cx", String(endX));
        lineEndPoint.setAttribute("cy", String(endY));
        lineEndPoint.setAttribute("r", String(config.lineThickness / 2));
        lineEndPoint.setAttribute("fill", config.lineColor);
        this.editorService.addListeners(lineEndPoint, 'line', i);
        ladderSvg.appendChild(lineEndPoint);

        let currentLine = this.drawingService.generateLine(startX, startY, endX, endY, config.lineThickness, config.lineColor, null);
        this.editorService.addListeners(currentLine, 'line', i);
        currentLine.classList.add(String(i));
        ladderSvg.appendChild(currentLine);

        // In order to correctly draw the separator for the line that connects
        // with this one, we need to save this line's info
        const infoToSave = this.drawingService.generateBreadthPoints({ x: startX, y: startY }, { x: endX, y: endY }, fullThickness);
        corners[i + pattern[i]] = infoToSave;

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
        if (config.flatten && (pattern[i] == 2) || pattern[i] == 0) {
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
          sepLineStartPoint.setAttribute("cx", String(startX));
          sepLineStartPoint.setAttribute("cy", String(startY));
          sepLineStartPoint.setAttribute("r", String(fullThickness / 2));
          sepLineStartPoint.setAttribute("fill", config.sepColor);
          if (config.debug) {
            sepLineStartPoint.setAttribute("stroke-width", "2");
            sepLineStartPoint.setAttribute("stroke", "blue");
            sepLineStartPoint.setAttribute("opacity", "0.5");
          }
          ladderSvg.appendChild(sepLineStartPoint);
        }

        let sepLineEndPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        sepLineEndPoint.setAttribute("cx", String(peakX));
        sepLineEndPoint.setAttribute("cy", String(peakY));
        sepLineEndPoint.setAttribute("r", String(fullThickness / 2));
        sepLineEndPoint.setAttribute("fill", config.sepColor);
        if (config.debug) {
          sepLineEndPoint.setAttribute("stroke-width", "2");
          sepLineEndPoint.setAttribute("stroke", "blue");
          sepLineEndPoint.setAttribute("opacity", "0.5");
        }
        ladderSvg.appendChild(sepLineEndPoint);

        let sepLineEndPoint2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        sepLineEndPoint2.setAttribute("cx", String(endX));
        sepLineEndPoint2.setAttribute("cy", String(startY));
        sepLineEndPoint2.setAttribute("r", String(fullThickness / 2));
        sepLineEndPoint2.setAttribute("fill", config.sepColor);
        if (config.debug) {
          sepLineEndPoint2.setAttribute("stroke-width", "2");
          sepLineEndPoint2.setAttribute("stroke", "blue");
          sepLineEndPoint2.setAttribute("opacity", "0.5");
        }
        ladderSvg.appendChild(sepLineEndPoint2);

        let fixCorner = null;
        if (corners[i] != null) {
          if (side == 1) {
            fixCorner = { point1: corners[i].upperLeft, point2: corners[i].lowerLeft, clockwise: true };
          } else {
            fixCorner = { point1: corners[i].upperRight, point2: corners[i].lowerRight, clockwise: false };
          }
        }

        ladderSvg.appendChild(this.drawingService.generateLine(startX, startY, peakX, peakY, fullThickness, config.sepColor, fixCorner));
        ladderSvg.appendChild(this.drawingService.generateLine(peakX, peakY, endX, startY, fullThickness, config.sepColor, null));



        let lineStartPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        lineStartPoint.setAttribute("cx", String(startX));
        lineStartPoint.setAttribute("cy", String(startY));
        lineStartPoint.setAttribute("r", String(config.lineThickness / 2));
        lineStartPoint.setAttribute("fill", config.lineColor);
        this.editorService.addListeners(lineStartPoint, 'line', i);
        ladderSvg.appendChild(lineStartPoint);

        let lineMidPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        lineMidPoint.setAttribute("cx", String(peakX));
        lineMidPoint.setAttribute("cy", String(peakY));
        lineMidPoint.setAttribute("r", String(config.lineThickness / 2));
        lineMidPoint.setAttribute("fill", config.lineColor);
        this.editorService.addListeners(lineMidPoint,'line', i);
        ladderSvg.appendChild(lineMidPoint);

        let lineEndPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        lineEndPoint.setAttribute("cx", String(endX));
        lineEndPoint.setAttribute("cy", String(startY));
        lineEndPoint.setAttribute("r", String(config.lineThickness / 2));
        lineEndPoint.setAttribute("fill", config.lineColor);
        this.editorService.addListeners(lineEndPoint,'line', i);
        ladderSvg.appendChild(lineEndPoint);

        let lineUp = this.drawingService.generateLine(startX, startY, peakX, peakY, config.lineThickness, config.lineColor, null);
        this.editorService.addListeners(lineUp,'line', i);
        ladderSvg.appendChild(lineUp);

        let lineDown = this.drawingService.generateLine(peakX, peakY, endX, startY, config.lineThickness, config.lineColor, null);
        this.editorService.addListeners(lineDown,'line', i);
        ladderSvg.appendChild(lineDown);

        // In order to correctly draw the separator for the line that connects
        // with this one, we need to save this line's info
        const infoToSave = this.drawingService.generateBreadthPoints({ x: peakX, y: peakY }, { x: endX, y: startY }, fullThickness);
        corners[i + pattern[i]] = infoToSave;

        // const points = startX+","+startY+" "+peakX+","+peakY+" "+endX+","+startY;
        // let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        // polyline.setAttribute("stroke","blue");
        // polyline.setAttribute("stroke-width","2");
        // polyline.setAttribute("fill-opacity","0");
        // polyline.setAttribute("points", points);;
        // ladderSvg.appendChild(polyline);
      } 

      if (config.showValueAtThrow) {
        if (!config.onlyStartingThrows || firstThrow) {
            let label = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            label.setAttribute("cx",String(startX));
            label.setAttribute("cy",String(startY));
            label.setAttribute("r",String(config.valueRadius));
            label.setAttribute("stroke",String(config.valueOutlineColor));
            label.setAttribute("stroke-width",config.valueOutlineThickness);
            label.setAttribute("fill",config.valueBackgroundColor)        
            this.editorService.addListeners(label, 'value', i);
            ladderSvg.appendChild(label);
    
            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x",String(startX));
            text.setAttribute("y",String(startY));
            text.setAttribute("font-size",String(config.valueTextSize));
            text.setAttribute("fill",config.valueTextColor);
            text.setAttribute("text-anchor","middle");
            text.setAttribute("alignment-baseline","middle");
            text.textContent = this.siteswapService.intToSiteswapDigit(pattern[i]);
            this.editorService.addListeners(text, 'text', i);
            ladderSvg.appendChild(text);
        }
    }

    if (config.showHandLabels) {
        let handLabels: string[] = [];
        const possibleHands = ['R','L'];
        if (config.numJugglers > 1) {
            possibleHands.forEach((hand)=>{
                for (let juggler=1; juggler<=config.numJugglers; juggler++) {
                    handLabels.push(hand + juggler);
                }
            });
        } else {
            handLabels = possibleHands;
        }
        const handLabelOffset = throwStartingPoint/2;
        const yLabelPos = side?startY+handLabelOffset:startY-handLabelOffset;
        // let label = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        // label.setAttribute("cx",String(startX));
        // label.setAttribute("cy",String(yLabelPos));
        // label.setAttribute("r",String(valueRadius));
        // label.setAttribute("stroke",String(valueOutlineColor));
        // label.setAttribute("stroke-width","2");
        // label.setAttribute("fill",valueBackgroundColor)        
        // addListeners(label, 'value', i);
        // ladderSvg.appendChild(label);

        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x",String(startX));
        text.setAttribute("y",String(yLabelPos));
        text.setAttribute("font-size",String(config.valueTextSize));
        text.setAttribute("fill",config.valueTextColor);
        text.setAttribute("text-anchor","middle");
        text.setAttribute("alignment-baseline","middle");
        text.textContent = String(handLabels[i%handLabels.length]);
        ladderSvg.appendChild(text);            
    }


    } // loop

    ladderSvg.addEventListener('focus',()=>{
      ladderSvg?.addEventListener('keyup',event=>{this.editorService.logKey(event)});
    });
    ladderContainer.appendChild(ladderSvg);
  }

  download() {
    this.drawingService.downloadSvg('ladder',this.configService.getSiteswapString());
  }

  onKeyUp(event: Event): void {
    console.log("keyup: event=",event);
  }
}
