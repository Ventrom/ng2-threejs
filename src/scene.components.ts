import { Directive, ContentChild, ContentChildren, QueryList } from '@angular/core';
import * as THREE from 'three';

import { LightComponent } from './light.components';
import { ObjectComponent } from './object.components';

@Directive({ selector: 'three-scene' })
export class SceneComponent {

  @ContentChildren(LightComponent) lightComps: QueryList<LightComponent>;
  @ContentChildren(ObjectComponent) objComps: QueryList<ObjectComponent>;

  scene: THREE.Scene = new THREE.Scene();

  ngAfterContentInit() {
      if (this.lightComps) {
          this.lightComps.forEach((lc) => {
              this.scene.add(lc.light)
          })
      }

      if (this.objComps) {
          this.objComps.forEach((oc) => {
              oc.attachScene(this.scene)
          })
      }
  }
}
