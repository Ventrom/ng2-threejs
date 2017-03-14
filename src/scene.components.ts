import { Directive, ContentChild, ContentChildren, QueryList } from '@angular/core'
import { LightComponent } from './light.components'
import { ObjectComponent } from './object.components'
import { PrimitiveComponent } from './primitive.components'
import { SkyboxComponent } from './skybox.component'
import { PerspectiveCameraComponent } from './camera.components'
import { AnimationConfig } from './interfaces/animation.interface'

import * as THREE from 'three'

@Directive({ selector: 'three-scene' })
export class SceneComponent {
    @ContentChild(PerspectiveCameraComponent) cameraComp: PerspectiveCameraComponent
    @ContentChildren(LightComponent) lightComps: QueryList<LightComponent>
    @ContentChildren(ObjectComponent) objComps: QueryList<ObjectComponent>
    @ContentChild(SkyboxComponent) skyboxComp: SkyboxComponent
    @ContentChildren(PrimitiveComponent) priComps: QueryList<PrimitiveComponent>

    scene: THREE.Scene = new THREE.Scene()

    get camera() {
        return this.cameraComp.camera
    }

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

        if (this.priComps) {
            this.priComps.forEach((pc) => {
                this.scene.add(pc.object)
            })
        }

        if (this.skyboxComp) {
            this.skyboxComp.attachScene(this.scene)
        }

        // The camera moves using translation along a path
        this.cameraComp.animConfig = {
            animate: false,
            translation: true,
            animRate: 2
        }
    }
}
