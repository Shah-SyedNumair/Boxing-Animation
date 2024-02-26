// Template code for A2 Fall 2021 -- DO NOT DELETE THIS LINE

var canvas;
var gl;

var program ;

var near = 1;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;


var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix ;
var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var TIME = 0.0 ; // Realtime
var resetTimerFlag = true ;
var animFlag = false ;
var prevTime = 0.0 ;
var useTextures = 1 ;

// ------------ Images for textures stuff --------------
var texSize = 64;

var image1 = new Array()
for (var i =0; i<texSize; i++)  image1[i] = new Array();
for (var i =0; i<texSize; i++)
for ( var j = 0; j < texSize; j++)
image1[i][j] = new Float32Array(4);
for (var i =0; i<texSize; i++) for (var j=0; j<texSize; j++) {
    var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
    image1[i][j] = [c, c, c, 1];
}

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4*texSize*texSize);

for ( var i = 0; i < texSize; i++ )
for ( var j = 0; j < texSize; j++ )
for(var k =0; k<4; k++)
image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];


var textureArray = [] ;



function isLoaded(im) {
    if (im.complete) {
        console.log("loaded") ;
        return true ;
    }
    else {
        console.log("still not loaded!!!!") ;
        return false ;
    }
}

function loadFileTexture(tex, filename)
{
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename ;
    tex.isTextureReady = false ;
    tex.image.onload = function() { handleTextureLoaded(tex); }
    // The image is going to be loaded asyncronously (lazy) which could be
    // after the program continues to the next functions. OUCH!
}

function loadImageTexture(tex, image) {
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    //tex.image.src = "CheckerBoard-from-Memory" ;
    
    gl.bindTexture( gl.TEXTURE_2D, tex.textureWebGL );
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);

    tex.isTextureReady = true ;

}

function initTextures() {
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"sunset.bmp") ;
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"grasstexture.png") ;
   
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"metaltexture.png") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"concrete.png") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"bagtexture.png") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"skintexture.png") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"jeantexture.png") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"beetexture.png") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"eyetexture.png") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"wingtexture.png") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"eye2texture.png") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"glovetexture.png") ;

    textureArray.push({}) ;
    loadImageTexture(textureArray[textureArray.length-1],image2) ;
    
}


function handleTextureLoaded(textureObj) {
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src) ;
    
    textureObj.isTextureReady = true ;
}

//----------------------------------------------------------------

function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

function toggleTextures() {
    useTextures = 1 - useTextures ;
    gl.uniform1i( gl.getUniformLocation(program,
                                         "useTextures"), useTextures );
}

function waitForTextures1(tex) {
    setTimeout( function() {
    console.log("Waiting for: "+ tex.image.src) ;
    wtime = (new Date()).getTime() ;
    if( !tex.isTextureReady )
    {
        console.log(wtime + " not ready yet") ;
        waitForTextures1(tex) ;
    }
    else
    {
        console.log("ready to render") ;
        window.requestAnimFrame(render);
    }
               },5) ;
    
}

