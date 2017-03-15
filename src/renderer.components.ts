import { Directive, ElementRef, HostListener, Input, ContentChild, ContentChildren, QueryList } from '@angular/core'
import { SceneComponent } from './scene.components'
import { ControlsComponent } from './control.components'
import { CameraComponent } from './camera.components'
import { AnimationService } from './services/animation.service'

import * as THREE from 'three'

@Directive({ selector: 'three-renderer' })
export class RendererComponent {
    @Input() isVRMode: boolean = false

    @ContentChild(SceneComponent) sceneComp: SceneComponent
    @ContentChild(CameraComponent) cameraComp: CameraComponent
    @ContentChildren(ControlsComponent) controlsComps: QueryList<ControlsComponent>

    renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
        antialias: true
    });

    get scene() {
        return this.sceneComp.scene
    }

    get camera() {
        return this.sceneComp.camera
    }

    constructor(
        private element: ElementRef,
        private animService: AnimationService) {
    }

    ngOnChanges(changes) {
        if(changes.isVRMode && changes.isVRMode.currentValue && this.controlsComps) {
            this.controlsComps.forEach((cc) => {
                if (cc.isVRMode) {
                    cc.enabled = true
                    cc.setupControls(this.camera, this.renderer)
                }
            })
        }
    }

    ngAfterContentInit() {
        // FIXME what else can be used instead of nativeElement and window.devicePixelRatio?
        this.renderer.setSize(this.element.nativeElement.clientWidth, this.element.nativeElement.clientHeight)
        this.element.nativeElement.appendChild(this.renderer.domElement)
        this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio))
        this.cameraComp.updateRenderSize(this.renderer.getSize())

        this.controlsComps.forEach((cc) => {
            cc.setupControls(this.camera, this.renderer)
        })

        this.render()
    }

    render() {
        this.controlsComps.forEach((cc) => {
            cc.updateControls(this.scene, this.camera)
        })

        requestAnimationFrame(() => {
            this.sceneComp.priComps.toArray().forEach((s) => {
                // If the object is sitting at the X axis, the second condition is to
                // prevent the object sitting on the Z axis to enter when moved the first
                // time
                if (s.object.geometry.name === 'Sphere') this.animService.updatePosition(s.object.position, s.animConfig)
            })

            // Camera animation
            this.animService.updatePosition(this.camera.position, this.sceneComp.cameraComp.animConfig)

            this.render()
        })

        this.renderer.render(this.scene, this.camera)
    }

    @HostListener('window:resize')
    @HostListener('window:vrdisplaypresentchange')
    resetWidthHeight() {
        // FIXME what else can be used instead of nativeElement?
        this.renderer.setSize(this.element.nativeElement.clientWidth, this.element.nativeElement.clientHeight)
        this.cameraComp.updateRenderSize(this.renderer.getSize())
        this.controlsComps.forEach((cc) => {
            cc.updateRenderSize(this.renderer.getSize())
        })
    }
}
