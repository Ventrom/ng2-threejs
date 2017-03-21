import { Directive, Input } from '@angular/core'

import * as THREE from 'three'

@Directive({ selector: 'three-skybox' })
export class SkyboxComponent {
    @Input() defaultAssets: boolean = true
    @Input() boxSize: number = 10000
    @Input() textureUrl: string
    @Input() assets: string[]
    manager: THREE.LoadingManager = new THREE.LoadingManager()
    loader: THREE.ImageLoader | THREE.TextureLoader
    objects = []

    ngOnInit() {
        //TODO: fix loading the skybox with a single image
        if (!this.defaultAssets && this.textureUrl) {
            this.loader = new THREE.ImageLoader(this.manager)
            this.loader.load(
                // The resource URL
                this.textureUrl,
                // The function called when loading the image
                this.cutImageUp.bind(this)
            )
        } else {
            let placeholder = this.createPlaceholder()
            this.loader = new THREE.ImageLoader(this.manager)
            for (let asset of this.assets) {
                let texture = new THREE.Texture(placeholder)
                let material = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 })

                this.objects.push(material)
                this.loader.load(`${asset}`, this.createTexture(texture, material))
            }
        }

        this.manager.onProgress = (item, loaded, total) => { }
    }

    cutImageUp(image) {
        // Cut up source image into 12 separate image tiles, numbered 0..11
        let imagePieces = []
        let item_num = -1
        let numCols = 4, numRows = 3

        // Assume any source image is tiled 4 columns(x) by 3 rows(y)
        // NB canvas origin is Top Left corner, X is left to right, Y is top to bottom

        // We use the following mapping scheme to reference the tiles in the source image:-
        //
        // Personal             [x,y] tile coordinates    xyz positions            Required tile
        // tile numbering                                 of tiles in scene        sequence in Three.js
        //                                                                         array

        // [ 0] [ 3] [ 6] [ 9]  [0,0] [1,0] [2,0] [3,0]   [  ] [py] [  ] [  ]      [ ] [2] [ ] [ ]
        // [ 1] [ 4] [ 7] [10]  [0,1] [1,1] [2,1] [3,1]   [nx] [pz] [px] [nz]      [1] [4] [0] [5]
        // [ 2] [ 5] [ 8] [11]  [0,2] [1,2] [2,2] [3,2]   [  ] [ny] [  ] [  ]      [ ] [3] [ ] [ ]

        let image_file = this.textureUrl
        let tileWidth = 512
        let tileHeight = 512

        for(let xxx = 0; xxx < numCols; ++xxx)
        {
            for(let yyy = 0; yyy < numRows; ++yyy)
            {
                let tileCanvas = this.createCanvas(tileWidth, tileHeight)
                let tileContext = tileCanvas.getContext('2d')

                tileContext.drawImage(
                    image,
                    xxx * tileWidth, yyy * tileHeight,
                    tileWidth, tileHeight,
                    0, 0, tileCanvas.width, tileCanvas.height)

                imagePieces.push(tileCanvas.toDataURL())
            }
        }

        // Required sequence of tile view directions = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"]
        for (let iii = 0; iii < 6; iii++) //... select the right tiles for the 6 different faces of the sky box
        {
            let imagePiece_num = -1

            //... we associate the centre tile (4) of the cross with the zpos direction
                 if (iii == 0) imagePiece_num =  7;//... xpos
            else if (iii == 1) imagePiece_num =  1;//... xneg
            else if (iii == 2) imagePiece_num =  3;//... ypos
            else if (iii == 3) imagePiece_num =  5;//... yneg
            else if (iii == 4) imagePiece_num =  4;//... zpos
            else if (iii == 5) imagePiece_num = 10;//... zneg

            let loader = new THREE.TextureLoader()
            this.objects.push(new THREE.MeshBasicMaterial({
                map: loader.load(imagePieces[imagePiece_num]),
                side: THREE.FrontSide // <== not intuitive
            }))
        }
    }

    createTexture(texture, material) {
        return function(image) {
            texture.image = image
            texture.needsUpdate = true
        }
    }

    createCanvas(width?: number, height?: number) {
        let canvas = document.createElement('canvas')
        canvas.width = (width) ? width : 128
        canvas.height = (height) ? height : 128

        return canvas
    }

    createPlaceholder() {
        let texture = this.createCanvas()

        let context = texture.getContext( '2d' )
        context.fillStyle = 'rgb(0,0,0)'
        context.fillRect(0, 0, texture.width, texture.height)

        return texture
    }

    attachScene(scene) {
        this.manager.onLoad = () => {
            let box = new THREE.BoxGeometry(this.boxSize, this.boxSize, this.boxSize)
            let material = new THREE.MultiMaterial(this.objects)
            let mesh = new THREE.Mesh(box, material)
            mesh.rotation.x = 90 * (Math.PI / 180)
            mesh.scale.x = -1
            this.objects.push(mesh)
            scene.add(mesh)
        }
    }
}
