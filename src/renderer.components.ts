import { Directive, ElementRef, HostListener, Input, ContentChild, ContentChildren, QueryList } from '@angular/core';
import * as THREE from 'three';

import { SceneComponent } from './scene.components';
import { ControlsComponent } from './control.components';
import { CameraComponent } from './camera.components';

@Directive({ selector: 'three-renderer' })
export class RendererComponent {
  @Input() isVRMode: boolean = false;
  width: number;
  height: number;

  @ContentChild(SceneComponent) sceneComp: SceneComponent;
  @ContentChild(CameraComponent) cameraComp: CameraComponent;
  @ContentChildren(ControlsComponent) controlsComps: QueryList<ControlsComponent>;

  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    antialias: true
  });

  get scene() {
    return this.sceneComp.scene
  }

  get camera(): THREE.Camera {
    return this.cameraComp.camera;
  }

  constructor(private element: ElementRef) {
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
    this.renderer.setSize(this.element.nativeElement.clientWidth, this.element.nativeElement.clientHeight);
    this.element.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
    this.cameraComp.updateRenderSize(this.renderer.getSize());

    this.controlsComps.forEach((cc) => {
        cc.setupControls(this.camera, this.renderer);
    })

    this.render();
  }

  render() {
    this.controlsComps.forEach((cc) => {
      cc.updateControls(this.scene, this.camera);
    })

    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.render());
  }

  @HostListener('window:resize')
  @HostListener('window:vrdisplaypresentchange')
  resetWidthHeight() {
     // FIXME what else can be used instead of nativeElement?
     this.renderer.setSize(this.element.nativeElement.clientWidth, this.element.nativeElement.clientHeight);
     this.cameraComp.updateRenderSize(this.renderer.getSize());
     this.controlsComps.forEach((cc) => {
       cc.updateRenderSize(this.renderer.getSize());
     })
  }

}
