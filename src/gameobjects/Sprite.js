/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2014 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* @class Phaser.Sprite
*
* @classdesc Create a new `Sprite` object. Sprites are the lifeblood of your game, used for nearly everything visual.
*
* At its most basic a Sprite consists of a set of coordinates and a texture that is rendered to the canvas.
* They also contain additional properties allowing for physics motion (via Sprite.body), input handling (via Sprite.input),
* events (via Sprite.events), animation (via Sprite.animations), camera culling and more. Please see the Examples for use cases.
*
* @constructor
* @extends PIXI.Sprite
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} x - The x coordinate (in world space) to position the Sprite at.
* @param {number} y - The y coordinate (in world space) to position the Sprite at.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture.
* @param {string|number} frame - If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
*/
Phaser.Sprite = function (game, x, y, key, frame) {

    x = x || 0;
    y = y || 0;
    key = key || null;
    frame = frame || null;

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;

    /**
    * @property {string} name - The user defined name given to this Sprite.
    * @default
    */
    this.name = '';

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.SPRITE;

    /**
    * @property {number} z - The z-depth value of this object within its Group (remember the World is a Group as well). No two objects in a Group can have the same z value.
    */
    this.z = 0;

    /**
    * @property {Phaser.Events} events - The Events you can subscribe to that are dispatched when certain things happen on this Sprite or its components.
    */
    this.events = new Phaser.Events(this);

    /**
    * @property {Phaser.AnimationManager} animations - This manages animations of the sprite. You can modify animations through it (see Phaser.AnimationManager)
    */
    this.animations = new Phaser.AnimationManager(this);

    /**
    *  @property {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture, BitmapData or PIXI.Texture.
    */
    this.key = key;

    PIXI.Sprite.call(this, PIXI.TextureCache['__default']);

    this.position.set(x, y);

    /**
    * @property {Phaser.Point} world - The world coordinates of this Sprite. This differs from the x/y coordinates which are relative to the Sprites container.
    */
    this.world = new Phaser.Point(x, y);

    /**
    * Should this Sprite be automatically culled if out of range of the camera?
    * A culled sprite has its renderable property set to 'false'.
    * Be advised this is quite an expensive operation, as it has to calculate the bounds of the object every frame, so only enable it if you really need it.
    *
    * @property {boolean} autoCull - A flag indicating if the Sprite should be automatically camera culled or not.
    * @default
    */
    this.autoCull = false;

    /**
    * @property {Phaser.InputHandler|null} input - The Input Handler for this object. Needs to be enabled with image.inputEnabled = true before you can use it.
    */
    this.input = null;

    /**
    * By default Sprites won't add themselves to any physics system and their physics body will be `null`.
    * To enable them for physics you need to call `game.physics.enable(sprite, system)` where `sprite` is this object
    * and `system` is the Physics system you want to use to manage this body. Once enabled you can access all physics related properties via `Sprite.body`.
    *
    * Important: Enabling a Sprite for P2 or Ninja physics will automatically set `Sprite.anchor` to 0.5 so the physics body is centered on the Sprite.
    * If you need a different result then adjust or re-create the Body shape offsets manually, and/or reset the anchor after enabling physics.
    *
    * @property {Phaser.Physics.Arcade.Body|Phaser.Physics.P2.Body|Phaser.Physics.Ninja.Body|null} body
    * @default
    */
    this.body = null;

    /**
    * @property {boolean} alive - A useful boolean to control if the Sprite is alive or dead (in terms of your gameplay, it doesn't effect rendering). Also linked to Sprite.health and Sprite.damage.
    * @default
    */
    this.alive = true;

    /**
    * @property {number} health - Health value. Used in combination with damage() to allow for quick killing of Sprites.
    */
    this.health = 1;

    /**
    * If you would like the Sprite to have a lifespan once 'born' you can set this to a positive value. Handy for particles, bullets, etc.
    * The lifespan is decremented by game.time.elapsed each update, once it reaches zero the kill() function is called.
    * @property {number} lifespan - The lifespan of the Sprite (in ms) before it will be killed.
    * @default
    */
    this.lifespan = 0;

    /**
    * If true the Sprite checks if it is still within the world each frame, when it leaves the world it dispatches Sprite.events.onOutOfBounds
    * and optionally kills the sprite (if Sprite.outOfBoundsKill is true). By default this is disabled because the Sprite has to calculate its
    * bounds every frame to support it, and not all games need it. Enable it by setting the value to true.
    * @property {boolean} checkWorldBounds
    * @default
    */
    this.checkWorldBounds = false;

    /**
    * @property {boolean} outOfBoundsKill - If true Sprite.kill is called as soon as Sprite.inWorld returns false, as long as Sprite.checkWorldBounds is true.
    * @default
    */
    this.outOfBoundsKill = false;

    /**
    * @property {boolean} debug - Handy flag to use with Game.enableStep
    * @default
    */
    this.debug = false;

    /**
    * @property {Phaser.Point} cameraOffset - If this object is fixedToCamera then this stores the x/y offset that its drawn at, from the top-left of the camera view.
    */
    this.cameraOffset = new Phaser.Point();

    /**
    * @property {Phaser.Rectangle} cropRect - The Rectangle used to crop the texture. Set this via Sprite.crop. Any time you modify this property directly you must call Sprite.updateCrop.
    * @default
    */
    this.cropRect = null;

    /**
    * A small internal cache:
    *
    * 0 = previous position.x
    * 1 = previous position.y
    * 2 = previous rotation
    * 3 = renderID
    * 4 = fresh? (0 = no, 1 = yes)
    * 5 = outOfBoundsFired (0 = no, 1 = yes)
    * 6 = exists (0 = no, 1 = yes)
    * 7 = fixed to camera (0 = no, 1 = yes)
    * 8 = destroy phase? (0 = no, 1 = yes)
    * 9 = texture x
    * 10 = texture y
    * 11 = texture width
    * 12 = texture height
    * 13 = texture spriteSourceSizeX
    * 14 = texture spriteSourceSizeY
    * 15 = calculated trim x
    * 16 = calculated trim y
    * 17 = trim actualWidth
    * 18 = trim actualHeight
    * @property {Array} _cache
    * @private
    */
    this._cache = [ 0, 0, 0, 0, 1, 
                    0, 1, 0, 0, 0, 
                    0, 0, 0, 0, 0, 
                    0, 0, 0, 0 ];

    /**
    * @property {Phaser.Rectangle} _bounds - Internal cache var.
    * @private
    */
    this._bounds = new Phaser.Rectangle();

    this.loadTexture(key, frame);

};

