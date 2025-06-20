import { Component } from '@angular/core';
import { ChooseNameComponent } from '../../components/choose-name/choose-name.component';

@Component({
  selector: 'app-home-page',
  imports: [ChooseNameComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

}
