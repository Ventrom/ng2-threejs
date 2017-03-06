import { Directive, Input, forwardRef } from '@angular/core';
import * as THREE from 'three';
import 'three/examples/js/controls/TrackballControls.js';

export abstract class ControlsComponent {
    @Input() enabled: boolean = true;
    get isVRMode(): boolean {return false}
    abstract get controls()
    abstract setupControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer): void
    abstract updateControls(scene: THREE.Scene, camera: THREE.Camera): void
    updateRenderSize(size): void {}
}

@Directive({
    selector: 'trackball-controls',
    providers: [{provide: ControlsComponent, useExisting: forwardRef(() => TrackballControlsComponent) }]
})
export class TrackballControlsComponent extends ControlsComponent {

  private _controls: THREE.TrackballControls;

  get controls() {return this._controls}

  setupControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer): void {
    this._controls = new THREE.TrackballControls(camera, renderer.domElement);
    this._controls.enabled = this.enabled;
    this._controls.rotateSpeed = 10.0;
    this._controls.zoomSpeed = 0.1;
    this._controls.panSpeed = 0.8;

    this._controls.noZoom = false;
    this._controls.noPan = false;

    this._controls.staticMoving = true;
    this._controls.dynamicDampingFactor = 0.3;
  }

  updateControls(scene: THREE.Scene, camera: THREE.Camera): void {
    this._controls.update();
  }

}