Phaser.Sprite.prototype = Object.create(PIXI.Sprite.prototype);
Phaser.Sprite.prototype.constructor = Phaser.Sprite;

/**
* Automatically called by World.preUpdate.
*
* @method Phaser.Sprite#preUpdate
* @memberof Phaser.Sprite
* @return {boolean} True if the Sprite was rendered, otherwise false.
*/
Phaser.Sprite.prototype.preUpdate = function() {

    if (this._cache[4] === 1 && this.exists)
    {
        this.world.setTo(this.parent.position.x + this.position.x, this.parent.position.y + this.position.y);
        this.worldTransform.tx = this.world.x;
        this.worldTransform.ty = this.world.y;
        this._cache[0] = this.world.x;
        this._cache[1] = this.world.y;
        this._cache[2] = this.rotation;

        if (this.body)
        {
            this.body.preUpdate();
        }

        this._cache[4] = 0;

        return false;
    }

    this._cache[0] = this.world.x;
    this._cache[1] = this.world.y;
    this._cache[2] = this.rotation;

    if (!this.exists || !this.parent.exists)
    {
        //  Reset the renderOrderID
        this._cache[3] = -1;
        return false;
    }

    if (this.lifespan > 0)
    {
        this.lifespan -= this.game.time.elapsed;

        if (this.lifespan <= 0)
        {
            this.kill();
            return false;
        }
    }

    //  Cache the bounds if we need it
    if (this.autoCull || this.checkWorldBounds)
    {
        this._bounds.copyFrom(this.getBounds());
    }

    if (this.autoCull)
    {
        //  Won't get rendered but will still get its transform updated
        this.renderable = this.game.world.camera.screenView.intersects(this._bounds);
    }

    if (this.checkWorldBounds)
    {
        //  The Sprite is already out of the world bounds, so let's check to see if it has come back again
        if (this._cache[5] === 1 && this.game.world.bounds.intersects(this._bounds))
        {
            this._cache[5] = 0;
            this.events.onEnterBounds.dispatch(this);
        }
        else if (this._cache[5] === 0 && !this.game.world.bounds.intersects(this._bounds))
        {
            //  The Sprite WAS in the screen, but has now left.
            this._cache[5] = 1;
            this.events.onOutOfBounds.dispatch(this);

            if (this.outOfBoundsKill)
            {
                this.kill();
                return false;
            }
        }
    }

    this.world.setTo(this.game.camera.x + this.worldTransform.tx, this.game.camera.y + this.worldTransform.ty);

    if (this.visible)
    {
        this._cache[3] = this.game.stage.currentRenderOrderID++;
    }

    this.animations.update();

    if (this.body)
    {
        this.body.preUpdate();
    }

    //  Update any Children
    for (var i = 0, len = this.children.length; i < len; i++)
    {
        this.children[i].preUpdate();
    }

    return true;

};

