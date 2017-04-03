import { Directive, Input, forwardRef } from '@angular/core'

import * as THREE from 'three'

export abstract class LightComponent {
    @Input() intensity: number = 1
    @Input() position: number[] = [0, 0, 0]
    @Input() color: string = '#FFFFFF'

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
    // Radius of light
    @Input() distance: number = 150
    // The distance from the light where the intensity is 0
    @Input() decay: number = 1
    private _light: THREE.PointLight

    get light(): THREE.Light {return this._light}

    ngOnInit() {
        this._light = new THREE.PointLight(this.color, this.intensity)
        this._light.distance = this.distance
        this._light.decay = this.decay
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
    private _light: THREE.DirectionalLight

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

@Directive({
    selector: 'three-hemisphere-light',
    providers: [{provide: LightComponent, useExisting: forwardRef(() => HemisphereLightComponent) }]
 })
export class HemisphereLightComponent extends LightComponent {
    @Input() skyColorHex: string = '#FFFFFF'
    @Input() groundColorHex: string = '#FFFFFF'

    private _light: THREE.HemisphereLight;

    get light(): THREE.Light {return this._light}

    ngOnInit() {
        this._light = new THREE.HemisphereLight(this.skyColorHex, this.groundColorHex, this.intensity)
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
