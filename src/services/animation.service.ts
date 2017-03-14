import { Injectable, OnInit } from '@angular/core'
import { AnimationConfig } from '../interfaces/animation.interface'

import * as THREE from 'three'

@Injectable()
export class AnimationService implements OnInit {
    debug: boolean = false
    alpha: number = 0
    direction: number = 1
    rSpeed: number = 0.007
    tSpeed: number = 0.005
    // Distance threshold, if the distance is less than this do not animate. At the moment
    // this is used in the deltas for translation
    threshold: number = 1

    constructor() {}

    ngOnInit() {
    }

    // Rotate an object around an arbitrary axis in world space
    rotateAroundWorldAxis(object: THREE.Object3D, axis: THREE.Vector3, radians: number) {
        let rotWorldMatrix = new THREE.Matrix4()
        rotWorldMatrix.makeRotationAxis(axis.normalize(), radians)
        rotWorldMatrix.multiply(object.matrix)        // pre-multiply
        object.matrix = rotWorldMatrix
        object.rotation.setFromRotationMatrix(object.matrix)
    }

    // Rotate an object around an arbitrary axis in object space
    rotateAroundObjectAxis(object: THREE.Object3D, axis: THREE.Vector3, radians: number) {
        let rotObjectMatrix = new THREE.Matrix4()
        rotObjectMatrix.makeRotationAxis(axis.normalize(), radians)

        // old code for Three.JS pre r54:
        // object.matrix.multiplySelf(rotObjectMatrix)      // post-multiply
        // new code for Three.JS r55+:
        object.matrix.multiply(rotObjectMatrix)

        // old code for Three.js pre r49:
        // object.rotation.getRotationFromMatrix(object.matrix, object.scale)
        // old code for Three.js r50-r58:
        // object.rotation.setEulerFromRotationMatrix(object.matrix)
        // new code for Three.js r59+:
        object.rotation.setFromRotationMatrix(object.matrix)
    }

    // A method to update an object position when orbiting an axis
    updateOrbitPosition(positionObj: THREE.Vector3, axisA: string, axisB: string, type: string, speed: number) {
        if (type === 'sphere') {
            positionObj[axisA] = positionObj[axisA] * Math.cos(speed) + positionObj[axisB] * Math.sin(speed)
            positionObj[axisB] = positionObj[axisB] * Math.cos(speed) - positionObj[axisA] * Math.sin(speed)
        } else if (type === 'ellipsis') {
            // Semimajor and semiminor axes
            let a = 15 * 20
            let b = 8 * 20
            // Hardcoded value for now, the three is a dampening
            this.alpha += (speed / 3) * this.direction
            if (this.alpha === 90) {
                this.direction = -1
            } else if (this.alpha === 0) {
                this.direction = 1
            }
            // The zeroes are the center of the ellipsis, since our model is at the origin
            // This is zero
            positionObj[axisA] = 0 + (a * Math.cos(this.alpha))
            positionObj[axisB] = 0 + (b * Math.sin(this.alpha))
        }
    }

    updatePosition(positionObj: any, animConfig: AnimationConfig) {
        if (animConfig && animConfig.animate) {
            // We are orbitting around another object
            if (animConfig.orbit && animConfig.refPoint) {
                let axesKeys = []
                Object.keys(animConfig.direction).forEach((k) => {
                    if (!animConfig.direction[k]) axesKeys.push(k)
                })
                this.updateOrbitPosition(positionObj, axesKeys[0], axesKeys[1], 'sphere', this.rSpeed * animConfig.animRate)
            // We are just moving the object along a path
            } else if (animConfig.translation) {
                // If this is the first time
                if (!animConfig.path && animConfig.controlPoints && animConfig.controlPoints >= 1) {
                    // Destination minus the origin split into the number of control points
                    let deltaX = (animConfig.refPoint.x - positionObj.x) / (animConfig.controlPoints + 1)
                    let deltaY = (animConfig.refPoint.y - positionObj.y) / (animConfig.controlPoints + 1)
                    let deltaZ = (animConfig.refPoint.z - positionObj.z) / (animConfig.controlPoints + 1)

                    // Only animate if we have a significant distance
                    if (Math.abs(deltaX) > this.threshold || Math.abs(deltaY) > this.threshold || Math.abs(deltaZ) > this.threshold) {
                        let pathPoints = [new THREE.Vector3(positionObj.x, positionObj.y, positionObj.z)]
                        for (let i = 1; i <= animConfig.controlPoints; i++) {
                            pathPoints.push(new THREE.Vector3(
                                positionObj.x + deltaX * i,
                                positionObj.y + deltaY * i,
                                positionObj.z + deltaZ * i
                            ))
                        }
                        pathPoints.push(new THREE.Vector3(animConfig.refPoint.x, animConfig.refPoint.y, animConfig.refPoint.z))
                        // Only curve for now
                        animConfig.path = new THREE.CatmullRomCurve3(pathPoints)
                        animConfig.counter = 0
                    // If we don't stop the animation
                    } else {
                        animConfig.animate = false
                    }
                }

                // Only curve for now
                if (animConfig.path && animConfig.path instanceof THREE.Curve) {
                    (animConfig.counter < 1) ? animConfig.counter += this.tSpeed * animConfig.animRate : animConfig.counter = 1
                    let newPos = animConfig.path.getPoint(animConfig.counter)
                    positionObj.x = newPos.x
                    positionObj.y = newPos.y
                    positionObj.z = newPos.z

                    // Test if the animation is done
                    if (animConfig.counter >= 1) {
                        animConfig.animate = false
                        animConfig.counter = 0
                        animConfig.path = undefined
                    }
                }
            }
        }
    }
}