/**
* Override and use this function in your own custom objects to handle any update requirements you may have.
* Remember if this Sprite has any children you should call update on them too.
*
* @method Phaser.Sprite#update
* @memberof Phaser.Sprite
*/
Phaser.Sprite.prototype.update = function() {

};

/**
* Internal function called by the World postUpdate cycle.
*
* @method Phaser.Sprite#postUpdate
* @memberof Phaser.Sprite
*/
Phaser.Sprite.prototype.postUpdate = function() {

    if (this.key instanceof Phaser.BitmapData)
    {
        this.key.render();
    }

    if (this.exists && this.body)
    {
        this.body.postUpdate();
    }

    //  Fixed to Camera?
    if (this._cache[7] === 1)
    {
        this.position.x = (this.game.camera.view.x + this.cameraOffset.x) / this.game.camera.scale.x;
        this.position.y = (this.game.camera.view.y + this.cameraOffset.y) / this.game.camera.scale.y;
    }

    //  Update any Children
    for (var i = 0, len = this.children.length; i < len; i++)
    {
        this.children[i].postUpdate();
    }

};

/**
* Changes the Texture the Sprite is using entirely. The old texture is removed and the new one is referenced or fetched from the Cache.
* This causes a WebGL texture update, so use sparingly or in low-intensity portions of your game.
*
* @method Phaser.Sprite#loadTexture
* @memberof Phaser.Sprite
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture, BitmapData or PIXI.Texture.
* @param {string|number} [frame] - If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
*/
Phaser.Sprite.prototype.loadTexture = function (key, frame) {

    frame = frame || 0;

    this.key = key;

    if (key instanceof Phaser.RenderTexture)
    {
        this.key = key.key;
        this.setTexture(key);
    }
    else if (key instanceof Phaser.BitmapData)
    {
        this.setTexture(key.texture);
    }
    else if (key instanceof PIXI.Texture)
    {
        this.setTexture(key);
    }
    else
    {
        if (key === null || typeof key === 'undefined')
        {
            this.key = '__default';
            this.setTexture(PIXI.TextureCache[this.key]);
        }
        else if (typeof key === 'string' && !this.game.cache.checkImageKey(key))
        {
            this.key = '__missing';
            this.setTexture(PIXI.TextureCache[this.key]);
        }
        else
        {
            this.setTexture(new PIXI.Texture(PIXI.BaseTextureCache[key]));
            this.animations.loadFrameData(this.game.cache.getFrameData(key), frame);
        }
    }

};

/**
* Resets the Texture frame dimensions that the Sprite uses for rendering.
*
* @method Phaser.Sprite#resetFrame
* @memberof Phaser.Sprite
*/
Phaser.Sprite.prototype.resetFrame = function() {

    this.texture.frame.x = this._cache[9];
    this.texture.frame.y = this._cache[10];
    this.texture.frame.width = this._cache[11];
    this.texture.frame.height = this._cache[12];

    if (this.texture.trim)
    {
        this.texture.trim.x = this._cache[13];
        this.texture.trim.y = this._cache[14];
        this.texture.trim.width = this._cache[17];
        this.texture.trim.height = this._cache[18];
    }

    if (this.game.renderType === Phaser.WEBGL)
    {
        PIXI.WebGLRenderer.updateTextureFrame(this.texture);
    }

};

/**
* Sets the Texture frame the Sprite uses for rendering.
* This is primarily an internal method used by Sprite.loadTexture, although you may call it directly.
*
* @method Phaser.Sprite#setFrame
* @memberof Phaser.Sprite
* @param {Phaser.Frame} frame - The Frame to be used by the Sprite texture.
*/
Phaser.Sprite.prototype.setFrame = function(frame) {

    this._cache[9] = frame.x;
    this._cache[10] = frame.y;
    this._cache[11] = frame.width;
    this._cache[12] = frame.height;
    this._cache[13] = frame.spriteSourceSizeX;
    this._cache[14] = frame.spriteSourceSizeY;
    this._cache[17] = frame.sourceSizeW;
    this._cache[18] = frame.sourceSizeH;

    this.texture.frame.x = frame.x;
    this.texture.frame.y = frame.y;
    this.texture.frame.width = frame.width;
    this.texture.frame.height = frame.height;

    this.texture.crop.x = frame.x;
    this.texture.crop.y = frame.y;
    this.texture.crop.width = frame.width;
    this.texture.crop.height = frame.height;

    if (frame.trimmed)
    {
        if (this.texture.trim)
        {
            this.texture.trim.x = frame.spriteSourceSizeX;
            this.texture.trim.y = frame.spriteSourceSizeY;
            this.texture.trim.width = frame.sourceSizeW;
            this.texture.trim.height = frame.sourceSizeH;
        }
        else
        {
            this.texture.trim = { x: frame.spriteSourceSizeX, y: frame.spriteSourceSizeY, width: frame.sourceSizeW, height: frame.sourceSizeH };
        }

        this.texture.width = frame.sourceSizeW;
        this.texture.height = frame.sourceSizeH;
        this.texture.frame.width = frame.sourceSizeW;
        this.texture.frame.height = frame.sourceSizeH;
    }

    if (this.cropRect)
    {
        this.updateCrop();
    }
    else
    {
        if (this.game.renderType === Phaser.WEBGL)
        {
            PIXI.WebGLRenderer.updateTextureFrame(this.texture);
        }
    }

};

