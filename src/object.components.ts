import { ContentChildren, Directive, Input, forwardRef, QueryList } from '@angular/core'
import { SpriteComponent } from './sprite.component'
import { BoundingBoxService } from './services/bounding-box.service'
import { dirname, basename } from 'path'

import * as THREE from 'three'
import 'three/examples/js/loaders/MTLLoader.js'
import 'three/examples/js/loaders/OBJLoader.js'
import 'three/examples/js/loaders/ColladaLoader.js'
import 'three/examples/js/loaders/FBXLoader.js'
import './loaders/terrain-loader.js'

export abstract class ObjectComponent {
    abstract attachScene(scene: THREE.Scene): void
}

@Directive({selector: 'three-mtl'})
export class MtlComponent {
    @Input() mtlFile = null
}

@Directive({
    selector: 'three-obj',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => ObjComponent) }]
})
export class ObjComponent extends ObjectComponent {
    @Input() objFile = null
    @ContentChildren(SpriteComponent) spriteComp: any
    @ContentChildren(MtlComponent) mtlComps: QueryList<MtlComponent>
    @Input() addBBox: boolean = false
    @Input() addSprites: boolean = false
    @Input() debug: boolean = false
    bbox: THREE.Box3
    bboxMesh: THREE.Mesh
    manager = new THREE.LoadingManager()
    materials: any[] = []
    objects = []

    constructor(public bboxService: BoundingBoxService) {
        super()
    }

    ngAfterViewInit() {
        let self = this
        if (self.mtlComps) {
            self.mtlComps.forEach((mtl) => {
                if (mtl.mtlFile === null) return;
                let loader = new THREE['MTLLoader'](self.manager)
                loader.setPath(dirname(mtl.mtlFile) + '/')
                loader.load(basename(mtl.mtlFile), function ( materials ) {
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
        if (self.objFile === null) return
        self.manager.onLoad = () => {
            let objLoader = new THREE['OBJLoader']()
            objLoader.setMaterials(self.materials)
            objLoader.setPath(dirname(self.objFile) + '/')
            objLoader.load(basename(self.objFile), function (object) {
                // After the object has been loaded make a cube around it so we can write information
                object.scale.set(20,20,20)
                self.objects.push(object)
                if (self.addBBox) {
                    self.bboxMesh = self.bboxService.addBBoxToObject(object)
                    self.objects.push(self.bboxMesh)

                    if (self.addSprites) {
                        let spriteComp = self.spriteComp.toArray()[0]
                        self.bboxMesh.geometry['faces'].forEach((f, i) => {
                            // Make the sprites a bit far from the cube mesh
                            let sPos = f.centroid.clone()
                            sPos = sPos.multiplyScalar(1.2)

                            // The first parameter is the text message to be used on the sprite. At the moment
                            // only a certain length of message is supported properly
                            spriteComp.addSprite(
                                //i,
                                ' ' + sPos.x.toFixed(2) + ', ' + sPos.y.toFixed(2) + ', ' + sPos.z.toFixed(2) + ' ',
                                /*'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean in nisi nisl. Integer eu sem in turpis laoreet mollis lobortis et ipsum. ' +
                                + 'Phasellus sit amet ultricies felis. Phasellus feugiat neque eros. Donec vel mauris posuere, finibus lacus tristique, molestie felis. Proin ' +
                                + 'ultricies auctor nunc, quis molestie quam pellentesque ac. Praesent et purus convallis, dictum tellus non, congue purus. Ut venenatis urna ' +
                                + 'a velit convallis varius ut in nisi. Donec felis est, rutrum id massa id, sollicitudin ornare ex. Nulla facilisi. Vestibulum tincidunt ' +
                                + 'eleifend convallis. Curabitur gravida consequat tellus ut tempor. ',*/
                                { fontsize: 32, backgroundColor: {r:100, g:100, b:255, a:1} }
                            )
                            if (self.debug) {
                                console.log('Current face:')
                                console.log(f)
                                console.log('Current centroid position:')
                                console.log(sPos)
                                console.log('Current sprite info: ')
                                console.log(spriteComp.spriteArray[i])
                            }
                            spriteComp.spriteArray[i].position.set(sPos.x, sPos.y, sPos.z)
                        })
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
                        self.spriteComp.toArray()[0].spriteArray.forEach((s) => {
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
})
export class ColladaComponent extends ObjectComponent {
    @Input() daeFile = null

    attachScene(scene: THREE.Scene): void {
        if (this.daeFile === null) return
        let loader = new THREE['ColladaLoader']()
        loader.load(this.daeFile, function (object) {
            scene.add(object.scene)
        })
    }
}

@Directive({
    selector: 'three-fbx',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => FBXComponent) }]
})
export class FBXComponent extends ObjectComponent {
    @Input() fbxFile = null;

    attachScene(scene: THREE.Scene): void {
        if (this.fbxFile === null) return
        let loader = new THREE['FBXLoader']()
        loader.load(this.fbxFile, function (object) {
            scene.add(object)
        })
    }
}

@Directive({
    selector: 'three-terrain',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => TerrainComponent) }]
})
export class TerrainComponent extends ObjectComponent {
    @Input() terrain = null
    @Input() texture = null
    @Input() width: number = 60
    @Input() height: number = 60
    @Input() wPoints: number = 1
    @Input() hPoints: number = 1

    manager = new THREE.LoadingManager()
    data = [];

    ngOnInit() {
        let self = this

        if (this.terrain) {
            let terrainLoader = new THREE['TerrainLoader'](this.manager);

            terrainLoader.load(this.terrain, function(data) {
                self.data = data;
            });
        }

        this.manager.onProgress = (item, loaded, total) => {
            console.log(item)
            console.log(`Loaded ${loaded} of ${total}`)
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
