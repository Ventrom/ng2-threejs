import { Directive, Input, forwardRef } from '@angular/core'
import { AnimationConfig } from './interfaces/animation.interface'

import * as THREE from 'three'

export abstract class CameraComponent {
    @Input() lookAt = [0, 0, 0]
    abstract get camera(): THREE.Camera
    updateRenderSize(size): void {}
    ngAfterViewInit() {
        this.camera.lookAt(new THREE.Vector3(this.lookAt[0], this.lookAt[1], this.lookAt[2]))
    }
}

@Directive({
    selector: 'three-perspective-camera',
    providers: [{provide: CameraComponent, useExisting: forwardRef(() => PerspectiveCameraComponent) }]
})
export class PerspectiveCameraComponent extends CameraComponent {
    @Input() position: number[] = [0, -10, 10]
    @Input() fov: number = 50
    @Input() up: number[] = [0, 0, 1]
    near: number = 0.1
    far: number = 10000
    animConfig: AnimationConfig
    private _camera: THREE.PerspectiveCamera;

    get camera(): THREE.Camera {
        return this._camera
    }

    get aspect(): number {
        return this._camera ? this._camera.aspect : 4/3
    }

    ngOnInit() {
        this._camera = new THREE.PerspectiveCamera(
            this.fov,
            this.aspect,
            this.near,
            this.far)

        this._camera.position.set(this.position[0], this.position[1], this.position[2])
        this._camera.up.set(this.up[0], this.up[1], this.up[2])
    }

    updateRenderSize(size): void {
        this.updateAspect(size.width / size.height)
    }

    updateAspect(ratio) {
        if(this._camera) {
            this._camera.aspect = ratio;
            this._camera.updateProjectionMatrix()
        }
    }
}
