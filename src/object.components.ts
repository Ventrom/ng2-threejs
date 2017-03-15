import { ContentChildren, Directive, Input, forwardRef, QueryList } from '@angular/core';
import * as THREE from 'three';
import 'three/examples/js/loaders/MTLLoader.js';
import 'three/examples/js/loaders/OBJLoader.js';
import 'three/examples/js/loaders/ColladaLoader.js';
import 'three/examples/js/loaders/collada/Animation.js';
import 'three/examples/js/loaders/collada/KeyFrameAnimation.js';
import 'three/examples/js/loaders/collada/AnimationHandler.js';
import 'three/examples/js/loaders/FBXLoader2.js';
import 'three/examples/js/loaders/GLTFLoader.js';
import './loaders/terrain-loader.js';
import { dirname, basename } from 'path';

export abstract class ObjectComponent {
    abstract attachScene(scene: THREE.Scene): void
}

@Directive({selector: 'three-mtl'})
export class MtlComponent {
    @Input() mtlFile = null;
}

@Directive({
    selector: 'three-obj',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => ObjComponent) }]
 })
 export class ObjComponent extends ObjectComponent {
     @Input() objFile = null;
     @ContentChildren(MtlComponent) mtlComps: QueryList<MtlComponent>;

     manager = new THREE.LoadingManager();
     objects = [];

     ngAfterContentInit() {
         let self = this
         if (self.mtlComps) {
             self.mtlComps.forEach((mtl) => {
                 if (mtl.mtlFile === null) return;
                 let loader = new THREE['MTLLoader'](self.manager);
                 loader.setPath(dirname(mtl.mtlFile) + '/');
                 loader.load(basename(mtl.mtlFile), function ( materials ) {
                     materials.preload();
                     self.objects = materials;
                 });
             });
         }
     }

     attachScene(scene: THREE.Scene): void {
         let self = this
         if (self.objFile === null) return
         self.manager.onLoad = () => {
           let objLoader = new THREE['OBJLoader']();
           objLoader.setMaterials(self.objects);
           objLoader.setPath(dirname(self.objFile) + '/');
           objLoader.load(basename(self.objFile), function (object) {
               scene.add(object);
           });
         };
     }
}

@Directive({
    selector: 'three-dae',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => ColladaComponent) }]
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
}

@Directive({
    selector: 'three-fbx',
    providers: [{provide: ObjectComponent, useExisting: forwardRef(() => FBXComponent) }]
 })
 export class FBXComponent extends ObjectComponent {
     @Input() fbxFile = null;

     attachScene(scene: THREE.Scene): void {
         if (this.fbxFile === null) return
         let loader = new THREE['FBXLoader']();
         loader.load(this.fbxFile, function (object) {
             scene.add(object);
         });
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
  @Input() terrain = null;
  @Input() texture = null;
  @Input() width: number = 60;
  @Input() height: number = 60;
  @Input() wPoints: number = 1;
  @Input() hPoints: number = 1;

  manager = new THREE.LoadingManager();
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
    };
  }

  attachScene(scene: THREE.Scene): void {
    let self = this
    this.manager.onLoad = () => {
        let geometry = new THREE.PlaneGeometry(this.width, this.height, this.wPoints-1, this.hPoints-1);

        for (let i = 0, l = geometry.vertices.length; i < l; i++) {
          geometry.vertices[i].z = self.data[i] / 65535 * 2;
        }

        let material = new THREE.MeshPhongMaterial(
            this.texture ?
                {map: new THREE.TextureLoader().load(this.texture)} :
                {color: 0xdddddd, wireframe: true});

        let plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
    };
  }
}
