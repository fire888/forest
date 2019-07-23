import * as THREE from 'three';
import 'three/examples/js/loaders/OBJLoader';
import kolobObjSrc from '../Assets/kolob.obj';
import kolobMap from '../Assets/kolob_map.png';
import kolobMap1 from '../Assets/kolob_map-1.png';

export default function () {

    this.mesh = null;

    var callbackOninit


    /** SHADER  ****************************************************************/

    var uniforms = { 
        lineWidth: { type: "f", value: 2.0 },
        rotateY: { type: "f", value: 0.75 },
        color: { type: "c", value: new THREE.Color( 0xffff ) },
        map: { value: null },
        strengthAngry: {type: 'f', value: 0.},
        mapAngry: { value: null },
    };

    var vertexShader = [
    'attribute vec4 center;',
    'uniform float rotateY;',
    'varying vec2 vUv;',
                
    'void main() {',
            'vUv = uv;',
            'vec3 pos = position;', 

            'vec3 animated = vec3( pos.x, pos.y, pos.z  );',

            'float s = -rotateY;',
            'float c = rotateY;',
            'float rotation = c + s + sin( pos.y*2.3+(s*pos.y*4.8)+(c+(pos.y-100.0)*1.3) );',

            //'rotation = smoothstep(-1000., 1000., rotation);',

            'mat3 rotY = mat3(',
                'vec3( cos(rotation), 			0.0, -sin(rotation)),',
                'vec3( 			0.0,  			1.0,  0.0),',
                'vec3( sin(rotation),  			0.0,  cos(rotation))',
            ');',

            'vec3 rotatedDirection = pos*(rotY);',
            
            'float th = (1200.0 - abs(sin(pos.y*0.01))*600.0);',
            'animated.x += rotatedDirection.x*th;',
            'animated.z += rotatedDirection.z*th;',
            'animated.y += rotatedDirection.y*2000.0;',

            'gl_Position = projectionMatrix * modelViewMatrix * vec4( animated, 1.0 );',

        '}',
    ].join('\n');

    var fragmentShader = [
        'uniform float lineWidth;',
        'uniform vec3 color;',
        'uniform sampler2D map;',
        'uniform float strengthAngry;',
        'uniform sampler2D mapAngry;',
        'varying vec2 vUv;',

        'void main() {',
            'float depth = gl_FragCoord.z / gl_FragCoord.w;',
            'float near = 400.0;',
            'float far = 1200.0;',
            'float depthcolor = 1.0 - smoothstep( near, far, depth );',

            'vec4 texColor = texture2D( map, vUv );',

            'vec4 texColorAngry = texture2D( mapAngry, vUv ) * strengthAngry;',

            'gl_FragColor.a = 1.;',
            'gl_FragColor.rgb = (texColor.rgb + texColorAngry.rgb)*depthcolor;',// texColor.xyz*color*depthcolor;',
        '}',
    ].join('\n');

    var shader = { 
        uniforms, 
        vertexShader, 
        fragmentShader,
        transparent: false, 
        wireframe: false,
    }

    /** MATERIAL  ********************************************************************/

    var material = new THREE.ShaderMaterial(shader);

    var textures = [];
    var texturesPath = [kolobMap, kolobMap1];
    var textureLoader = new THREE.TextureLoader();
    
    var loadTexture = function (index) {
        textureLoader.load(texturesPath[index], function (map) {
            textures.push(map);
            index++;
            if (texturesPath[index]) {
                loadTexture(index);
            } else {
                initMaterial(); 
            }
        });
    }.bind(this);


    var initMaterial = function () {
        
        uniforms.map.value = textures[0];
        uniforms.map.value.needsUpdate = true;

        uniforms.mapAngry.value = textures[1];
        uniforms.mapAngry.value.needsUpdate = true;
        
        loadModel();
    }

    loadTexture(0);


    /** GEOMETRY ********************************************************************/

    var loadModel = function () {
        var loader = new THREE.OBJLoader();
        loader.load(kolobObjSrc, function (model) {
            model.traverse( function (item) {
                if (item instanceof THREE.Mesh !== true) { 
                    return
                }
                var geometry = new THREE.Geometry().fromBufferGeometry( item.geometry );
                geometry.computeFaceNormals();
                geometry.mergeVertices();
                geometry.computeVertexNormals();
                item.geometry = new THREE.BufferGeometry().fromGeometry( geometry );
                item.material = material;
            }) 
            createMesh(model);
        })
    }.bind(this)

    /** MESH ********************************************************************/

    var createMesh = function (item) {
        this.mesh = item;
        this.mesh.scale.set(0.1, 0.05, 0.1)
        callbackOninit();
    }.bind(this);    

    /** METHODS  ****************************************************************************/

    this.onInit = function (callback) {
        callbackOninit = callback;
    }

    this.update = function (count, delta, time) {
        if (isRotateFace) {
            rotateFace();
        }
        if (isMakeAngry) {
            animateAngry();
        }
    };

    /** ROTATE FACE  **********************************************************/

    var isRotateFace = false;
    var maxCountRF = Infinity;
    var indexRF = 0;
    var isMoreRF = true;
    var speedRF = 0.006;

    this.setRotate = function (val, count) {
        isRotateFace = val;
        if (!isRotateFace) {
            uniforms.rotateY.value = 0.75;
        }
        if (isRotateFace) {
            indexRF = 0;
            isMoreRF = true;
            maxCountRF = count ? count * 2 : Infinity;
        }
    };


    var rotateFace = function () {
        if (isMoreRF === true) {
            if (uniforms.rotateY.value < 1.0) {
                uniforms.rotateY.value += speedRF;
                if (Math.abs(uniforms.rotateY.value - 0.75) < speedRF * 1.5) {
                    indexRF ++; 
                    if (indexRF > maxCountRF ) {
                        uniforms.rotateY.value = 0.75;
                        indexRF = 0;
                        isRotateFace = false; 
                    }
                }
            } else {
                isMoreRF = false;
            } 
        }
        if (isMoreRF === false) {
            if (uniforms.rotateY.value > 0.5) {
                uniforms.rotateY.value -= speedRF;
            } else {
                isMoreRF = true;
            } 
        }
    }


    /** ANGRY ****************************************************/

    var isMakeAngry = false;
    var countAngry = 0;
    var maxCountAngry = 0;
    var isMoreR = true;
    var speedAngry = 0.3;
    var delayFrames = 0; 
    var maxFramesDelay = 0;

    this.makeAngry = function (count, speed, delay) {
        countAngry = 0;
        isMoreR = true
        isMakeAngry = true;
        uniforms.strengthAngry.value = 0.;
        speedAngry = speed || 0.05;
        maxCountAngry = count || 1;
        maxFramesDelay = delay || 10;
    }

    var animateAngry = function () {
        if (isMoreR == true) {
            if (uniforms.strengthAngry.value < 1.0) {
                uniforms.strengthAngry.value += speedAngry;
            } else {
                if (delayFrames < maxFramesDelay) {
                    delayFrames ++;
                } else {   
                    delayFrames = 0;
                    isMoreR = false;
                }
            } 
        }
        if (isMoreR == false) {
            if (uniforms.strengthAngry.value > 0.) {
                uniforms.strengthAngry.value -= speedAngry;
            } else {
                isMoreR = true;
                countAngry ++; 
                if (countAngry == maxCountAngry) {
                    isMakeAngry = false;
                    countAngry = 0;
                    uniforms.strengthAngry.value = 0.;
                } 
            } 
        }
    }
}

