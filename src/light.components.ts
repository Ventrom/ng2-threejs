import { Directive, Input, forwardRef } from '@angular/core'

import * as THREE from 'three'

export abstract class LightComponent {
    @Input() color: string = '#FFFFFF'
    @Input() intensity: number = 1

    abstract get light(): THREE.Light
}

@Directive({
    selector: 'three-ambient-light',
    providers: [{provide: LightComponent, useExisting: forwardRef(() => AmbientLightComponent) }]
})
export class AmbientLightComponent extends LightComponent {
    private _light: THREE.AmbientLight

    get light(): THREE.Light {return this._light}

    ngOnInit() {
        this._light = new THREE.AmbientLight(this.color, this.intensity)
    }
}

@Directive({
    selector: 'three-point-light',
    providers: [{provide: LightComponent, useExisting: forwardRef(() => PointLightComponent) }]
 })
export class PointLightComponent extends LightComponent {
    @Input() position: number[] = [100, 100, 20]

    private _light: THREE.PointLight

    get light(): THREE.Light {return this._light}

    ngOnInit() {
        this._light = new THREE.PointLight(this.color, this.intensity)
        this.updatePosition(this.position)
    }

    ngOnChanges(changes) {
        if(changes && changes.position && changes.position.currentValue) {
            this.updatePosition(this.position)
        }
    }

    updatePosition(position) {
        if (!this._light) return
        this._light.position.set(
            position[0],
            position[1],
            position[2])
    }
}

@Directive({
    selector: 'three-directional-light',
    providers: [{provide: LightComponent, useExisting: forwardRef(() => DirectionalLightComponent) }]
 })
export class DirectionalLightComponent extends LightComponent {
    @Input() position: number[] = [0, 1, 0];

    private _light: THREE.DirectionalLight;

    get light(): THREE.Light {return this._light}

    ngOnInit() {
        this._light = new THREE.DirectionalLight(this.color, this.intensity)
        this.updatePosition(this.position)
    }

    ngOnChanges(changes) {
        if(changes && changes.position && changes.position.currentValue) {
            this.updatePosition(this.position)
        }
    }

    updatePosition(position) {
        if (!this._light) return
        this._light.position.set(
            position[0],
            position[1],
            position[2])
    }
}
