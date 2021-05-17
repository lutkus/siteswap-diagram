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


  constructor(private configService: ConfigService) { 
  }

  ngOnInit(): void {
    this.configForm = this.configService.configForm;
  }

}