/**
* If you have set a crop rectangle on this Sprite via Sprite.crop and since modified the Sprite.cropRect property (or the rectangle it references)
* then you need to update the crop frame by calling this method.
*
* @method Phaser.Sprite#updateCrop
* @memberof Phaser.Sprite
*/
Phaser.Sprite.prototype.PREupdateCrop = function() {

    if (!this.cropRect)
    {
        return;
    }

    if (this.texture.trim)
    {
        this._cache[15] = this._cache[9] + this.cropRect.x - this._cache[13];

        if (this._cache[15] < this._cache[9])
        {
            this._cache[15] = this._cache[9];
        }

        this._cache[16] = this._cache[10] + this.cropRect.y - this._cache[14];

        if (this._cache[16] < this._cache[10])
        {
            this._cache[16] = this._cache[10];
        }

        this.texture.frame.x = this._cache[15];
        this.texture.frame.y = this._cache[16];

        this._cache[15] = 0;
        this._cache[16] = 0;

        if (this.cropRect.x === 0)
        {
            this._cache[15] = this._cache[13];
        }

        if (this.cropRect.y === 0)
        {
            this._cache[16] = this._cache[14];
        }

        this.texture.frame.width = this.cropRect.width - this._cache[15];
        this.texture.frame.height = this.cropRect.height - this._cache[16];

        this.texture.trim.x = this._cache[15];
        this.texture.trim.y = this._cache[16];
        this.texture.trim.width = this.cropRect.width;
        this.texture.trim.height = this.cropRect.height;
    }
    else
    {
        this.texture.frame.x = this._cache[9] + this.cropRect.x;
        this.texture.frame.y = this._cache[10] + this.cropRect.y;
        this.texture.frame.width = this.cropRect.width;
        this.texture.frame.height = this.cropRect.height;
    }

    if (this.game.renderType === Phaser.WEBGL)
    {
        PIXI.WebGLRenderer.updateTextureFrame(this.texture);
    }

};


Phaser.Sprite.prototype.updateCrop = function() {

    if (!this.cropRect)
    {
        return;
    }

    if (this.texture.trim)
    {
/*
                var frame = this.texture.frame;

                var trim =  texture.trim;

                RENDER NON-TRIMMED FRAME, only difference is the x/y coords it renders at

                context.drawImage(this.texture.baseTexture.source,
                               frame.x,
                               frame.y,
                               frame.width,
                               frame.height,
                               (this.anchor.x) * -frame.width,
                               (this.anchor.y) * -frame.height,
                               frame.width,
                               frame.height);

    "filename": "razor_rain_vertical_23",
    "frame": {"x":175,"y":1444,"w":174,"h":360},            <- the actual area of the PNG to cut
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":174,"h":360},      <- the offset applied to the Sprite x/y coords to draw the frame to
    "sourceSize": {"w":174,"h":360}                         <- the frame size

    This frame will render at:

    (this.anchor.x) * -frame.width
    0               * -174          = 0

    Remember - the setTransform has already offset the render by the Sprite.x/y value inherited from the display list

                RENDER A TRIMMED FRAME

                context.drawImage(this.texture.baseTexture.source,
                               frame.x,
                               frame.y,
                               frame.width,
                               frame.height,
                               trim.x - this.anchor.x * trim.width,
                               trim.y - this.anchor.y * trim.height,
                               frame.width,
                               frame.height);

    "filename": "razor_rain_vertical_23",               
    "frame": {"x":445,"y":245,"w":94,"h":282},          <- the actual area of the PNG to cut
    "trimmed": true,
    "spriteSourceSize": {"x":45,"y":0,"w":94,"h":282},  <- the offset applied to the Sprite x/y coords to draw the frame to AND the frame width/height
    "sourceSize": {"w":174,"h":360}                     <- the frame size

    This frame will render at:

    trim.x - this.anchor.x * trim.width             spriteSourceSize.x - this.anchor.x * sourceSize.w
    45     - 0             * 174        = 45

    trim.y - this.anchor.y * trim.height            spriteSourceSize.y - this.anchor.y * sourceSize.h
    0      - 0             * 360        = 0

    worldTransform uses texture.frame.width / height to work out offset from x/y

        this._cache[9] = frame.x;
        this._cache[10] = frame.y;
        this._cache[11] = frame.width;
        this._cache[12] = frame.height;
        this._cache[13] = frame.spriteSourceSizeX;
        this._cache[14] = frame.spriteSourceSizeY;
        this._cache[15] = trim calc x
        this._cache[16] = trim calc y
        this._cache[17] = frame.sourceSizeW;
        this._cache[18] = frame.sourceSizeH;
*/

        var tx = this._cache[9] - this._cache[13];
        var ty = this._cache[10] - this._cache[14];

        var r1 = new Phaser.Rectangle(this._cache[13], this._cache[14], this._cache[17], this._cache[18]);
        var r2 = new Phaser.Rectangle(this.cropRect.x + tx, this.cropRect.y + ty, this.cropRect.width, this.cropRect.height);
        var area = Phaser.Rectangle.intersection(r1, r2);

        //  This will cut the cropped area instead of the whole frame

        this.texture.frame.x = this._cache[9] + area.x;
        this.texture.frame.y = this._cache[10] + area.y;
        this.texture.frame.width = area.width;
        this.texture.frame.height = area.height;

        this.texture.trim.width = area.width;
        this.texture.trim.height = area.height;

        //  But we still need to adjust the trim values

    }
    else
    {
        this.texture.frame.x = this._cache[9] + this.cropRect.x;
        this.texture.frame.y = this._cache[10] + this.cropRect.y;
        this.texture.frame.width = this.cropRect.width;
        this.texture.frame.height = this.cropRect.height;
    }


    if (this.game.renderType === Phaser.WEBGL)
    {
        PIXI.WebGLRenderer.updateTextureFrame(this.texture);
    }

};

