import * as THREE from 'three';

import 'three/examples/js/shaders/CopyShader';
import 'three/examples/js/shaders/FXAAShader';
import 'three/examples/js/shaders/ConvolutionShader';
//import 'three/examples/js/shaders/SSAOShader';
import '../Custom/SSAOShader';
import '../Custom/VignetteShader';
import 'three/examples/js/postprocessing/EffectComposer';
import 'three/examples/js/postprocessing/RenderPass';
import 'three/examples/js/postprocessing/ShaderPass';
import 'three/examples/js/postprocessing/BloomPass';
import 'three/examples/js/utils/SceneUtils';


export default function (e) {

    var emitter = e;

    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    var scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000 );
    scene.fog = new THREE.Fog(scene.background, 800, 1500);

    var camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 2000 );				
    scene.add( camera );

    var ambient = new THREE.AmbientLight(0x777777);
    scene.add(ambient);

    var pointLight = new THREE.PointLight( 0xffffff, 2 );
    pointLight.position.y = 500;
    pointLight.position.x = 0;//500;
    scene.add(pointLight);


    renderer.autoClear = false;

    var renderModel = new THREE.RenderPass( scene, camera );

    var effectBloom = new THREE.BloomPass( 1.5);

    var depthMaterial = new THREE.MeshDepthMaterial( {morphTargets: true} );
    depthMaterial.depthPacking = THREE.RGBADepthPacking;
    depthMaterial.blending = THREE.NoBlending;

    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
    var depthTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );
    depthTarget.texture.name = "SSAOShader.rt";


    var fxaa = new THREE.ShaderPass( THREE.FXAAShader );
    fxaa.uniforms[ 'resolution' ].value = new THREE.Vector2( 1/window.innerWidth/window.devicePixelRatio, 1/window.innerHeight/window.devicePixelRatio );
    fxaa.renderToScreen = true;

    var ssao = new THREE.ShaderPass( THREE.SSAOShader );
    ssao.uniforms[ 'tDepth' ].value = depthTarget.texture;
    ssao.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
    ssao.uniforms[ 'cameraNear' ].value = camera.near;
    ssao.uniforms[ 'cameraFar' ].value = camera.far;
    ssao.uniforms[ 'aoClamp' ].value = 1.0;
    ssao.uniforms[ 'lumInfluence' ].value = 0.05;
    ssao.uniforms[ 'radius' ].value = 20;
    ssao.uniforms[ 'onlyAO' ].value = 0;

    var effectVignette = new THREE.ShaderPass( THREE.VignetteShader );
    effectVignette.uniforms[ "offset" ].value = 1.0;
    effectVignette.uniforms[ "darkness" ].value = 1.25;


    var composer = new THREE.EffectComposer( renderer );
    composer.addPass( renderModel );
    composer.addPass( effectBloom );
    composer.addPass( ssao );					
    composer.addPass( effectVignette );
    composer.addPass( fxaa );


    window.addEventListener( 'resize', onWindowResize, false );

    function onWindowResize( event ) {
        var width = window.innerWidth;
        var height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize( width, height );

        fxaa.uniforms[ 'resolution' ].value.set( 1 / width/window.devicePixelRatio, 1 / height/window.devicePixelRatio );
        ssao.uniforms[ 'size' ].value.set( width, height );

        depthTarget.setSize( width, height );
        composer.setSize( width, height );
    }

    /** UPDATE ******************************************************************/

    /*var box = new THREE.Mesh(
        new THREE.BoxBufferGeometry(100, 100, 100),
        new THREE.MeshBasicMaterial({ color: 0xffffff})
    )
    box.position.set(0, 0 , -1000);
    scene.add(box);*/

    var update = function () {
        //console.log('!!!!')
        scene.overrideMaterial = depthMaterial;
        renderer.render( scene, camera);
        scene.overrideMaterial = null;
        composer.render();
    };

    emitter.subscribeEvent('frameUpdate', update);

    this.addToScene = function (item) {
        scene.add(item);
    }

    this.removeFromScene = function (item) {
        scene.remove(item);
    }

    /** HELPERS ****************************************************************/

    this.getCamera = function () {
        return camera
    } 
}

