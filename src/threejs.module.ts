import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RendererComponent } from './renderer.components';
import { PerspectiveCameraComponent } from './camera.components';
import { AmbientLightComponent, PointLightComponent } from './light.components';
import { SceneComponent } from './scene.components';
import { TrackballControlsComponent } from './control.components';
import { ObjComponent, MtlComponent, TerrainComponent } from './object.components';

@NgModule({
  declarations: [
      RendererComponent,
      PerspectiveCameraComponent,
      AmbientLightComponent,
      PointLightComponent,
      SceneComponent,
      TrackballControlsComponent,
      ObjComponent,
      MtlComponent,
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
      SceneComponent,
      TrackballControlsComponent,
      ObjComponent,
      MtlComponent,
      TerrainComponent
  ]
})
export class ThreejsModule {}