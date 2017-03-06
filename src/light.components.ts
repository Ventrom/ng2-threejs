import { Directive, Input } from '@angular/core';
import * as THREE from 'three';

export abstract class LightComponent {
    @Input() color: string = '#FFFFFF';
    @Input() intensity: number = 1;

    abstract get light(): THREE.Light
}

@Directive({
    selector: 'three-ambient-light',
    providers: [{provide: LightComponent, useExisting: forwardRef(() => AmbientLightComponent) }]
})
export class AmbientLightComponent extends LightComponent {

    private _light: THREE.AmbientLight;

    get light(): THREE.Light {return this._light}

    ngOnInit() {
      this._light = new THREE.AmbientLight(this.color, this.intensity);
    }
}

@Directive({
    selector: 'three-point-light',
    providers: [{provide: LightComponent, useExisting: forwardRef(() => PointLightComponent) }]
 })
export class PointLightComponent extends LightComponent {

  @Input() position: number[] = [0, 250, 0];

  private _light: THREE.PointLight;

  get light(): THREE.Light {return this._light}

  ngOnInit() {
    this._light = new THREE.PointLight(this.color, this.intensity);
    this.setPosition(this.position);
  }

  ngOnChanges(changes) {
    if(changes.position && changes.position.currentValue) {
      this.setPosition(this.position);
    }
  }

  setPosition(position) {
    this._light.position.set(
      position[0],
      position[1],
      position[2]);
  }

}
