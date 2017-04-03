import { ContentChildren, Directive, Input, forwardRef, QueryList } from '@angular/core'
import { BoundingBoxService } from './services/bounding-box.service'
import { SpriteService } from './services/sprite.service'
import { AnimationService } from './services/animation.service'
import { dirname, basename } from 'path'

import * as THREE from 'three'
import 'three/examples/js/loaders/MTLLoader.js'
import 'three/examples/js/loaders/OBJLoader.js'
import 'three/examples/js/loaders/ColladaLoader.js'
import 'three/examples/js/loaders/collada/Animation.js'
import 'three/examples/js/loaders/collada/KeyFrameAnimation.js'
import 'three/examples/js/loaders/collada/AnimationHandler.js'
import 'three/examples/js/loaders/FBXLoader2.js'
import 'three/examples/js/loaders/GLTFLoader.js'
import './loaders/terrain-loader.js'
import './loaders/JDLoader.min.js'

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
    mixers: THREE.AnimationMixer[] = []
    materials: THREE.Material[] = []
    objects: THREE.Object3D[] = []
    sprites: THREE.Sprite[] = []
    bbox: THREE.Box3
    bboxMesh: THREE.Mesh
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
    selector: 'three-sobj',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => SceneObjComponent) }]
})
export class SceneObjComponent extends ObjectComponent {
    @Input() scale: number = 1
    mixers: THREE.AnimationMixer[] = []
    objects: THREE.Object3D[] = []
    objLoader: THREE.ObjectLoader

    constructor(
        private animService: AnimationService
    ) {
        super()
        this.manager = new THREE.LoadingManager()
        this.objLoader = new THREE.ObjectLoader(this.manager)
    }

    ngAfterViewInit() {
        let self = this

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
        if (this.file === null) return
        let self = this
        //this.objLoader.setTexturePath(dirname(this.file) + '/')
        this.objLoader.load(this.file, function (object) {
            object.scale.set(self.scale, self.scale, self.scale)
            //TODO: make this an input, test for scale also
            self.animService.rotateAroundWorldAxis(object, new THREE.Vector3(1,0,0), Math.PI/2)

            // Create a mixer for this object
            object['mixer'] = new THREE.AnimationMixer(object)
            self.mixers.push(object['mixer'])

            // Create an action for the animation to play
            let action = object['mixer'].clipAction(object['animations'][0])
            action.play()

            scene.add(object)
        })
    }
}


@Directive({
    selector: 'three-dae',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => ColladaComponent) }]
})
export class ColladaComponent extends ObjectComponent {
    @Input() scale: number = 1
    // Not using the dynamic type THREE.Animation here
    animations: any[] = []

    constructor() {
        super()
        // This loader does not accept a manager as a parameter
        this.loader = new THREE['ColladaLoader']()
    }

    attachScene(scene: THREE.Scene): void {
        if (this.file === null) return
        let self = this
        this.loader.load(this.file, function (object) {
            let dae = object.scene
            dae.scale.set(self.scale, self.scale, self.scale)
            dae.traverse( function ( child ) {
                if (child instanceof THREE.SkinnedMesh) {
                    self.animations.push(new THREE['Animation'](child, child.geometry['animation']))
                    self.animations[self.animations.length-1].play()
                }
            })
            dae.scale.x = dae.scale.y = dae.scale.z = self.scale
            dae.updateMatrix()

            scene.add(dae)
        })
    }
}

@Directive({
    selector: 'three-fbx',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => FBXComponent) }]
})
export class FBXComponent extends ObjectComponent {
    @Input() scale: number = 1
    mixers: THREE.AnimationMixer[] = []

    constructor() {
        super()
        this.manager = new THREE.LoadingManager()
        this.loader = new THREE['FBXLoader'](this.manager)
    }

