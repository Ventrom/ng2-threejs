import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RendererComponent } from './renderer.components'
import { PerspectiveCameraComponent } from './camera.components'
import { AmbientLightComponent, PointLightComponent, DirectionalLightComponent, HemisphereLightComponent } from './light.components'
import { SceneComponent } from './scene.components'
import { TrackballControlsComponent, OrbitControlsComponent } from './control.components'
import { ObjComponent, SceneObjComponent, MtlComponent, ColladaComponent, FBXComponent, GLTFComponent, TerrainComponent, JSONComponent } from './object.components'
import { SphereComponent, PlaneComponent } from './primitive.components'
import { SkyboxComponent } from './skybox.component'
import { TextureComponent } from './texture.component'
import { BoundingBoxService } from './services/bounding-box.service'
import { AnimationService } from './services/animation.service'
import { SpriteService } from './services/sprite.service'

@NgModule({
  declarations: [
      RendererComponent,
      PerspectiveCameraComponent,
      AmbientLightComponent,
      PointLightComponent,
      DirectionalLightComponent,
      HemisphereLightComponent,
      SceneComponent,
      TrackballControlsComponent,
      OrbitControlsComponent,
      ObjComponent,
      SceneObjComponent,
      MtlComponent,
      ColladaComponent,
      FBXComponent,
      GLTFComponent,
      TerrainComponent,
      JSONComponent,
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
      AnimationService,
      SpriteService
  ],
  exports: [
      RendererComponent,
      PerspectiveCameraComponent,
      AmbientLightComponent,
      PointLightComponent,
      DirectionalLightComponent,
      HemisphereLightComponent,
      SceneComponent,
      TrackballControlsComponent,
      OrbitControlsComponent,
      ObjComponent,
      SceneObjComponent,
      MtlComponent,
      ColladaComponent,
      FBXComponent,
      GLTFComponent,
      TerrainComponent,
      JSONComponent,
      SkyboxComponent,
      TextureComponent,
      SphereComponent,
      PlaneComponent
  ]
})
export class ThreejsModule {}