/**
* Crop allows you to crop the texture used to display this Sprite.
* This modifies the core Sprite texture frame, so the Sprite width/height properties will adjust accordingly.
*
* Cropping takes place from the top-left of the Sprite and can be modified in real-time by either providing an updated rectangle object to Sprite.crop,
* or by modifying Sprite.cropRect (or a reference to it) and then calling Sprite.updateCrop.
*
* The rectangle object given to this method can be either a Phaser.Rectangle or any object so long as it has public x, y, width and height properties.
* A reference to the rectangle is stored in Sprite.cropRect unless the `copy` parameter is `true` in which case the values are duplicated to a local object.
*
* @method Phaser.Sprite#crop
* @memberof Phaser.Sprite
* @param {Phaser.Rectangle} rect - The Rectangle used during cropping. Pass null or no parameters to clear a previously set crop rectangle.
* @param {boolean} [copy=false] - If false Sprite.cropRect will be a reference to the given rect. If true it will copy the rect values into a local Sprite.cropRect object.
*/
Phaser.Sprite.prototype.crop = function(rect, copy) {

    if (typeof copy === 'undefined') { copy = false; }

    if (rect)
    {
        if (copy && this.cropRect !== null)
        {
            this.cropRect.setTo(rect.x, rect.y, rect.width, rect.height);
        }
        else if (copy && this.cropRect === null)
        {
            this.cropRect = new Phaser.Rectangle(rect.x, rect.y, rect.width, rect.height);
        }
        else
        {
            this.cropRect = rect;
        }

        this.updateCrop();
    }
    else
    {
        this.cropRect = null;
        this.resetFrame();
    }

};

/**
* Brings a 'dead' Sprite back to life, optionally giving it the health value specified.
* A resurrected Sprite has its alive, exists and visible properties all set to true.
* It will dispatch the onRevived event, you can listen to Sprite.events.onRevived for the signal.
*
* @method Phaser.Sprite#revive
* @memberof Phaser.Sprite
* @param {number} [health=1] - The health to give the Sprite.
* @return (Phaser.Sprite) This instance.
*/
Phaser.Sprite.prototype.revive = function(health) {

    if (typeof health === 'undefined') { health = 1; }

    this.alive = true;
    this.exists = true;
    this.visible = true;
    this.health = health;

    if (this.events)
    {
        this.events.onRevived.dispatch(this);
    }

    return this;

};

/**
* Kills a Sprite. A killed Sprite has its alive, exists and visible properties all set to false.
* It will dispatch the onKilled event, you can listen to Sprite.events.onKilled for the signal.
* Note that killing a Sprite is a way for you to quickly recycle it in a Sprite pool, it doesn't free it up from memory.
* If you don't need this Sprite any more you should call Sprite.destroy instead.
*
* @method Phaser.Sprite#kill
* @memberof Phaser.Sprite
* @return (Phaser.Sprite) This instance.
*/
Phaser.Sprite.prototype.kill = function() {

    this.alive = false;
    this.exists = false;
    this.visible = false;

    if (this.events)
    {
        this.events.onKilled.dispatch(this);
    }

    return this;

};

