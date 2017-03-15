export interface AnimationConfig {
    // A boolean to toggle the animation on and off
    animate: boolean
    // A boolean to mark if an object is orbiting another
    orbit?: boolean
    // A boolean to mark if the object is rotating according to an axis
    rotation?: boolean
    // A boolean to mark if the object is moving along a path
    translation?: boolean
    // The reference point to orbit around
    refPoint?: THREE.Vector3
    // The direction vector to move objects forward
    direction?: THREE.Vector3
    // A path to move an object along, a curve or a line
    path?: THREE.Curve<any> | THREE.Line
    // A number of control point for the path
    controlPoints?: number
    // A speed multiplier for the animations
    animRate: number
    // A counter to move along the path
    counter?: number
}
