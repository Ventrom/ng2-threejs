import { ContentChildren, Directive, Input, forwardRef, QueryList } from '@angular/core'
import { BoundingBoxService } from './services/bounding-box.service'
import { SpriteService } from './services/sprite.service'
import { dirname, basename } from 'path'

import * as THREE from 'three'
import 'three/examples/js/loaders/MTLLoader.js';
import 'three/examples/js/loaders/OBJLoader.js';
import 'three/examples/js/loaders/ColladaLoader.js';
import 'three/examples/js/loaders/collada/Animation.js';
import 'three/examples/js/loaders/collada/KeyFrameAnimation.js';
import 'three/examples/js/loaders/collada/AnimationHandler.js';
import 'three/examples/js/loaders/FBXLoader2.js';
import 'three/examples/js/loaders/GLTFLoader.js';
import './loaders/terrain-loader.js'

export abstract class ObjectComponent {
    @Input() file: string
    @Input() debug: boolean
    manager: THREE.LoadingManager
    // The base loader class called THREE.Loader does not have setPath and Load,
    // so for now set the loader type as any here
    loader: any
    abstract attachScene(scene: THREE.Scene): void
}

@Directive({selector: 'three-mtl'})
export class MtlComponent {
    @Input() file = null
}

@Directive({
    selector: 'three-obj',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => ObjComponent) }]
})
export class ObjComponent extends ObjectComponent {
    @ContentChildren(MtlComponent) mtlComps: QueryList<MtlComponent>
    @Input() addBBox: boolean = false
    @Input() addSprites: boolean = false
    @Input() scale: number = 1
    bbox: THREE.Box3
    bboxMesh: THREE.Mesh
    materials: THREE.Material[] = []
    objects: THREE.Object3D[] = []
    sprites: THREE.Sprite[] = []
    // Can't use the dynamic THREE['OBJLoader'] type here
    objLoader: any

    constructor(
        public bboxService: BoundingBoxService,
        public spriteService: SpriteService
    ) {
        super()
        this.manager = new THREE.LoadingManager()
        this.loader = new THREE['MTLLoader'](this.manager)
        this.objLoader = new THREE['OBJLoader']()
    }

    ngAfterViewInit() {
        let self = this
        if (this.mtlComps) {
            this.mtlComps.forEach((mtl) => {
                if (mtl.file === null) return
                this.loader.setPath(dirname(mtl.file) + '/')
                this.loader.load(basename(mtl.file), function ( materials ) {
                    materials.preload()
                    self.materials = materials
                })
            })
        }

        this.manager.onProgress = (item, loaded, total) => {
            if (self.debug) {
                console.log('Item being loaded:')
                console.log(item)
                console.log('Loaded:')
                console.log(loaded)
                console.log('Total:')
                console.log(total)
            }
        }
    }

    attachScene(scene: THREE.Scene): void {
        let self = this
        if (this.file === null) return
        self.manager.onLoad = () => {
            self.objLoader.setMaterials(self.materials)
            self.objLoader.setPath(dirname(self.file) + '/')
            self.objLoader.load(basename(self.file), function (object) {
                // After the object has been loaded make a cube around it so we can write information
                object.scale.set(self.scale, self.scale, self.scale)
                self.objects.push(object)
                if (self.addBBox) {
                    self.bboxMesh = self.bboxService.addBBoxToObject(object)
                    self.objects.push(self.bboxMesh)

                    if (self.addSprites) {
                        self.sprites = self.spriteService.addSpritesToFaces(self.bboxMesh.geometry, "center", ['Test'])
                    }
                }

                // After loading the .obj
                self.objects.forEach((o) => {
                    scene.add(o)
                })
                if (self.addBBox) {
                    scene.add(self.bboxMesh)

                    // Only add the sprite if we have a bounding box
                    if (self.addSprites) {
                        self.sprites.forEach((s) => {
                            scene.add(s)
                        })
                    }
                }
            })
        }
    }
}


