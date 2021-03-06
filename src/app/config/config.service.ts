import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SiteswapService } from '../siteswap.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public configForm: FormGroup;

  constructor(private siteswapService: SiteswapService) { 
    this.configForm  = new FormGroup({
      siteswap: new FormControl([7,7,7,8,6]),
      numThrows: new FormControl(30),
      throwSpacing: new FormControl(100),
      showFinalCatches: new FormControl(false),
      lineThickness: new FormControl(25),
      lineColor: new FormControl('black'),
      sepThickness: new FormControl(10),
      sepColor: new FormControl('white'),
      backgroundColor: new FormControl('white'),
      showCenterLine: new FormControl(false),
      centerLineThickness: new FormControl(5),
      centerLineColor: new FormControl('red'),
      showValueAtThrow: new FormControl(true),
      onlyStartingThrows: new FormControl(false),
      showValueAtPeak: new FormControl(false),
      valueRadius: new FormControl(20),
      valueBackgroundColor: new FormControl('white'),
      valueOutlineColor: new FormControl('black'),
      valueOutlineThickness: new FormControl(2),
      valueTextColor: new FormControl('black'),
      valueTextSize: new FormControl(25),
      showHandLabels: new FormControl(false),
      numJugglers: new FormControl(2),
      invert: new FormControl(false),
      unidirectional: new FormControl(false),
      flatten: new FormControl(false),
      catching: new FormControl(false),
      debug: new FormControl(false),
      version: new FormControl("1.0"),
    });

    this.enableDisable();
    this.configForm.valueChanges.subscribe(()=>{this.enableDisable()});
    // this.configForm.get('siteswap')?.valueChanges.subscribe((newSS)=>{this.updateSiteswap(newSS)});
  }

    /**
   * Enable or disable fields based on the values of other fields
   */
     private enableDisable(): void {
      if (this.configForm.get('showValueAtThrow')?.value == false && this.configForm.get('showValueAtPeak')?.value == false) {
        this.configForm.get('valueRadius')?.disable({emitEvent:false});
        this.configForm.get('valueBackgroundColor')?.disable({emitEvent:false});
        this.configForm.get('valueOutlineColor')?.disable({emitEvent:false});
        this.configForm.get('valueOutlineThickness')?.disable({emitEvent:false});
        this.configForm.get('valueTextColor')?.disable({emitEvent:false});
        this.configForm.get('valueTextSize')?.disable({emitEvent:false});
      } else {
        this.configForm.get('valueRadius')?.enable({emitEvent:false});
        this.configForm.get('valueBackgroundColor')?.enable({emitEvent:false});
        this.configForm.get('valueOutlineColor')?.enable({emitEvent:false});
        this.configForm.get('valueOutlineThickness')?.enable({emitEvent:false});
        this.configForm.get('valueTextColor')?.enable({emitEvent:false});
        this.configForm.get('valueTextSize')?.enable({emitEvent:false});      
      }
  
      if (this.configForm.get('showValueAtThrow')?.value == false) {
        this.configForm.get('onlyStartingThrows')?.disable({emitEvent:false});
      } else {
        this.configForm.get('onlyStartingThrows')?.enable({emitEvent:false});
      }
  
      if (this.configForm.get('showCenterLine')?.value == false) {
        this.configForm.get('centerLineThickness')?.disable({emitEvent:false}); 
        this.configForm.get('centerLineColor')?.disable({emitEvent:false}); 
      } else {
        this.configForm.get('centerLineThickness')?.enable({emitEvent:false}); 
        this.configForm.get('centerLineColor')?.enable({emitEvent:false}); 
      }
  
      if (this.configForm.get('showHandLabels')?.value == false) {
        this.configForm.get('numJugglers')?.disable({emitEvent:false}); 
      } else {
        this.configForm.get('numJugglers')?.enable({emitEvent:false}); 
      }
  
      if (this.configForm.get('unidirectional')?.value == true) {
        this.configForm.get('invert')?.setValue(false,{emitEvent:false});
        this.configForm.get('invert')?.disable({emitEvent:false}); 
      } else {
        this.configForm.get('invert')?.enable({emitEvent:false}); 
      }
    }

    public getSiteswap(): number[] {
      return this.configForm.get('siteswap')?.value;
    }

    public getSiteswapString(): string {
      return this.siteswapService.siteswapToString(this.configForm.get('siteswap')?.value);
    }

    public setSiteswap(newSiteswap: number[]) {
      this.configForm.get('siteswap')?.setValue(newSiteswap);
    }

    public getSiteswapValueChanges() {
      return (this.configForm.get('siteswap') as FormControl)?.valueChanges;
    }

    public getValues() {
      return this.configForm.getRawValue();
    }
}
