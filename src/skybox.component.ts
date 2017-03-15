import { Directive, Input } from '@angular/core'

import * as THREE from 'three'

@Directive({ selector: 'three-skybox' })
export class SkyboxComponent {
    @Input() defaultAssets: boolean = true
    @Input() boxSize: number = 10000
    @Input() textureUrl: string

    static assets = [
        'assets/skyrt.jpg',
        'assets/skylf.jpg',
        'assets/skyup.jpg',
        'assets/skydn.jpg',
        'assets/skybk.jpg',
        'assets/skyft.jpg'
    ]

    manager = new THREE.LoadingManager()
    objects = []

    ngOnInit() {
        let placeholder = this.createPlaceholder()

        var loader = new THREE.TextureLoader()
        //TODO: fix loading the skybox with a single image
        if (!this.defaultAssets && this.textureUrl) {
            let t = []
            for ( var i = 0; i < 6; i ++ ) {
                t[i] = loader.load(this.textureUrl) //2048x256 // changed
                t[i].repeat.x  = 1 / 8
                t[i].offset.x = i / 8
                //t[i].magFilter = THREE.NearestFilter
                t[i].minFilter = THREE.NearestFilter
                t[i].generateMipmaps = false
                this.objects.push(new THREE.MeshBasicMaterial({ map: t[i] }))
            }
        } else {
            for(const asset of SkyboxComponent.assets) {
                let texture = new THREE.Texture(placeholder)
                let loader = new THREE.ImageLoader(this.manager)
                let material = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 })

                this.objects.push(material)
                loader.load(`${asset}`, this.createTexture(texture, material))
            }
        }

        this.manager.onProgress = (item, loaded, total) => { }
    }

    createTexture(texture, material) {
        return function(image) {
            texture.image = image
            texture.needsUpdate = true
        }
    }

    createPlaceholder() {
        let texture = document.createElement('canvas')
            texture.width = 128
            texture.height = 128

        let context = texture.getContext( '2d' )
            context.fillStyle = 'rgb(0,0,0)'
            context.fillRect(0, 0, texture.width, texture.height)

        return texture
    }

    attachScene(scene) {
        this.manager.onLoad = () => {
            let box = new THREE.BoxGeometry(this.boxSize, this.boxSize, this.boxSize)
            let material = new THREE.MeshFaceMaterial(this.objects)
            let mesh = new THREE.Mesh(box, material)
            mesh.rotation.x = 90 * (Math.PI / 180)
            mesh.scale.x = - 1
            this.objects.push(mesh)
            scene.add(mesh)
        }
    }
}
