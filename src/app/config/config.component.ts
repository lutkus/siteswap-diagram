import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ConfigService } from './config.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent implements OnInit {
  configForm: FormGroup = new FormGroup({});


  constructor(
    private configService: ConfigService){
  }

  ngOnInit(): void {
    this.configForm = this.configService.configForm;
  }

  public downloadConfig() {
    var element = document.createElement('a');
    const text:string = JSON.stringify(this.configService.getValues());
    if (text == undefined) {
      return; //error
    }
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', 'siteswap-config.json');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  onFileSelected(event: any):void {
    // TODO: error checking
    const file = event.target?.files[0];
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let fileContent = fileReader.result?.toString();
      if (fileContent != null) {
        const jsonContent = JSON.parse(fileContent);
        Object.keys(jsonContent).forEach(key=>{
          // console.log("key=",key," value=",jsonContent[key])
          this.configService.configForm.get(key)?.setValue(jsonContent[key]);
        })
      }
    }
    fileReader.readAsText(file);
  }

}
