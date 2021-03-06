import { Directive, ElementRef, ViewChild, HostListener, Input, ContentChild, ContentChildren, QueryList } from '@angular/core'
import { SceneComponent } from './scene.components'
import { ControlsComponent } from './control.components'
import { CameraComponent } from './camera.components'
import { AnimationService } from './services/animation.service'

import * as THREE from 'three'
import 'three/examples/js/loaders/collada/AnimationHandler.js'

@Directive({ selector: 'three-renderer' })
export class RendererComponent {
    @Input() isVRMode: boolean = false

    @ContentChild(SceneComponent) sceneComp: SceneComponent
    @ContentChild(CameraComponent) cameraComp: CameraComponent
    @ContentChildren(ControlsComponent) controlsComps: QueryList<ControlsComponent>

    renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
        antialias: true
    })
    clock: THREE.Clock = new THREE.Clock()

    get scene() {
        return this.sceneComp.scene
    }

    get camera() {
        return this.sceneComp.camera
    }

    constructor(
        private animService: AnimationService,
        private element: ElementRef
    ) {}

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
        let self = this
        this.controlsComps.forEach((cc) => {
            cc.updateControls(this.scene, this.camera)
        })

        requestAnimationFrame(() => {
            let delta = self.clock.getDelta()
            this.sceneComp.priComps.toArray().forEach((s) => {
                // If the object is sitting at the X axis, the second condition is to
                // prevent the object sitting on the Z axis to enter when moved the first
                // time
                if (s.object.geometry.name === 'Sphere') this.animService.updatePosition(s.object.position, s.animConfig)
            })

            this.sceneComp.objComps.toArray().forEach((o) => {
                if (o['mixers'] && o['mixers'].length > 0) {
                    //console.log("hummm %s", delta)
                    o['mixers'].forEach((m) => {
                        m.update(0.2)
                        //m.update(self.clock.getDelta())
                    })
                }

                if (o['animations'] && o['animations'].length > 0) {
                    THREE['AnimationHandler'].update(self.clock.getDelta())
                }
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
