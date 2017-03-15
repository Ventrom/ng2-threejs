import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RendererComponent } from './renderer.components'
import { PerspectiveCameraComponent } from './camera.components'
import { AmbientLightComponent, PointLightComponent, DirectionalLightComponent } from './light.components'
import { SceneComponent } from './scene.components';
import { TrackballControlsComponent, OrbitControlsComponent } from './control.components';
import { ObjComponent, MtlComponent, ColladaComponent, FBXComponent, GLTFComponent, TerrainComponent } from './object.components';
import { SphereComponent, PlaneComponent } from './primitive.components'
import { SpriteComponent } from './sprite.component'
import { SkyboxComponent } from './skybox.component'
import { TextureComponent } from './texture.component'
import { BoundingBoxService } from './services/bounding-box.service'
import { AnimationService } from './services/animation.service'

@NgModule({
  declarations: [
      RendererComponent,
      PerspectiveCameraComponent,
      AmbientLightComponent,
      PointLightComponent,
      DirectionalLightComponent,
      SceneComponent,
      TrackballControlsComponent,
      OrbitControlsComponent,
      ObjComponent,
      MtlComponent,
      ColladaComponent,
      FBXComponent,
      GLTFComponent,
      TerrainComponent,
      SpriteComponent,
      SkyboxComponent,
      TextureComponent,
      SphereComponent,
      PlaneComponent
  ],
  imports: [
      CommonModule
  ],
  providers: [
      BoundingBoxService,
      AnimationService
  ],
  exports: [
      RendererComponent,
      PerspectiveCameraComponent,
      AmbientLightComponent,
      PointLightComponent,
      DirectionalLightComponent,
      SceneComponent,
      TrackballControlsComponent,
      OrbitControlsComponent,
      ObjComponent,
      MtlComponent,
      ColladaComponent,
      FBXComponent,
      GLTFComponent,
      TerrainComponent
      SpriteComponent,
      SkyboxComponent,
      TextureComponent,
      SphereComponent,
      PlaneComponent
  ]
})
export class ThreejsModule {}