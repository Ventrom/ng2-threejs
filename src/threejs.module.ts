import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RendererComponent } from './renderer.components';
import { PerspectiveCameraComponent } from './camera.components';
import { AmbientLightComponent, PointLightComponent, DirectionalLightComponent } from './light.components';
import { SceneComponent } from './scene.components';
import { TrackballControlsComponent } from './control.components';
import { ObjComponent, MtlComponent, ColladaComponent, FBXComponent, TerrainComponent } from './object.components';

@NgModule({
  declarations: [
      RendererComponent,
      PerspectiveCameraComponent,
      AmbientLightComponent,
      PointLightComponent,
      DirectionalLightComponent,
      SceneComponent,
      TrackballControlsComponent,
      ObjComponent,
      MtlComponent,
      ColladaComponent,
      FBXComponent,
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
      ObjComponent,
      MtlComponent,
      ColladaComponent,
      FBXComponent,
      TerrainComponent
  ]
})
export class ThreejsModule {}