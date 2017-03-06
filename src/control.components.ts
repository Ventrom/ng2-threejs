import { Directive, Input } from '@angular/core';
import * as THREE from 'three';
import 'three/examples/js/controls/TrackballControls.js';
import 'webvr-polyfill';
import 'three/examples/js/controls/VRControls.js';
import 'three/examples/js/effects/VREffect.js';

export abstract class ControlsComponent {
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

  @Input() enabled: boolean = true;

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

@Directive({
    selector: 'three-vr-controls',
    providers: [{provide: ControlsComponent, useExisting: forwardRef(() => VRControlsComponent) }]
 })
export class VRControlsComponent extends ControlsComponent {
  @Input() enabled: boolean = true;

  private _controls: THREE.VRControls;
  private _effect: THREE.VREffect;

  get isVRMode() {return true}
  get controls() {return this._controls}

  setupControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer): void {
    if(this.enabled) {
      this._controls = new THREE.VRControls(camera);
      this._effect = new THREE.VREffect(renderer);
      this.updateRenderSize(renderer.getSize());
    }
  }

  updateControls(scene: THREE.Scene, camera: THREE.Camera): void {
    if(this._controls && this._effect) {
      this._controls.update();
      this._effect.render(scene, camera);
    }
  }

  updateRenderSize(size): void {
    if(this._effect) {
      this._effect.setSize(size.width, size.height);
    }
  }

  requestVR(dom) {
    if(this._effect) {
      this._effect.requestPresent();
    }
  }

  resetVR() {
    if(this._controls) {
      this._controls.resetPose();
    }
  }

}