/**
* Destroys the Sprite. This removes it from its parent group, destroys the input, event and animation handlers if present
* and nulls its reference to game, freeing it up for garbage collection.
*
* @method Phaser.Sprite#destroy
* @memberof Phaser.Sprite
* @param {boolean} [destroyChildren=true] - Should every child of this object have its destroy method called?
*/
Phaser.Sprite.prototype.destroy = function(destroyChildren) {

    if (this.game === null || this._cache[8] === 1) { return; }

    if (typeof destroyChildren === 'undefined') { destroyChildren = true; }

    this._cache[8] = 1;

    if (this.parent)
    {
        if (this.parent instanceof Phaser.Group)
        {
            this.parent.remove(this);
        }
        else
        {
            this.parent.removeChild(this);
        }
    }

    if (this.input)
    {
        this.input.destroy();
    }

    if (this.animations)
    {
        this.animations.destroy();
    }

    if (this.body)
    {
        this.body.destroy();
    }

    if (this.events)
    {
        this.events.destroy();
    }

    var i = this.children.length;

    if (destroyChildren)
    {
        while (i--)
        {
            this.children[i].destroy(destroyChildren);
        }
    }
    else
    {
        while (i--)
        {
            this.removeChild(this.children[i]);
        }
    }

    this.alive = false;
    this.exists = false;
    this.visible = false;

    this.filters = null;
    this.mask = null;
    this.game = null;

    this._cache[8] = 0;

};

/**
* Damages the Sprite, this removes the given amount from the Sprites health property.
* If health is then taken below or is equal to zero `Sprite.kill` is called.
*
* @method Phaser.Sprite#damage
* @memberof Phaser.Sprite
* @param {number} amount - The amount to subtract from the Sprite.health value.
* @return (Phaser.Sprite) This instance.
*/
Phaser.Sprite.prototype.damage = function(amount) {

    if (this.alive)
    {
        this.health -= amount;

        if (this.health <= 0)
        {
            this.kill();
        }
    }

    return this;

};

/**
* Resets the Sprite. This places the Sprite at the given x/y world coordinates and then
* sets alive, exists, visible and renderable all to true. Also resets the outOfBounds state and health values.
* If the Sprite has a physics body that too is reset.
*
* @method Phaser.Sprite#reset
* @memberof Phaser.Sprite
* @param {number} x - The x coordinate (in world space) to position the Sprite at.
* @param {number} y - The y coordinate (in world space) to position the Sprite at.
* @param {number} [health=1] - The health to give the Sprite.
* @return (Phaser.Sprite) This instance.
*/
Phaser.Sprite.prototype.reset = function(x, y, health) {

    if (typeof health === 'undefined') { health = 1; }

    this.world.setTo(x, y);
    this.position.x = x;
    this.position.y = y;
    this.alive = true;
    this.exists = true;
    this.visible = true;
    this.renderable = true;
    this._outOfBoundsFired = false;

    this.health = health;

    if (this.body)
    {
        this.body.reset(x, y, false, false);
    }

    this._cache[4] = 1;

    return this;

};

/**
* Brings the Sprite to the top of the display list it is a child of. Sprites that are members of a Phaser.Group are only
* bought to the top of that Group, not the entire display list.
*
* @method Phaser.Sprite#bringToTop
* @memberof Phaser.Sprite
* @return (Phaser.Sprite) This instance.
*/
Phaser.Sprite.prototype.bringToTop = function() {

    if (this.parent)
    {
        this.parent.bringToTop(this);
    }

    return this;

};

/**
* Play an animation based on the given key. The animation should previously have been added via sprite.animations.add()
* If the requested animation is already playing this request will be ignored. If you need to reset an already running animation do so directly on the Animation object itself.
*
* @method Phaser.Sprite#play
* @memberof Phaser.Sprite
* @param {string} name - The name of the animation to be played, e.g. "fire", "walk", "jump".
* @param {number} [frameRate=null] - The framerate to play the animation at. The speed is given in frames per second. If not provided the previously set frameRate of the Animation is used.
* @param {boolean} [loop=false] - Should the animation be looped after playback. If not provided the previously set loop value of the Animation is used.
* @param {boolean} [killOnComplete=false] - If set to true when the animation completes (only happens if loop=false) the parent Sprite will be killed.
* @return {Phaser.Animation} A reference to playing Animation instance.
*/
Phaser.Sprite.prototype.play = function (name, frameRate, loop, killOnComplete) {

    if (this.animations)
    {
        return this.animations.play(name, frameRate, loop, killOnComplete);
    }

};

