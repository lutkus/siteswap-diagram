import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SiteswapService {

  constructor() { }

  public parseSiteswap(siteswapString: string): number[] {
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

  public siteswapToString(siteswapArray: number[]): string {
    let siteswapString = '';
    for (const digit of siteswapArray) {
        siteswapString += this.intToSiteswapDigit(digit);
    }
    return siteswapString;
  }

  public intToSiteswapDigit(digit: number): string {
    if (digit < 10) {
        return String(digit);
    } else {
        return String.fromCharCode(digit - 10 + 'a'.charCodeAt(0));
    }
  } 

  /**
   * 
   * Repeate the siteswap as many times as needed to generate a pattern with the specified number of throws
   * The pattern array returned may or may not be a valid siteswap
   * @param siteswap 
   * @param numThrows 
   */
  public getPattern(siteswap:number[],numThrows:number): number[] {
    let pattern = siteswap;
    while (pattern.length < numThrows) {
        pattern = pattern.concat(siteswap);
    }
    pattern = pattern.slice(0,numThrows);
    return pattern;
  }

  /**
   * For the given pattern, determine on what beat the final catch will take place
   * @param pattern 
   * @returns 
   */
  public getLastLandingBeat(pattern:number[]): number {
    let landings: number[] = [];
    for (let i=0; i<pattern.length; i++) {
        landings.push(i+pattern[i]);
    }
    return Math.max(...landings) + 1;    
  }

  /**
   * Return true if the provided siteswap is valid
   * @param siteswap 
   * @returns 
   */
  public isValid(siteswap: number[]): boolean {
    let catches:number[] = [];
    for (let i=0; i<siteswap.length; i++) {
      catches[i]=0;
    }
    for (let i=0; i<siteswap.length; i++) {
      const landingPosition = (siteswap[i]+i) % siteswap.length;
      catches[landingPosition]++;
    }
    return !catches.includes(0);
  }

  public getNumObjects(siteswap: number[]):number {
    const sum = siteswap.reduce((a, b) => a + b, 0);
    const avg = (sum / siteswap.length) || 0;
    return avg;
  }

}
