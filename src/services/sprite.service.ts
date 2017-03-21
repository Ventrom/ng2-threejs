import { Injectable } from '@angular/core'

import * as THREE from 'three'

@Injectable()
export class SpriteService {
    canvasBaseWidth: number = 512
    canvasBaseHeight: number = 1024
    spriteScale: THREE.Vector3 = new THREE.Vector3(100, 200, 1)

    ngOnInit() {}

    setBaseWidth(width: number) {
        this.canvasBaseWidth = width
    }

    setBaseHeight(height: number) {
        this.canvasBaseHeight = height
    }

    addSpritesToFaces(geometry: THREE.Geometry | THREE.BufferGeometry, alignment: string, msgArray?: string[], debug?: boolean) {
        if (!geometry['faces']) return

        // Add an empty sprite array and populate it with a sprite for each face
        let spritesArray = []
        geometry['faces'].forEach((f, i) => {
            // Add it to the origin by default
            let sPos = new THREE.Vector3(0, 0, 0)
            // Use the alignemtn to recalculate the position related to this face
            if (alignment === 'center') {
                sPos = f.centroid.clone()
            }
            // Make the sprites a bit far from the mesh
            sPos = sPos.multiplyScalar(1.2)

            // Load a default text and if we passed an array get the text from this face index
            let currentText = ' ' + sPos.x.toFixed(2) + ', ' + sPos.y.toFixed(2) + ', ' + sPos.z.toFixed(2) + ' '
            if (msgArray && msgArray.length > i) {
                currentText = msgArray[i]
            }

            // The first parameter is the text message to be used on the sprite. At the moment
            // only a certain length of message is supported properly
            spritesArray.push(this.createTextSprite(
                currentText,
                { fontsize: 32, backgroundColor: {r:100, g:100, b:255, a:1} },
                sPos
            ))
            if (debug) {
                console.log('Current face:')
                console.log(f)
                console.log('Current centroid position:')
                console.log(sPos)
                console.log('Current sprite info: ')
                console.log(spritesArray[i])
            }
        })

        return spritesArray
    }

    createTextSprite(message: string, parameters: any, position?: THREE.Vector3) {
        if ( parameters === undefined ) parameters = {}

        // Initial parameters that can be passed in
        let fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial"
        let fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18
        let borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4
        let borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 }
        let backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 }
        // Sprite alignment is not present in the version used here
        //let spriteAlignment = parameters.hasOwnProperty("alignment") ? parameters["alignment"] : THREE.SpriteAlignment.topLeft
        //let spriteAlignment = THREE['SpriteAlignment'].topLeft

        // Add the context canvas so we can calculate the width and height
        let canvas = document.createElement('canvas')
        // Set the canvas dimension to the basic dynamic values
        canvas.width = this.canvasBaseWidth
        canvas.height = this.canvasBaseHeight

        let context = canvas.getContext('2d')
        context.font = "Bold " + fontsize + "px " + fontface

        // Using the context get the text width
        let metrics = context.measureText( message )
        let textWidth = metrics.width

        // Border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")"
        context.lineWidth = borderThickness

        // Calculate the number of lines we need to display the message
        let lines = (textWidth <= canvas.width) ? 1 : Math.ceil(textWidth/(canvas.width - 2 * borderThickness))

        // Recalculate the lines and text adding some spaces, two characters for the borders and two for the margins
        let extraCharacters = 2 * lines
        let newMessage = message + Array(extraCharacters).join(" ")
        textWidth = context.measureText(newMessage).width
        if (lines > 1) {
            lines = (textWidth <= canvas.width) ? 1 : Math.ceil(textWidth/(canvas.width - 2 * borderThickness))
        }
        let lineTextWidth = textWidth/lines

        // Background color
        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")"

        // Create the round rect, this will be the rounded box behind the text
        // The rect parameters are:
        // ctx      - Specifies the context that will be written
        // x        - The x coordinate where to start painting the rect (relative to the canvas)
        // y        - The y coordinate where to start painting the rect (relative to the canvas)
        // w        - The width of the rect
        // h        - The height of the rect
        // r        - The border
        // 1.4 is an extra height factor for text below baseline: g,j,p,q
        let h = fontsize * 1.4 * lines + borderThickness
        let w = lineTextWidth + 2 * borderThickness
        let x = canvas.width/2 - w/2
        let y = canvas.height/2 - h/2
        let r = 6
        this.roundRect(context, x, y, w, h, r)

        // Text color. This needs to be done after the above call or the entire rect will be black
        context.fillStyle = "rgba(0, 0, 0, 1.0)"

        // Splitting the messages in multiple lines if needed
        let messageArray = []
        if (lines > 1) {
            // The number two here is one space for each side
            let maxPosition = Math.floor(message.length/lines)-2
            messageArray = message.match(new RegExp('(.|[\r\n]){0,' + maxPosition + '}', 'g'))
        } else {
            messageArray.push(message)
        }
        messageArray.forEach((m, i) => {
            // The fill text parameters are:
            // text     - Specifies the text that will be written on the canvas
            // x        - The x coordinate where to start painting the text (relative to the canvas)
            // y        - The y coordinate where to start painting the text (relative to the canvas)
            // maxWidth - Optional. The maximum allowed width of the text, in pixels
            // Add spaces for a nicer look
            context.fillText(' ' + m + ' ', canvas.width/2 - w/2, canvas.height/2 - h/2 + fontsize * (i+1) + borderThickness, canvas.width - 2 * borderThickness)
        })

        // canvas contents will be used for a texture
        let texture = new THREE.Texture(canvas)
        texture.needsUpdate = true
        //var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
        let spriteMaterial = new THREE.SpriteMaterial( { map: texture } )
        let sprite = new THREE.Sprite( spriteMaterial )

        // Apply scale and position the sprite
        sprite.scale.set(this.spriteScale.x, this.spriteScale.y, this.spriteScale.z)
        if (position) sprite.position.set(position.x, position.y, position.z)

        return sprite
    }

    // function for drawing rounded rectangles
    roundRect (ctx, x, y, w, h, r) {
        ctx.beginPath()
        ctx.moveTo(x+r, y)
        ctx.lineTo(x+w-r, y)
        ctx.quadraticCurveTo(x+w, y, x+w, y+r)
        ctx.lineTo(x+w, y+h-r)
        ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h)
        ctx.lineTo(x+r, y+h)
        ctx.quadraticCurveTo(x, y+h, x, y+h-r)
        ctx.lineTo(x, y+r)
        ctx.quadraticCurveTo(x, y, x+r, y)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
    }
}