/**
* Checks to see if the bounds of this Sprite overlaps with the bounds of the given Display Object, which can be a Sprite, Image, TileSprite or anything that extends those such as a Button.
* This check ignores the Sprites hitArea property and runs a Sprite.getBounds comparison on both objects to determine the result.
* Therefore it's relatively expensive to use in large quantities (i.e. with lots of Sprites at a high frequency), but should be fine for low-volume testing where physics isn't required.
*
* @method Phaser.Sprite#overlap
* @memberof Phaser.Sprite
* @param {Phaser.Sprite|Phaser.Image|Phaser.TileSprite|Phaser.Button|PIXI.DisplayObject} displayObject - The display object to check against.
* @return {boolean} True if the bounds of this Sprite intersects at any point with the bounds of the given display object.
*/
Phaser.Sprite.prototype.overlap = function (displayObject) {

    return Phaser.Rectangle.intersects(this.getBounds(), displayObject.getBounds());

};

/**
* Indicates the rotation of the Sprite, in degrees, from its original orientation. Values from 0 to 180 represent clockwise rotation; values from 0 to -180 represent counterclockwise rotation.
* Values outside this range are added to or subtracted from 360 to obtain a value within the range. For example, the statement player.angle = 450 is the same as player.angle = 90.
* If you wish to work in radians instead of degrees use the property Sprite.rotation instead. Working in radians is also a little faster as it doesn't have to convert the angle.
*
* @name Phaser.Sprite#angle
* @property {number} angle - The angle of this Sprite in degrees.
*/
Object.defineProperty(Phaser.Sprite.prototype, "angle", {

    get: function() {

        return Phaser.Math.wrapAngle(Phaser.Math.radToDeg(this.rotation));

    },

    set: function(value) {

        this.rotation = Phaser.Math.degToRad(Phaser.Math.wrapAngle(value));

    }

});

/**
* Returns the delta x value. The difference between world.x now and in the previous step.
*
* @name Phaser.Sprite#deltaX
* @property {number} deltaX - The delta value. Positive if the motion was to the right, negative if to the left.
* @readonly
*/
Object.defineProperty(Phaser.Sprite.prototype, "deltaX", {

    get: function() {

        return this.world.x - this._cache[0];

    }

});

/**
* Returns the delta y value. The difference between world.y now and in the previous step.
*
* @name Phaser.Sprite#deltaY
* @property {number} deltaY - The delta value. Positive if the motion was downwards, negative if upwards.
* @readonly
*/
Object.defineProperty(Phaser.Sprite.prototype, "deltaY", {

    get: function() {

        return this.world.y - this._cache[1];

    }

});

/**
* Returns the delta z value. The difference between rotation now and in the previous step.
*
* @name Phaser.Sprite#deltaZ
* @property {number} deltaZ - The delta value.
* @readonly
*/
Object.defineProperty(Phaser.Sprite.prototype, "deltaZ", {

    get: function() {

        return this.rotation - this._cache[2];

    }

});

/**
* Checks if the Sprite bounds are within the game world, otherwise false if fully outside of it.
*
* @name Phaser.Sprite#inWorld
* @property {boolean} inWorld - True if the Sprite bounds is within the game world, even if only partially. Otherwise false if fully outside of it.
* @readonly
*/
Object.defineProperty(Phaser.Sprite.prototype, "inWorld", {

    get: function() {

        return this.game.world.bounds.intersects(this.getBounds());

    }

});

/**
* Checks if the Sprite bounds are within the game camera, otherwise false if fully outside of it.
*
* @name Phaser.Sprite#inCamera
* @property {boolean} inCamera - True if the Sprite bounds is within the game camera, even if only partially. Otherwise false if fully outside of it.
* @readonly
*/
Object.defineProperty(Phaser.Sprite.prototype, "inCamera", {

    get: function() {

        return this.game.world.camera.screenView.intersects(this.getBounds());

    }

});

/**
* @name Phaser.Sprite#frame
* @property {number} frame - Gets or sets the current frame index and updates the Texture Cache for display.
*/
Object.defineProperty(Phaser.Sprite.prototype, "frame", {

    get: function () {
        return this.animations.frame;
    },

    set: function (value) {
        this.animations.frame = value;
    }

});

/**
* @name Phaser.Sprite#frameName
* @property {string} frameName - Gets or sets the current frame name and updates the Texture Cache for display.
*/
Object.defineProperty(Phaser.Sprite.prototype, "frameName", {

    get: function () {
        return this.animations.frameName;
    },

    set: function (value) {
        this.animations.frameName = value;
    }

});

/**
* @name Phaser.Sprite#renderOrderID
* @property {number} renderOrderID - The render order ID, reset every frame.
* @readonly
*/
Object.defineProperty(Phaser.Sprite.prototype, "renderOrderID", {

    get: function() {

        return this._cache[3];

    }

});