// Takes an array of textures and calls render if the textures are created
function waitForTextures(texs) {
    setTimeout( function() {
               var n = 0 ;
               for ( var i = 0 ; i < texs.length ; i++ )
               {
                    console.log("boo"+texs[i].image.src) ;
                    n = n+texs[i].isTextureReady ;
               }
               wtime = (new Date()).getTime() ;
               if( n != texs.length )
               {
               console.log(wtime + " not ready yet") ;
               waitForTextures(texs) ;
               }
               else
               {
               console.log("ready to render") ;
               window.requestAnimFrame(render);
               }
               },5) ;
    
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
 
    // Load canonical objects and their attributes
    Cube.init(program);
    Cylinder.init(9,program);
    Cone.init(9,program) ;
    Sphere.init(36,program) ;

    gl.uniform1i( gl.getUniformLocation(program, "useTextures"), useTextures );

    // record the locations of the matrices that are used in the shaders
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // set a default material
    setColor(materialDiffuse) ;
    
  
    
    // set the callbacks for the UI elements
    document.getElementById("sliderXi").oninput = function() {
        RX = this.value ;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderYi").oninput = function() {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").oninput = function() {
        RZ =  this.value;
        window.requestAnimFrame(render);
    };
    
    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true  ;
            resetTimerFlag = true ;
            window.requestAnimFrame(render);
        }
    };
    
    document.getElementById("textureToggleButton").onclick = function() {
        toggleTextures() ;
        window.requestAnimFrame(render);
    };

    var controller = new CameraController(canvas);
    controller.onchange = function(xRot,yRot) {
        RX = xRot ;
        RY = yRot ;
        window.requestAnimFrame(render); };
    
    // load and initialize the textures
    initTextures() ;
    
    // Recursive wait for the textures to load
    waitForTextures(textureArray) ;
    //setTimeout (render, 100) ;
    
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix) ;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV() ;
    
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV() ;
    Cube.draw() ;
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV() ;
    Sphere.draw() ;
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV() ;
    Cylinder.draw() ;
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV() ;
    Cone.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modelview matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modelview matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modelview matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modelMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    
    eye = vec3(0,0,10);
    eye[1] = eye[1] + 0 ;
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
    
    // initialize the modeling matrix stack
    MS= [] ;
    modelMatrix = mat4() ;
    
    // apply the slider rotations
    gRotate(RZ,0,0,1) ;
    gRotate(RY,0,1,0) ;
    gRotate(RX,1,0,0) ;
    
    // send all the matrices to the shaders
    setAllMatrices() ;
    
    // get real time
    var curTime ;
    if( animFlag )
    {
        curTime = (new Date()).getTime() /1000 ;
        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }
        
        //Frames for every 2 seconds
        console.log("Frames per 2 seconds:" + (2/(curTime - prevTime)));

        TIME = TIME + curTime - prevTime ;
        prevTime = curTime ;

    }
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
    
    gTranslate(0, -6, 0);
    //ground box
    gPush();
    {
        gScale(10, 1, 10);
        setColor(vec4(0.0, 0.4, 0.0, 1.0));
        drawCube();
    }
    gPop();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture2"), 0);
    //Ground 2
    gTranslate(0, 0.3, 0);
    gPush();
    {
        gTranslate(0, 0.7, 0);
        gScale(4, 0.3, 4);
        setColor(vec4(0.2, 0.2, 0.2, 1.0));
        drawCube();
    }
    gPop();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[4].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture3"), 0);
    gPush();
    {
        //bag
        gTranslate(0,6,3) ;
        setColor(vec4(0.3,0,0,1.0)) ;
        gRotate(90,1,0,0) ;
        d = -Math.abs(-Math.cos(3*TIME));
        gRotate(d*100/3.14159, 1, 0, 1);
        gScale(2.5, 2.5, 6);
        drawCylinder() ;

        gPush();
        { //ball
           gTranslate(0,0,-.49) ;
            setColor(vec4(0,0,0,1.0)) ;

            d = -Math.abs(-Math.cos(TIME));

            gScale(.4, .4, .1);
            drawSphere() ;
        }
        gPop();
        //


        gPush();
        { //ball
           gTranslate(0,0,.5) ;
            setColor(vec4(0,0,0,1.0)) ;

            d = -Math.abs(-Math.cos(TIME));

            gScale(.4, .4, .1);
            drawSphere() ;
        }
        gPop();
        //

    }
    gPop();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture4"), 0);
    //bars holding bag
    gPush();
    {
    gTranslate(0,9,2.6);
    //Grey
    setColor(vec4(0.5,0.5,0.5,1.0)) ;

    //chain
    gPush();
    {
        gRotate(90,1,0,0) 
        gScale(0.25, 0.25, 4);
        drawCylinder() ;
    }
    gPop();

    //bar holding chain
    gPush();
    {
        gTranslate(0, 2, 0);
        gRotate(90, 0, 1, 0);
        gScale(0.5, 0.5, 6);
        drawCylinder();
    }
    gPop();

    //one pole holding bar
    gPush();
    {
        gTranslate(3,-2.8, 0);
        gScale(0.35, 5.25, 0.35);
        drawCube();
    }
    gPop();

    //other pole holding bar
    gPush();
    {
        gTranslate(-3,-2.8, 0);
        gScale(0.35, 5.25, 0.35);
        drawCube();
    }
    gPop();

    }
    gPop();
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture5"), 0);
     //Human Body
     gPush();
     {
         //Main transformations affecting all of body
         let n = Math.abs(Math.cos(2.5*TIME)+0.01);
         gTranslate(0, n+4, 0);
         //Colour peach
         setColor(vec4(0.7, 0.4, 0.3, 1.0));
        
         //Main Body
         gPush();
         {
         gScale(0.525, 0.9, 0.225);
         drawCube();
         }
         gPop();
 
         //Chest
         gPush();
         {
            gTranslate(0, 0.45, 0);
            gScale(0.63, 0.55, 0.45);
            drawSphere();
         }
         gPop();

         //Arms
         gPush();
         {
            gTranslate(0,0.72,0);

            //Left Arm
            gPush();
            {
                //sholder
                gTranslate(0.6, 0, 0);
                gPush();
                {
                gScale(0.26,0.26, 0.26);
                drawSphere();
                }
                gPop();

                //bicept
                let d = -Math.abs(Math.cos(2*TIME));
                gRotate(d*265/3.14159, 1, 1, 0);
                gTranslate(0.3, -0.4, 0);
                gRotate(90, 1, 0, 0);
                gRotate(35, 0, 1, 0);
                gScale(0.35, 0.35, 0.8);
                drawCylinder();

                //elbow
                gTranslate(0, 0, 0.5);
                gScale(0.5, 0.5, 0.21875);
                drawSphere();

                //forearm
                d = -Math.abs(Math.sin(2*TIME));
                gRotate(d*210/3.14159, 1, 0, 0);
                gTranslate(0, 0, 2.8);
                gScale(2, 2, 4.5);
                drawCylinder();

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, textureArray[11].textureWebGL);
                gl.uniform1i(gl.getUniformLocation(program, "texture10"), 0);
                //boxing glove
                //colour red
                setColor(vec4(1.0, 0.0, 0.0, 1.0));
                gTranslate(0, 0, 0.25);
                gScale(1.2, 1.2, 0.5);
                drawCylinder();

                gTranslate(0, 0, 0.6);
                gRotate(90, 0, 0, 1);
                gScale(0.7, 0.5, 0.7);
                drawCube();
            }
            gPop();

            gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture5"), 0);
            //colour peach
            setColor(vec4(0.7, 0.4, 0.3, 1.0));
            //Right Arm
            gPush();
            {
                //sholder
                gTranslate(-0.6, 0, 0);
                gPush();
                {
                    gScale(0.26,0.26, 0.26);
                    drawSphere();
                }
                gPop();

                //bicept
                let d = -Math.abs(-Math.cos(2*TIME));
                gRotate(d*265/3.14159, 1, 1, 1);
                gTranslate(0.1, -0.4, 0.2);
                gRotate(90, 1, 1, 0);
                gRotate(-35, 0, 1, 0);
                gScale(0.35, 0.35, 0.8);
                drawCylinder();

                //elbow
                gTranslate(0, 0, 0.5);
                gScale(0.5, 0.5, 0.21875);
                drawSphere();

                //forearm
                d = -Math.abs(-Math.cos(2*TIME));
                gRotate(d*270/3.14159, 1, 1, 0);
                gRotate(-45, 1, 0, 1);
                gTranslate(0, 0, 2.8);
                gScale(2, 2, 4.5);
                drawCylinder();

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, textureArray[11].textureWebGL);
                gl.uniform1i(gl.getUniformLocation(program, "texture10"), 0);
                //boxing glove
                //colour red
                setColor(vec4(1.0, 0.0, 0.0, 1.0));
                gTranslate(0, 0, 0.25);
                gScale(1.2, 1.2, 0.5);
                drawCylinder();

                gTranslate(0, 0, 0.6);
                gRotate(-45, 0, 0, 1);
                gScale(0.7, 0.5, 0.7);
                drawCube();
            }
            gPop();
         }
         gPop();

         gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture5"), 0);
         //colour peach
         setColor(vec4(0.7, 0.4, 0.3, 1.0));
         //Neck
         gPush();
         {
             gRotate(90, 1, 0, 0);
             gTranslate(0, 0, -1);
             gScale(0.45, 0.45, 0.45);
             drawCylinder();
         }
         gPop();

         //shape between neck and sholder
         gPush();
         {
            gTranslate(0, 0.76, 0);
            gPush();
            {
                gTranslate(-0.23, 0, 0);
                gRotate(25, 0, 0, 1);
                gScale(0.3, 0.2, 0.185);
                gRotate(-15, 0, 0, 1);
                drawCube();
            }
            gPop();

            gPush();
            {
                gTranslate(0.23, 0, 0);
                gRotate(-25, 0, 0, 1);
                gScale(0.3, 0.2, 0.185);
                gRotate(15, 0, 0, 1);
                drawCube();
            }
            gPop();

            gScale(0.2195,0.2195, 0.2195);
            drawCube();
         }
         gPop();
 
         //Head
         gPush();
         {
            gTranslate(0, 1.6, 0);
            gScale(0.5, 0.5, 0.5);
            drawSphere();

            gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[10].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture11"), 0);
            gPush();
            {
                setColor(vec4(1.0, 1.0, 1.0, 1.0));
                gTranslate(0.5, 0.2, 0.75);
                gScale(0.25, 0.25, 0.25);
                drawSphere();
            }
            gPop();

            gPush();
            {
                gTranslate(-0.5, 0.2, 0.75);
                gScale(0.25, 0.25, 0.25);
                drawSphere();
            }
            gPop();
         }
         gPop();


         gl.activeTexture(gl.TEXTURE0);
         gl.bindTexture(gl.TEXTURE_2D, textureArray[6].textureWebGL);
         gl.uniform1i(gl.getUniformLocation(program, "texture6"), 0);
        //Legs
        gPush();
        {
            //moves both legs down
            gTranslate(0, -1, 0);
            //colour blue
            setColor(vec4(0.0, 0.0, 0.5, 1.0));

            //parts of pants
            gPush();
            {
                gTranslate(0, 0.3, 0);
                gScale(0.526, 0.2, 0.226);
                drawCube();
            }
            gPop();

            //Hip (Connection between body and legs)
            gPush();
            {
                gTranslate(0, 0.08, 0);
                gScale(0.45, 0.05, 0.23);
                drawCube();
            }
            gPop();

            //Left Leg
            gPush();
            {

                //First Part of Leg (Thighs)
                let d = 2*Math.sin(2.5*TIME);
                gRotate(d*15/3.14159, 1, 0, 0);
                gTranslate(-0.25, -0.32, 0);
                gScale(0.175, 0.425, 0.175);
                drawCube();

                //Joint inbetween Leg Parts
                gTranslate(0, -1.05, 0);
                gScale(0.5, 0.25, 0.5);
                drawCube();

                //Second Part of Leg
                gTranslate(0, -3.75, 0);
                gScale(2, 4, 2);
                drawCube();

                gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[8].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture7"), 0);
                //Foot
                //colour gray
                setColor(vec4(0.4, 0.4, 0.4, 1.0));
                gTranslate(0, -1.35, 0);
                gPush();
                {
                    gRotate(15, 1, 0, 0);
                    gScale(1, 0.5, 1.5);
                    drawCube();
                }
                gPop();
                gTranslate(0, -0.4, 1.9);
                gScale(1, 0.45, 1.2);
                drawCube();
            }
            gPop();

            gl.activeTexture(gl.TEXTURE0);
         gl.bindTexture(gl.TEXTURE_2D, textureArray[6].textureWebGL);
         gl.uniform1i(gl.getUniformLocation(program, "texture6"), 0);
            //colour blue
            setColor(vec4(0.0, 0.0, 0.5, 1.0));

            //Right Leg
            gPush();
            {

                //First Part of Leg (Thigh)
                let d = -2*Math.sin(2.5*TIME);
                gRotate(d*15/3.14159, 1, 0, 0);
                gTranslate(0.25, -0.32, 0);
                gScale(0.175, 0.425, 0.175);
                drawCube();

                //Joint inbetween Leg Parts
                gTranslate(0, -1.05, 0);
                gScale(0.5, 0.25, 0.5);
                drawCube();

                //Second Part of Leg
                gTranslate(0, -3.75, 0);
                gScale(2, 4, 2);
                drawCube();

                gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[8].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture7"), 0);
                //Foot
                //colour gray
                setColor(vec4(0.4, 0.4, 0.4, 1.0));
                gTranslate(0, -1.35, 0);
                gPush();
                {
                    gRotate(15, 1, 0, 0);
                    gScale(1, 0.5, 1.5);
                    drawCube();
                }
                gPop();
                gTranslate(0, -0.4, 1.9);
                gScale(1, 0.45, 1.2);
                drawCube();
            }
            gPop();
        }
        gPop();
    }
    gPop();
 
   
    //Bees
    gPush();
    {
        //Rotates bees around
        gRotate(-TIME*265/3.1415, 0, 1, 0);

        //Bee one
        gPush();
        {
            //Moves up and down
            let n = Math.sin(10*TIME);
            gTranslate(0, n+6, 6);
            gScale(0.75, 0.75, 0.75);

            //colour black
            setColor(vec4(0, 0, 0, 1.0));

            //eye one
            gPush();
            {
                gTranslate(-0.4, 0.1, 0.3);
                gScale(0.15, 0.15, 0.15);
                drawSphere();
            }
            gPop();

            //eye two
            gPush();
            {
                gTranslate(-0.4, 0.1, -0.3);
                gScale(0.15, 0.15, 0.15);
                drawSphere();
            }
            gPop();

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[7].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture8"), 0);
            //colour yellow
            //main body
            setColor(vec4(0.5, 0.4, 0, 1.0));
            gScale(0.75, 0.5, 0.5);
            drawSphere();

            //colour gray
            setColor(vec4(0.3, 0.3, 0.3));
            //stinger
            gPush();
            {
                gTranslate(1.1, 0, 0);
                gRotate(90, 0, 1, 0);
                gScale(0.35, 0.35, 0.65);
                drawCone();
            }
            gPop();

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[9].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture9"), 0);
            //moves wings up and down
            let d = Math.sin(50*TIME);
            //wing one
            gPush();
            {
                gRotate(d*65/3.1415, 1, 0, 0);
                gTranslate(0, 0.5, 1.1);
                gRotate(90, 0, 1, 0);
                gRotate(-45, 0, 0, 1);
                gScale(0.5, 0.15,0.15);
                drawSphere();
            }
            gPop();

            //wing two
            gPush();
            {
                gRotate(d*65/3.1415, 1, 0, 0);
                gTranslate(0, 0.5, -1.1);
                gRotate(90, 0, 1, 0);
                gRotate(45, 0, 0, 1);
                gScale(0.5, 0.15,0.15);
                drawSphere();
            }
            gPop();
        }
        gPop();

        //bee 2 (Same as bee 1 but behind it and smaller)
        gPush();
        {
            let n = Math.sin(10*(TIME+3));
            gTranslate(2, n+6, 6);
            gScale(0.5, 0.5, 0.5);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[8].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture7"), 0);
            setColor(vec4(0, 0, 0, 1.0));
            gPush();
            {
                gTranslate(-0.4, 0.1, 0.3);
                gScale(0.15, 0.15, 0.15);
                drawSphere();
            }
            gPop();

            gPush();
            {
                gTranslate(-0.4, 0.1, -0.3);
                gScale(0.15, 0.15, 0.15);
                drawSphere();
            }
            gPop();

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[7].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture8"), 0);
            setColor(vec4(0.5, 0.4, 0, 1.0));
            gScale(0.75, 0.5, 0.5);
            drawSphere();

            setColor(vec4(0.3, 0.3, 0.3));
            gPush();
            {
                gTranslate(1.1, 0, 0);
                gRotate(90, 0, 1, 0);
                gScale(0.35, 0.35, 0.65);
                drawCone();
            }
            gPop();

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[9].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture9"), 0);
            let d = Math.sin(50*TIME);
            gPush();
            {
                gRotate(d*65/3.1415, 1, 0, 0);
                gTranslate(0, 0.5, 1.1);
                gRotate(90, 0, 1, 0);
                gRotate(-45, 0, 0, 1);
                gScale(0.5, 0.15,0.15);
                drawSphere();
            }
            gPop();

            gPush();
            {
                gRotate(d*65/3.1415, 1, 0, 0);
                gTranslate(0, 0.5, -1.1);
                gRotate(90, 0, 1, 0);
                gRotate(45, 0, 0, 1);
                gScale(0.5, 0.15,0.15);
                drawSphere();
            }
            gPop();
        }
        gPop();
    }
    gPop();



    if( animFlag )
        window.requestAnimFrame(render);
}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
    var controller = this;
    this.onchange = null;
    this.xRot = 0;
    this.yRot = 0;
    this.scaleFactor = 3.0;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;
    
    // Assign a mouse down handler to the HTML element.
    element.onmousedown = function(ev) {
        controller.dragging = true;
        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
    };
    
    // Assign a mouse up handler to the HTML element.
    element.onmouseup = function(ev) {
        controller.dragging = false;
    };
    
    // Assign a mouse move handler to the HTML element.
    element.onmousemove = function(ev) {
        if (controller.dragging) {
            // Determine how far we have moved since the last mouse move
            // event.
            var curX = ev.clientX;
            var curY = ev.clientY;
            var deltaX = (controller.curX - curX) / controller.scaleFactor;
            var deltaY = (controller.curY - curY) / controller.scaleFactor;
            controller.curX = curX;
            controller.curY = curY;
            // Update the X and Y rotation angles based on the mouse motion.
            controller.yRot = (controller.yRot + deltaX) % 360;
            controller.xRot = (controller.xRot + deltaY);
            // Clamp the X rotation to prevent the camera from going upside
            // down.
            if (controller.xRot < -90) {
                controller.xRot = -90;
            } else if (controller.xRot > 90) {
                controller.xRot = 90;
            }
            // Send the onchange event to any listener.
            if (controller.onchange != null) {
                controller.onchange(controller.xRot, controller.yRot);
            }
        }
    };
}
