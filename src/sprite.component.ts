import { Directive, Input } from '@angular/core'

import * as THREE from 'three'

@Directive({ selector: 'three-sprite' })
export class SpriteComponent {
    spriteArray: THREE.Sprite[] = []
    object: THREE.Mesh
    canvasBaseWidth: number = 512
    canvasBaseHeight: number = 1024

    ngOnInit() {}

    addSprite ( message, parameters ) {
        this.spriteArray.push(this.makeTextSprite(message, parameters))
    }

    makeTextSprite( message, parameters ) {
        if ( parameters === undefined ) parameters = {}

        // Initial parameters that can be passed in
        var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial"
        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18
        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4
        var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 }
        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 }
        // Sprite alignment is not present in the version used here
        //var spriteAlignment = parameters.hasOwnProperty("alignment") ? parameters["alignment"] : THREE.SpriteAlignment.topLeft
        //var spriteAlignment = THREE['SpriteAlignment'].topLeft

        // Add the context canvas so we can calculate the width and height
        var canvas = document.createElement('canvas')
        // Set the canvas dimension to the basic dynamic values
        canvas.width = this.canvasBaseWidth
        canvas.height = this.canvasBaseHeight

        var context = canvas.getContext('2d')
        context.font = "Bold " + fontsize + "px " + fontface

        // Using the context get the text width
        var metrics = context.measureText( message )
        var textWidth = metrics.width

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
        var texture = new THREE.Texture(canvas)
        texture.needsUpdate = true
        //var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
        var spriteMaterial = new THREE.SpriteMaterial( { map: texture } )
        var sprite = new THREE.Sprite( spriteMaterial )
        sprite.scale.set(100,200,1.0)
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