    attachScene(scene: THREE.Scene): void {
        if (this.file === null) return
        let self = this
        this.loader.load(this.file, function (object) {
            // Create a mixer for this object
            object['mixer'] = new THREE.AnimationMixer(object)
            self.mixers.push(object['mixer'])

            // Create an action for the animation to play
            let action = object['mixer'].clipAction(object['animations'][0])
            action.play()

            scene.add(object)
        })
    }
}

@Directive({
    selector: 'three-json',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => JSONComponent) }]
})
export class JSONComponent extends ObjectComponent {
    @Input() scale: number = 1
    mixers: THREE.AnimationMixer[] = []

    constructor(
        private animService: AnimationService
    ) {
        super()
        this.manager = new THREE.LoadingManager()
        this.loader = new THREE['JDLoader'](this.manager)
    }

    attachScene(scene: THREE.Scene): void {
        if (this.file === null) return
        let self = this
        this.loader.load(this.file, function (data) {
            // The loader creates a MeshPhongMaterial array by default,
            // If a ShaderMaterial is needed, use data.jd_materials
            let multiMaterial = new THREE.MultiMaterial(data.materials)

            data.geometries.forEach((g, i) => {
                let mesh = new THREE.SkinnedMesh(g, multiMaterial)
                self.animService.rotateAroundWorldAxis(mesh, new THREE.Vector3(1,0,0), Math.PI/2)
                self.animService.rotateAroundObjectAxis(mesh, new THREE.Vector3(0,1,0), Math.PI)
                mesh.scale.set(self.scale, self.scale, self.scale)
                scene.add(mesh)

                if (mesh.geometry['animations'])
                {
                    let mixer = new THREE.AnimationMixer(mesh)
                    self.mixers.push(mixer)
                    mixer.clipAction(mesh.geometry['animations'][0]).play()
                }
            })
        })
    }
}

@Directive({
    selector: 'three-gltf',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => GLTFComponent) }]
 })
 export class GLTFComponent extends ObjectComponent {
    constructor() {
        super()
        this.loader = new THREE['GLTFLoader']()
    }

    attachScene(scene: THREE.Scene): void {
        if (this.file === null) return
        this.loader.load(this.file, function (gltf) {
            let object = gltf.scene !== undefined ? gltf.scene : gltf.scenes[0]
            let animations = gltf.animations
            if (animations && animations.length) {
                let mixer = new THREE.AnimationMixer(object)
                animations.forEach((a) => {
                    mixer.clipAction(a).play()
                })
            }
            scene.add(object)
         })
    }
}

@Directive({
    selector: 'three-terrain',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => TerrainComponent) }]
})
export class TerrainComponent extends ObjectComponent {
    @Input() textureUrl: string
    @Input() width: number = 60
    @Input() height: number = 60
    @Input() wPoints: number = 1
    @Input() hPoints: number = 1
    @Input() addSprites: boolean = false
    sprites: THREE.Sprite[] = []
    data = []

    constructor(
        private bboxService: BoundingBoxService,
        private spriteService: SpriteService
    ) {
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
            geometry.name = "Plane"

            for (let i = 0, l = geometry.vertices.length; i < l; i++) {
                geometry.vertices[i].z = self.data[i] / 65535 * 2
            }

            let material = new THREE.MeshPhongMaterial(
                this.textureUrl ?
                    {map: new THREE.TextureLoader().load(this.textureUrl), shininess: 5} :
                    {color: 0xdddddd, wireframe: true})

            let plane = new THREE.Mesh(geometry, material)
            scene.add(plane)

            if (self.addSprites) {
                // Add sprites to the plane geometry
                self.sprites = self.spriteService.addSpritesToGeometry(geometry, [
                    { msg: 'Test', mpos: new THREE.Vector3(-1500, 1500, 0) },
                    { msg: 'Test 2', mpos: new THREE.Vector3(1500, -1500, 0) }
                ])

                self.sprites.forEach((s) => {
                    s.scale.set(s.scale.x * 10, s.scale.y * 10, 1)
                    s.position.set(s.position.x, s.position.y, s.position.z + 50)
                    scene.add(s)
                })
            }
        }
    }
}
