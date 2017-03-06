import { ContentChildren, Directive, Input } from '@angular/core';
import * as THREE from 'three';
import 'three/examples/js/loaders/MTLLoader.js';
import 'three/examples/js/loaders/OBJLoader.js';
import './loaders/terrain-loader.js';

export abstract class ObjectComponent {
    abstract attachScene(scene: THREE.Scene): void
}

@Directive({'three-mtl'})
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

     ngOnInit() {
         let self = this
         if (self.mtlComps) {
             self.mtlComps.forEach((mtl) => {
                 if (!mtl.mtlFile) return;
                 let loader = new THREE['MTLLoader'](self.manager);
                 loader.load(mtl.mtlFile, function ( materials ) {
                     materials.preload();
                     self.objects = materials;
                 });
             });
         }
     }

     attachScene(scene: THREE.Scene): void {
         let self = this
         if (!self.objFile) return
         self.manager.onLoad = () => {
           let objLoader = new THREE['OBJLoader']();
           objLoader.setMaterials(self.objects);
           objLoader.load(self.objFile, function (object) {
               scene.add(object);
           });
         };
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
        console.log(loaded)
        console.log(total)
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
