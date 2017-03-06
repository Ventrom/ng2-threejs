import { Directive, Input } from '@angular/core';
import * as THREE from 'three';

export abstract class CameraComponent {
    @Input() lookAt = [0, 0, 0]
    abstract get camera(): THREE.Camera
    updateRenderSize(size): void {}
    ngAfterViewInit() {
        this.camera.lookAt(this.lookAt)
    }
}

@Directive({
    selector: 'three-perspective-camera',
    providers: [{provide: CameraComponent, useExisting: forwardRef(() => PerspectiveCameraComponent) }]
})
export class PerspectiveCameraComponent extends CameraComponent {

  @Input() position = [0, -10, 10];
  @Input() viewAngle: number = 75;
  near: number = 0.1;
  far: number = 10000;
  private _camera: THREE.PerspectiveCamera;

  get camera(): THREE.Camera {
      return this._camera
  }

  get aspect(): number {
    return this._camera ? this._camera.aspect : 4/3;
  }

  ngOnInit() {
    this._camera = new THREE.PerspectiveCamera(
      this.viewAngle,
      this.aspect,
      this.near,
      this.far);

    this._camera.position.set(...this.position);
  }

  updateRenderSize(size): void {
      this.updateAspect(size.width / size.height);
  }

  updateAspect(ratio) {
    if(this._camera) {
      this._camera.aspect = ratio;
      this._camera.updateProjectionMatrix();
    }
  }

}
