import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConfigService } from '../config/config.service';
import { DrawingService } from '../drawing/drawing.service';
import { Fixcorner } from '../drawing/fixcorner';
import { Quadrilateral } from '../drawing/quadrilateral';
import { EditorService } from '../editor/editor.service';
import { SiteswapService } from '../siteswap.service';

@Component({
  selector: 'app-siteswap-diagram',
  templateUrl: './siteswap-diagram.component.html',
  styleUrls: ['./siteswap-diagram.component.css']
})
export class SiteswapDiagramComponent implements OnInit {

  configForm = new FormGroup({});
  hasKeyUpListener = false;

  constructor(
    private configService: ConfigService, 
    private drawingService: DrawingService,
    private siteswapService: SiteswapService,
    private editorService: EditorService)
  { }

  ngOnInit(): void {
    let siteswapOuterContainer: HTMLElement | null = document.getElementById('siteswapOuterContainer');
    if (siteswapOuterContainer != null) {
      siteswapOuterContainer.innerHTML = '';
      let siteswapContainer = document.createElement("div");  
      siteswapContainer.setAttribute("id","siteswapContainer");
      siteswapContainer.setAttribute("tabindex","0");
      siteswapContainer.addEventListener('focus', () => {
        if (!this.hasKeyUpListener) {
          siteswapContainer.addEventListener('keyup', event => { this.editorService.logKey(event) });
          this.hasKeyUpListener = true;
        }
      });
      siteswapOuterContainer.appendChild(siteswapContainer);
    }

    this.configService.configForm.valueChanges.subscribe(()=>{this.updateSiteswapDiagram()});
    this.updateSiteswapDiagram();
  }