/**
* By default a Sprite won't process any input events at all. By setting inputEnabled to true the Phaser.InputHandler is
* activated for this object and it will then start to process click/touch events and more.
*
* @name Phaser.Sprite#inputEnabled
* @property {boolean} inputEnabled - Set to true to allow this object to receive input events.
*/
Object.defineProperty(Phaser.Sprite.prototype, "inputEnabled", {

    get: function () {

        return (this.input && this.input.enabled);

    },

    set: function (value) {

        if (value)
        {
            if (this.input === null)
            {
                this.input = new Phaser.InputHandler(this);
                this.input.start();
            }
            else if (this.input && !this.input.enabled)
            {
                this.input.start();
            }
        }
        else
        {
            if (this.input && this.input.enabled)
            {
                this.input.stop();
            }
        }

    }

});

/**
* Sprite.exists controls if the core game loop and physics update this Sprite or not.
* When you set Sprite.exists to false it will remove its Body from the physics world (if it has one) and also set Sprite.visible to false.
* Setting Sprite.exists to true will re-add the Body to the physics world (if it has a body) and set Sprite.visible to true.
*
* @name Phaser.Sprite#exists
* @property {boolean} exists - If the Sprite is processed by the core game update and physics.
*/
Object.defineProperty(Phaser.Sprite.prototype, "exists", {

    get: function () {

        return !!this._cache[6];

    },

    set: function (value) {

        if (value)
        {
            //  exists = true
            this._cache[6] = 1;

            if (this.body && this.body.type === Phaser.Physics.P2JS)
            {
                this.body.addToWorld();
            }

            this.visible = true;
        }
        else
        {
            //  exists = false
            this._cache[6] = 0;

            if (this.body && this.body.type === Phaser.Physics.P2JS)
            {
                this.body.removeFromWorld();
            }

            this.visible = false;

        }
    }

});

/**
* An Sprite that is fixed to the camera uses its x/y coordinates as offsets from the top left of the camera. These are stored in Sprite.cameraOffset.
* Note that the cameraOffset values are in addition to any parent in the display list.
* So if this Sprite was in a Group that has x: 200, then this will be added to the cameraOffset.x
*
* @name Phaser.Sprite#fixedToCamera
* @property {boolean} fixedToCamera - Set to true to fix this Sprite to the Camera at its current world coordinates.
*/
Object.defineProperty(Phaser.Sprite.prototype, "fixedToCamera", {

    get: function () {

        return !!this._cache[7];

    },

    set: function (value) {

        if (value)
        {
            this._cache[7] = 1;
            this.cameraOffset.set(this.x, this.y);
        }
        else
        {
            this._cache[7] = 0;
        }
    }

});

/**
* Enable or disable texture smoothing for this Sprite. Only works for bitmap/image textures. Smoothing is enabled by default.
*
* @name Phaser.Sprite#smoothed
* @property {boolean} smoothed - Set to true to smooth the texture of this Sprite, or false to disable smoothing (great for pixel art)
*/
Object.defineProperty(Phaser.Sprite.prototype, "smoothed", {

    get: function () {

        return !this.texture.baseTexture.scaleMode;

    },

    set: function (value) {

        if (value)
        {
            if (this.texture)
            {
                this.texture.baseTexture.scaleMode = 0;
            }
        }
        else
        {
            if (this.texture)
            {
                this.texture.baseTexture.scaleMode = 1;
            }
        }
    }

});

/**
* The position of the Sprite on the x axis relative to the local coordinates of the parent.
*
* @name Phaser.Sprite#x
* @property {number} x - The position of the Sprite on the x axis relative to the local coordinates of the parent.
*/
Object.defineProperty(Phaser.Sprite.prototype, "x", {

    get: function () {

        return this.position.x;

    },

    set: function (value) {

        this.position.x = value;

        if (this.body && this.body.type === Phaser.Physics.ARCADE && this.body.phase === 2)
        {
            this.body._reset = 1;
        }

    }

});

/**
* The position of the Sprite on the y axis relative to the local coordinates of the parent.
*
* @name Phaser.Sprite#y
* @property {number} y - The position of the Sprite on the y axis relative to the local coordinates of the parent.
*/
Object.defineProperty(Phaser.Sprite.prototype, "y", {

    get: function () {

        return this.position.y;

    },

    set: function (value) {

        this.position.y = value;

        if (this.body && this.body.type === Phaser.Physics.ARCADE && this.body.phase === 2)
        {
            this.body._reset = 1;
        }

    }

});

/**
* @name Phaser.Sprite#destroyPhase
* @property {boolean} destroyPhase - True if this object is currently being destroyed.
*/
Object.defineProperty(Phaser.Sprite.prototype, "destroyPhase", {

    get: function () {

        return !!this._cache[8];

    }

});
