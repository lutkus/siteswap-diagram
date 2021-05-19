import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { SiteswapService } from '../siteswap.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  currentSelection: number = -1;

  constructor(private configService: ConfigService,
    private siteswapService: SiteswapService) { }

  public addListeners(element: SVGElement, prefix: string, throwIndex: number) {
    element.addEventListener('mouseover', () => { this.mouseOverEffect(throwIndex) }, false);
    element.addEventListener('mouseout', () => { this.mouseOutEffect(throwIndex) }, false);
    element.addEventListener('click', () => { this.click(throwIndex, false) }, false);
    element.classList.add(prefix + String(throwIndex));
  }

  public mouseOverEffect(value: number) {
    if (this.currentSelection == value % this.configService.getSiteswap().length || value == -1) {
      return;
    }

    let position = value % this.configService.getSiteswap().length;
    while (position < this.configService.getValues().numThrows) {
      ['line', 'value'].forEach((prefix) => {
        let elements = document.getElementsByClassName(prefix + String(position));
        Array.from(elements).forEach((el) => {
          el.setAttribute("fill", "lightblue");
        });
      });
      position += this.configService.getSiteswap().length;
    }
  }

  mouseOutEffect(value: number) {
    if (this.currentSelection == value % this.configService.getSiteswap().length || value == -1) {
      return;
    }

    let position = value % this.configService.getSiteswap().length;
    while (position < this.configService.getValues().numThrows) {
      let lines = document.getElementsByClassName('line' + String(position));
      Array.from(lines).forEach((el) => {
        el.setAttribute("fill", this.configService.getValues().lineColor);
      });
      let values = document.getElementsByClassName('value' + String(position));
      Array.from(values).forEach((el) => {
        el.setAttribute("fill", this.configService.getValues().valueBackgroundColor);
      });
      position += this.configService.getSiteswap().length;
    }
  }

  click(value: number, refreshSelection: boolean) {
    const oldSelection = this.currentSelection;
    if (value == -1) {
      this.currentSelection = -1;
    } else {
      if ((this.currentSelection == value % this.configService.getSiteswap().length) && !refreshSelection) {
        this.currentSelection = -1;
      } else {
        this.currentSelection = value % this.configService.getSiteswap().length;
        if (oldSelection != -1) {
          let siteswap: number[] = this.configService.getSiteswap();
          const distance = Math.abs(this.currentSelection - oldSelection);
          const newMax = siteswap[Math.max(this.currentSelection, oldSelection)] + distance;
          const newMin = siteswap[Math.min(this.currentSelection, oldSelection)] - distance;
          if (newMax <= 36 && newMin >= 0) {
            siteswap[Math.max(this.currentSelection, oldSelection)] = newMin;
            siteswap[Math.min(this.currentSelection, oldSelection)] = newMax;
            this.currentSelection = -1;
            this.mouseOutEffect(oldSelection);
            this.configService.setSiteswap(siteswap);
          }
        }
      }
    }
    this.mouseOutEffect(oldSelection);

    if (this.currentSelection == -1) {
      return;
    }
    let position = this.currentSelection;
    while (position < this.configService.getValues().numThrows) {
      ['line', 'value'].forEach((prefix) => {
        let elements = document.getElementsByClassName(prefix + String(position));
        Array.from(elements).forEach((el) => {
          el.setAttribute("fill", "blue");
        });
      });
      position += this.configService.getSiteswap().length;
    }
  }

  public logKey(e: { key: string; }) {
    let siteswap: number[] = this.configService.getSiteswap();
    // console.log("e.key=",e.key);
    if (this.currentSelection == -1) {
      switch (e.key) {
        case '+':
        case 'ArrowUp':
          if (Math.max(...siteswap) < 35) {
            siteswap = siteswap.map(x => x + 1);
          }
          break;
        case '-':
        case 'ArrowDown':
          if (Math.min(...siteswap) > 0) {
            siteswap = siteswap.map(x => x - 1);
          }
          break;
        case 'ArrowLeft':
          const firstElement = siteswap.shift();
          if (firstElement) {
            siteswap.push(firstElement);
          }
          this.configService.setSiteswap(siteswap);
          break;
        case 'ArrowRight':
          const lastElement = siteswap.pop();
          if (lastElement) {
            siteswap.unshift(lastElement);
          }
          this.configService.setSiteswap(siteswap);
          break;
        default:
          return;
      }
    } else {
      let newVal;
      switch (e.key) {
        case '+':
        case 'ArrowUp':
          newVal = siteswap[this.currentSelection] + siteswap.length;
          if (newVal <= 36) {
            siteswap[this.currentSelection] = newVal;
          }
          break;
        case '-':
        case 'ArrowDown':
          newVal = siteswap[this.currentSelection] - siteswap.length;
          if (newVal >= 0) {
            siteswap[this.currentSelection] = newVal;
          }
          break;
        default:
          let newValue = -1;
          if ('0' <= e.key && '9' >= e.key) {
            newValue = parseInt(e.key);
          } else if ('a' <= e.key && 'z' >= e.key) {
            console.log("key is ", e.key);
            newValue = e.key.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
          } else {
            return;
          }
          // First try subbing in the new value to the siteswap, and check if the result is valid...
          let tempSiteswap = [...siteswap];
          tempSiteswap[this.currentSelection] = newValue;
          if (this.siteswapService.isValid(tempSiteswap)) {
            siteswap = tempSiteswap;
          } else {

            // Subbing in the value gave an invalid siteswap. Do some siteswap math to try to make thing work.
            let origins: number[] = [];
            for (var k = 0; k < siteswap.length; k++) {
              const landing = k + siteswap[k];
              origins[landing % siteswap.length] = k;
            }
            const currentDestination = (newValue + this.currentSelection) % siteswap.length;
            const currentOriginOfNewDestination = origins[currentDestination];
            const currentSs = siteswap[this.currentSelection];
            const newCompensatingValue = Math.min(this.currentSelection, currentOriginOfNewDestination) == this.currentSelection ? currentSs - Math.abs(currentOriginOfNewDestination - this.currentSelection) : currentSs + Math.abs(currentOriginOfNewDestination - this.currentSelection);
            if (newCompensatingValue < 0 || newValue < 0) {
              // Something went wrong in calculating. Perhaps we can try something different, but for now, just do nothing.

            } else {
              siteswap[this.currentSelection] = newValue;
              siteswap[currentOriginOfNewDestination] = newCompensatingValue;
            }
          }
          this.currentSelection = -1;
          break;
      }
    }
    this.configService.setSiteswap(siteswap);
  }


}
