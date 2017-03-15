import { Injectable } from '@angular/core'

var centroid = require('triangle-centroid')

import * as THREE from 'three'

@Injectable()
export class BoundingBoxService {
    debug: boolean = false

    addBBoxToObject(object: THREE.Object3D) {
        let bbox = new THREE.Box3().setFromObject(object)
        let size = bbox.size()
        let center = bbox.center()

        // Adds the material and actually creates the mesh
        let material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            vertexColors: THREE.FaceColors,
            wireframe: true
        })

        // Adds the geometry and add the basic colors
        let geometry = new THREE.CubeGeometry(size.x, size.y, size.z)
        geometry.faces.forEach((f, i) => {
            f.color.setRGB( 0, 0, 0.8 * Math.random() + 0.2 )
        })

        // Translate vertices of the geometry based on the center of this object
        geometry.vertices.forEach((v) => {
            v.x += center.x
            v.y += center.y
            v.z += center.z
        })
        geometry.verticesNeedUpdate = true


        //let material = new THREE.MeshNormalMaterial()
        let bboxMesh = new THREE.Mesh( geometry, material )

        // The current version of Three.js removed the centroid from geometry faces so we
        // need to add them. At this point the geometry is not updated with the new vertex
        // positions
        this.computeFaceCentroids(bboxMesh.geometry)

        return bboxMesh
    }

    //TODO: move this from here to a more generic service?
    computeFaceCentroids( geometry ) {
        geometry.faces.forEach((f) => {
            let v1 = geometry.vertices[ f.a ]
            let v2 = geometry.vertices[ f.b ]
            let v3 = geometry.vertices[ f.c ]
            let cArray = centroid([
                [v1.x, v1.y, v1.z],
                [v2.x, v2.y, v2.z],
                [v3.x, v3.y, v3.z]
            ])

            f.centroid = new THREE.Vector3(cArray[0], cArray[1], cArray[2])
        })
    }
}