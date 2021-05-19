import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConfigService } from './config/config.service';
import { SiteswapService } from './siteswap.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Siteswap Diagram Generator';
  siteswapForm: FormControl = new FormControl('');
  isValid: boolean = false;
  numObjects: number = 0;

  constructor(private configService: ConfigService, 
              private siteswapService: SiteswapService,
  ) { }

  ngOnInit(): void {
    this.updateSiteswapDisplay();
    this.siteswapForm.valueChanges.subscribe((newSiteswap)=>{this.updateSiteswapConfig(newSiteswap)});
    this.configService.getSiteswapValueChanges().subscribe(()=>this.updateSiteswapDisplay());
  }

  private updateSiteswapConfig(newSiteswap: string) {
    const siteswap = this.siteswapService.parseSiteswap(newSiteswap);
    this.configService.setSiteswap(siteswap);
  }

  private updateSiteswapDisplay() {
    this.siteswapForm.setValue(this.configService.getSiteswapString(),{emitEvent:false});
    this.isValid = this.siteswapService.isValid(this.configService.getSiteswap());
    this.numObjects=this.siteswapService.getNumObjects(this.configService.getSiteswap());
  }
}