@Directive({
    selector: 'three-dae',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => ColladaComponent) }]
<<<<<<< HEAD
 })
 export class ColladaComponent extends ObjectComponent {
     @Input() daeFile = null;

     attachScene(scene: THREE.Scene): void {
         if (this.daeFile === null) return
         let loader = new THREE['ColladaLoader']();
         loader.load(this.daeFile, function (object) {
             let dae = object.scene;
             dae.traverse( function ( child ) {
                 if ( child instanceof THREE.SkinnedMesh && child.geometry['animation'] ) {
                     var animation = new THREE['Animation']( child, child.geometry['animation'] );
                     animation.play();
                 }
             } );
             dae.updateMatrix();
             scene.add(dae);
         });
     }
=======
})
export class ColladaComponent extends ObjectComponent {
    constructor() {
        super()
        // This loader does not accept a manager as a parameter
        this.loader = new THREE['ColladaLoader']()
    }

    attachScene(scene: THREE.Scene): void {
        if (this.file === null) return
        this.loader.load(this.file, function (object) {
            scene.add(object.scene)
        })
    }
>>>>>>> Code cleanup and small changes
}

@Directive({
    selector: 'three-fbx',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => FBXComponent) }]
})
export class FBXComponent extends ObjectComponent {
    constructor() {
        super()
        this.manager = new THREE.LoadingManager()
        this.loader = new THREE['FBXLoader'](this.manager)
    }

    attachScene(scene: THREE.Scene): void {
        if (this.file === null) return
        this.loader.load(this.file, function (object) {
            scene.add(object)
        })
    }
}

@Directive({
    selector: 'three-gltf',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => GLTFComponent) }]
 })
 export class GLTFComponent extends ObjectComponent {
     @Input() gltfFile = null;

     attachScene(scene: THREE.Scene): void {
         if (this.gltfFile === null) return
         let loader = new THREE['GLTFLoader']();
         loader.load(this.gltfFile, function (gltf) {
             var object = gltf.scene !== undefined ? gltf.scene : gltf.scenes[ 0 ];
             var animations = gltf.animations;
             if ( animations && animations.length ) {
                 var mixer = new THREE.AnimationMixer( object );
                 for ( var i = 0; i < animations.length; i ++ ) {
                     var animation = animations[ i ];
                     mixer.clipAction( animation ).play();
                 }
             }
             scene.add(object);
         });
     }
}

@Directive({
    selector: 'three-terrain',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => TerrainComponent) }]
})
export class TerrainComponent extends ObjectComponent {
    @Input() texture = null
    @Input() width: number = 60
    @Input() height: number = 60
    @Input() wPoints: number = 1
    @Input() hPoints: number = 1
    data = []

    constructor() {
        super()
        this.manager = new THREE.LoadingManager()
        this.loader = new THREE['TerrainLoader'](this.manager)
    }

    ngOnInit() {
        let self = this

        if (this.file === null) return
        this.loader.load(this.file, function(data) {
            self.data = data
        })

        this.manager.onProgress = (item, loaded, total) => {
            if (self.debug) {
                console.log('Item being loaded:')
                console.log(item)
                console.log('Loaded:')
                console.log(loaded)
                console.log('Total:')
                console.log(total)
            }
        }
    }

    attachScene(scene: THREE.Scene): void {
        let self = this
        this.manager.onLoad = () => {
            let geometry = new THREE.PlaneGeometry(this.width, this.height, this.wPoints-1, this.hPoints-1)

            for (let i = 0, l = geometry.vertices.length; i < l; i++) {
                geometry.vertices[i].z = self.data[i] / 65535 * 2
            }

            let material = new THREE.MeshPhongMaterial(
                this.texture ?
                    {map: new THREE.TextureLoader().load(this.texture)} :
                    {color: 0xdddddd, wireframe: true})

            let plane = new THREE.Mesh(geometry, material)
            scene.add(plane)
        }
    }
}
