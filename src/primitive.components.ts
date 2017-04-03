import { Directive, Input, forwardRef } from '@angular/core'
import { AnimationConfig } from './interfaces/animation.interface'

import * as THREE from 'three'

export abstract class PrimitiveComponent {
    @Input() textureUrl?: string
    @Input() wSegments: number = 256
    @Input() hSegments: number = 256
    @Input() position: THREE.Vector3 = new THREE.Vector3()
    @Input() animConfig: AnimationConfig

    abstract get object(): THREE.Mesh
}

@Directive({
    selector: 'three-sphere',
    providers: [{provide: PrimitiveComponent, useExisting: forwardRef(() => SphereComponent) }]
})
export class SphereComponent extends PrimitiveComponent {
    @Input() sphereSize: number = 20

    private _object: THREE.Mesh

    get object(): THREE.Mesh {return this._object}

    set object(obj: THREE.Mesh) {this._object = obj}

    ngOnInit() {
        let loader = new THREE.TextureLoader()
        let texture = loader.load( this.textureUrl )

        let material: THREE.Material
        if (this.textureUrl) {
            material = new THREE.MeshLambertMaterial( { map: texture } )
        } else {
            material = new THREE.MeshNormalMaterial()
        }

        // Creating a sphere and giving the geometry a name
        let geometry = new THREE.SphereGeometry(this.sphereSize, this.wSegments, this.hSegments)
        geometry.name = 'Sphere'
        let sphere = new THREE.Mesh(geometry, material)
        sphere.position.set(this.position[0], this.position[1], this.position[2])

        this.object = sphere
    }
}


@Directive({
    selector: 'three-plane',
    providers: [{provide: PrimitiveComponent, useExisting: forwardRef(() => PlaneComponent) }]
})
export class PlaneComponent extends PrimitiveComponent {
    @Input() width: number = 1000
    @Input() height: number = 1000

    private _object: THREE.Mesh

    get object(): THREE.Mesh {return this._object}

    set object(obj: THREE.Mesh) {this._object = obj}

    ngOnInit() {
        let loader = new THREE.TextureLoader()
        let texture = loader.load( this.textureUrl )
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set( 2, 2 )

        let material: THREE.Material
        if (this.textureUrl) {
            material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } )
        } else {
            material = new THREE.MeshNormalMaterial()
        }

        // Create a plane and giving the geometry a name
        let geometry = new THREE.PlaneGeometry(this.width, this.height, this.wSegments, this.hSegments)
        geometry.name = 'Plane'
        let plane = new THREE.Mesh(geometry, material)
        plane.position.y = -0.5
        //floor.rotation.x = Math.PI / 2

        this.object = plane
    }
}
