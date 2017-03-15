import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RendererComponent } from './renderer.components';
import { PerspectiveCameraComponent } from './camera.components';
import { AmbientLightComponent, PointLightComponent, DirectionalLightComponent } from './light.components';
import { SceneComponent } from './scene.components';
import { TrackballControlsComponent, OrbitControlsComponent } from './control.components';
import { ObjComponent, MtlComponent, ColladaComponent, FBXComponent, GLTFComponent, TerrainComponent } from './object.components';

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
      TerrainComponent
 ],
  imports: [
      CommonModule
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
  ]
})
export class ThreejsModule {}