  updateSiteswapDiagram() {
    const siteswap = this.configService.getSiteswap();
      let siteswapContainer: HTMLElement|null = document.getElementById('siteswapContainer');
      if (siteswapContainer == null) {
        return;
      }
      siteswapContainer.innerHTML = '';
    if (siteswap == null || siteswap.length == 0) {
      return;
    }
    const config = this.configService.getValues();
    const pattern = this.siteswapService.getPattern(siteswap, config.numThrows);
    const lastLandingBeat = config.showFinalCatches ? this.siteswapService.getLastLandingBeat(pattern) : pattern.length;

    // When drawing the separator line, it is sometimes necessary to know
    // what the last throw of the given object was.
    let catchOrigin = [];
    for (let i=0; i<pattern.length; i++) {
        const currentThrow = pattern[i];
        catchOrigin[i+currentThrow] = currentThrow;
    }

    let height = 1000;
    if (config.unidirectional) {
        height = 600;
    }

    const width = config.throwSpacing + lastLandingBeat * config.throwSpacing;
    let siteswapSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    siteswapSvg.setAttribute("id","siteswap");
    siteswapSvg.setAttribute("viewBox", "0 0 "+width+" "+height);
    siteswapSvg.setAttribute("style","background-color:"+config.backgroundColor);

    if (config.showCenterLine) {
        let lineCenter = document.createElementNS("http://www.w3.org/2000/svg", "line"); 
        lineCenter.setAttribute("stroke",config.centerLineColor);
        lineCenter.setAttribute("stroke-width",String(config.centerLineThickness));
        lineCenter.setAttribute("x1",String(config.throwSpacing));
        lineCenter.setAttribute("y1",String(500));
        lineCenter.setAttribute("x2",String(config.throwSpacing + config.throwSpacing * pattern.length + pattern[pattern.length-1]));
        lineCenter.setAttribute("y2",String(500));
        siteswapSvg.appendChild(lineCenter);
    }

    const fullThickness = config.lineThickness + config.sepThickness;
    let corners: Quadrilateral[] = [];

    const highestThrow = Math.max(...pattern);
    let heightMultiplier = 100;
    if (highestThrow > 9) {
        heightMultiplier = (9 / highestThrow) * 100;
    }

    for (let i=0; i<pattern.length; i++) {
      let direction = -1;
      if (!config.unidirectional) {
          if (i % 2) {
              direction = 1
          } else {
              direction = -1;
          }
      }
      let catchSide = 1;
      if (config.catching) {
          if (pattern[i] % 2) {
              catchSide = 1;
          } else {
              catchSide = -1;
          }
      }
      if (config.invert) {
          direction = direction * (-1);
      }

      let firstThrow = true;
          for (let j=i-1; j>=0; j--) {
              if (pattern[j] == i-j) {
                  firstThrow = false;
              }
      }

      const centerPoint = 500;
      const startX = config.throwSpacing + (config.throwSpacing* i);
      const startY = centerPoint;
      const endX = startX + (config.throwSpacing * pattern[i]);
      const endY = centerPoint;
      const peakX = startX + ((config.throwSpacing * pattern[i]) / 2);
      let peakY = centerPoint + catchSide*direction*(heightMultiplier * pattern[i] / 2);
  
      if (config.flatten && pattern[i] <= 1) {
          peakY = centerPoint;
      }

      // ---- Draw separator line ----
      if (firstThrow) {
        let sepLineStartPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        sepLineStartPoint.setAttribute("cx",String(startX));
        sepLineStartPoint.setAttribute("cy",String(startY));
        sepLineStartPoint.setAttribute("r",String(fullThickness/2));
        sepLineStartPoint.setAttribute("fill",config.sepColor);
        if (config.debug) {
          sepLineStartPoint.setAttribute("stroke-width","2"); 
          sepLineStartPoint.setAttribute("stroke","blue");
          sepLineStartPoint.setAttribute("opacity","0.5"); 
        }
        siteswapSvg.appendChild(sepLineStartPoint); 
      }

      let sepLineEndPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      sepLineEndPoint.setAttribute("cx",String(peakX));
      sepLineEndPoint.setAttribute("cy",String(peakY));
      sepLineEndPoint.setAttribute("r",String(fullThickness/2));
      sepLineEndPoint.setAttribute("fill",config.sepColor); 
      if (config.debug) {
        sepLineEndPoint.setAttribute("stroke-width","2"); 
        sepLineEndPoint.setAttribute("stroke","blue"); 
        sepLineEndPoint.setAttribute("opacity","0.5"); 
      }
      siteswapSvg.appendChild(sepLineEndPoint);

      let sepLineEndPoint2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      sepLineEndPoint2.setAttribute("cx",String(endX));
      sepLineEndPoint2.setAttribute("cy",String(endY));
      sepLineEndPoint2.setAttribute("r",String(fullThickness/2));
      sepLineEndPoint2.setAttribute("fill",config.sepColor);    
      if (config.debug) {
        sepLineEndPoint2.setAttribute("stroke-width","2");
        sepLineEndPoint2.setAttribute("stroke","blue");
        sepLineEndPoint2.setAttribute("opacity","0.5");
      }
      siteswapSvg.appendChild(sepLineEndPoint2);

      let fixCorner:Fixcorner = null;
      if ((catchOrigin[i] % 2 == 0 || config.unidirectional) && corners[i] != null){
          if (direction == -1) {
              fixCorner = {point1: corners[i].upperLeft, point2: corners[i].lowerLeft, clockwise: true};
          } else {
              fixCorner = {point1: corners[i].upperRight, point2: corners[i].lowerRight, clockwise: false};
          }
      }

      siteswapSvg.appendChild(this.drawingService.generateLine(startX,startY,peakX,peakY,fullThickness,config.sepColor,fixCorner));
      siteswapSvg.appendChild(this.drawingService.generateLine(peakX,peakY,endX,endY,fullThickness,config.sepColor,null));

      // ---- Draw siteswap line ----
      let lineStartPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      lineStartPoint.setAttribute("cx",String(startX));
      lineStartPoint.setAttribute("cy",String(startY));
      lineStartPoint.setAttribute("r",String(config.lineThickness/2));
      lineStartPoint.setAttribute("fill",config.lineColor);        
      this.editorService.addListeners(lineStartPoint, 'line', i);
      siteswapSvg.appendChild(lineStartPoint);

      let lineEndPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      lineEndPoint.setAttribute("cx",String(peakX));
      lineEndPoint.setAttribute("cy",String(peakY));
      lineEndPoint.setAttribute("r",String(config.lineThickness/2));
      lineEndPoint.setAttribute("fill",config.lineColor);        
      this.editorService.addListeners(lineEndPoint,'line', i);
      siteswapSvg.appendChild(lineEndPoint);

      let upLine = this.drawingService.generateLine(startX,startY,peakX,peakY,config.lineThickness,config.lineColor,null);
      this.editorService.addListeners(upLine, 'line', i);
      siteswapSvg.appendChild(upLine);

      let lineEndPoint2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      lineEndPoint2.setAttribute("cx",String(endX));
      lineEndPoint2.setAttribute("cy",String(endY));
      lineEndPoint2.setAttribute("r",String(config.lineThickness/2));
      lineEndPoint2.setAttribute("fill",config.lineColor);        
      this.editorService.addListeners(lineEndPoint2,'line', i);
      siteswapSvg.appendChild(lineEndPoint2);

      let downLine = this.drawingService.generateLine(peakX,peakY,endX,endY,config.lineThickness,config.lineColor,null);
      this.editorService.addListeners(downLine,'line', i);
      siteswapSvg.appendChild(downLine);

      //JEFF test stuff
      /*
      let controlPointY = centerPoint + catchSide*direction*(100* (pattern[i] / 2));
      if (flatten && pattern[i] <= 1) {
          controlPointY = centerPoint;
      }

      const breadthUp = generateBreadthPoints({x:peakX,y:controlPointY}, {x:startX,y:startY}, lineWidth);
      const breadthDown = generateBreadthPoints({x:peakX,y:controlPointY},{x:endX,y:endY},lineWidth);
      const upperControl = {x:peakX,y:(peakY)-(lineWidth/2)};
      const lowerControl = {x:peakX,y:(peakY)+(lineWidth/2)};
      // const d = "M"+pointToString(breadthUp.lowerRight) + "M"+pointToString(breadthUp.lowerLeft) +
      // "Q"+pointToString(upperControl) +
      // pointToString(breadthDown.lowerLeft) + "M"+pointToString(breadthDown.lowerRight) +
      // "Q"+pointToString(lowerControl) + pointToString(breadthUp.lowerRight) + "z";  
      const d = "M"+pointToString(breadthUp.lowerRight) +
          "M"+pointToString(breadthUp.lowerLeft) +
          "Q"+pointToString({x:breadthUp.lowerRight.x,y:upperControl.y}) +
          pointToString(upperControl) +
          "M"+pointToString(lowerControl) +
          "Q"+pointToString({x:breadthUp.lowerLeft.x,y:lowerControl.y}) +
          pointToString(breadthUp.lowerRight) + "z";
      let path= document.createElementNS("http://www.w3.org/2000/svg", "path"); 
      path.setAttribute("d",d);
      path.setAttribute("fill","green");        
      path.setAttribute("stroke-width","2");        
      path.setAttribute("stroke","red");        
      siteswapSvg.appendChild(path);
      */

      // In order to correctly draw the separator for the line that connects
      // with this one, we need to save this line's info
      const infoToSave = this.drawingService.generateBreadthPoints({x:peakX, y:peakY}, {x:endX, y:endY}, fullThickness); 
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

      if (config.showValueAtPeak) {
          let label = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          label.setAttribute("cx",String(peakX));
          label.setAttribute("cy",String(peakY));
          label.setAttribute("r",String(config.valueRadius));
          label.setAttribute("stroke",config.valueOutlineColor);
          label.setAttribute("stroke-width",config.valueOutlineThickness);
          label.setAttribute("fill",config.valueBackgroundColor);        
          this.editorService.addListeners(label, 'value', i);
          siteswapSvg.appendChild(label);
  
          let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
          text.setAttribute("x",String(peakX));
          text.setAttribute("y",String(peakY));
          text.setAttribute("font-size",String(config.valueTextSize));
          text.setAttribute("fill",config.valueTextColor);
          text.setAttribute("text-anchor","middle");
          text.setAttribute("alignment-baseline","middle");
          text.textContent = this.siteswapService.intToSiteswapDigit(pattern[i]);
          this.editorService.addListeners(text, 'text', i);
          siteswapSvg.appendChild(text);
      }
  

      if (config.showValueAtThrow) {
          if (!config.onlyStartingThrows || firstThrow) {
              let label = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              label.setAttribute("cx",String(startX));
              label.setAttribute("cy",String(startY));
              label.setAttribute("r",String(config.valueRadius));
              label.setAttribute("stroke",config.valueOutlineColor);
              label.setAttribute("stroke-width",config.valueOutlineThickness);
              label.setAttribute("fill",config.valueBackgroundColor);
              this.editorService.addListeners(label, 'value', i);
              siteswapSvg.appendChild(label);
      
              let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
              text.setAttribute("x",String(startX));
              text.setAttribute("y",String(startY));
              text.setAttribute("text-anchor","middle");
              text.setAttribute("alignment-baseline","middle");
              text.setAttribute("font-size",String(config.valueTextSize));
              text.setAttribute("fill",config.valueTextColor);
              text.textContent = this.siteswapService.intToSiteswapDigit(pattern[i]);
              this.editorService.addListeners(text, 'text', i);
              siteswapSvg.appendChild(text);
          }
      }    

      
    } // loop

    // siteswapContainer.addEventListener('focus',()=>{
    //   siteswapContainer?.addEventListener('keyup',event=>{this.editorService.logKey(event)});
    // });
    siteswapContainer.appendChild(siteswapSvg);
  }

  download() {
    this.drawingService.downloadSvg('siteswap',this.configService.getSiteswapString());
  }
}
