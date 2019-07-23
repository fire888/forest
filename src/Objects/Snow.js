export default function (callback) {

    var onInitCallback = callback || function () {}; 

    this.mesh = null

    var particleGeometry;
    var snowparticles;

    particleGeometry = new THREE.PlaneGeometry(1000, 1000, 40, 40);
    var particleMaterial = new THREE.ParticleBasicMaterial( { color: 0x9999ff, size: 2 } );


    // geometry

    var triangles = 5;
    var instances = 3000;
    
    var geometry = new THREE.InstancedBufferGeometry();
    geometry.maxInstancedCount = instances; // set so its initalized for dat.GUI, will be set in first draw otherwise
    
    var vertices = new THREE.BufferAttribute( new Float32Array( triangles * 3 * 3 ), 3 );
    
    var size = 6;
    vertices.setXYZ( 0, size, -size, 0 );
    vertices.setXYZ( 1, -size, size, 0 );
    vertices.setXYZ( 2, 0, 0, size );
    
    geometry.addAttribute( 'position', vertices );
    
    var offsets = new THREE.InstancedBufferAttribute( new Float32Array( instances * 3 ), 3, 1 );
    
    for ( var i = 0, ul = offsets.count; i < ul; i++ ) {
    
        //offsets.setXYZ( i, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
        offsets.setXYZ( i, Math.random()*2000 - 1000, 0, Math.random()*2000 - 1000 );
    }
    
    geometry.addAttribute( 'offset', offsets );
    
    var colors = new THREE.InstancedBufferAttribute( new Float32Array( instances * 4 ), 4, 1 );
    
    for ( var i = 0, ul = colors.count; i < ul; i++ ) {
        //colors.setXYZW( i, Math.random(), Math.random(), Math.random(), Math.random() );
        colors.setXYZW( i, 5, 5, 5, 5 );
    }
    
    geometry.addAttribute( 'color', colors );
    
    var vector = new THREE.Vector4();
    
    var orientations = new THREE.InstancedBufferAttribute( new Float32Array( instances * 4 ), 4, 1 );
    
    for ( var i = 0, ul = orientations.count; i < ul; i++ ) {
        vector.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
        vector.normalize();
    
        orientations.setXYZW( i, vector.x, vector.y, vector.z, vector.w );
    }
    
    geometry.addAttribute( 'orientation', orientations );
    
    var times = new THREE.InstancedBufferAttribute( new Float32Array( instances * 1 ), 1, 1 );
    
    for ( var i = 0, ul = times.count; i < ul; i++ ) {
        times.setX( i, Math.random() );
    }
    
    geometry.addAttribute( 'time', times );
    
    // material

    var uniforms = {
        globalTime: { type: "f", value: 1.0 },
        sineTime: { type: "f", value: 1.0 },
        move: { type: "f", value: 1.0 },
    };

    var vertexShader = [

        "precision highp float;",

        "uniform float globalTime;",
        "uniform float move;",

        "uniform mat4 modelViewMatrix;",
        "uniform mat4 projectionMatrix;",

        "attribute vec3 position;",
        "attribute vec3 offset;",
        "attribute vec4 color;",
        "attribute vec4 orientation;",
        //"attribute vec4 orientationEnd;",
        "attribute float time;",

        "varying float vRotation;",
        //"varying vec3 vRotation;",
        "varying vec4 vColor;",


        "vec3 rotateVectorByQuaternion( vec3 v, vec4 q ) {",

            "vec3 dest = vec3( 0.0 );",

            "float x = v.x, y  = v.y, z  = v.z;",
            "float qx = q.x, qy = q.y, qz = q.z, qw = q.w;",

            // calculate quaternion * vector

            "float ix =  qw * x + qy * z - qz * y,",
                    "iy =  qw * y + qz * x - qx * z,",
                    "iz =  qw * z + qx * y - qy * x,",
                    "iw = -qx * x - qy * y - qz * z;",

            // calculate result * inverse quaternion

            "dest.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;",
            "dest.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;",
            "dest.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;",

            "return dest;",

        "}",

        "vec4 axisAngleToQuaternion( vec3 axis, float angle ) {",

            "vec4 dest = vec4( 0.0 );",

            "float halfAngle = angle / 2.0,",
                    "s = sin( halfAngle );",

            "dest.x = axis.x * s;",
            "dest.y = axis.y * s;",
            "dest.z = axis.z * s;",
            "dest.w = cos( halfAngle );",

            "return dest;",

        "}",


        "void main(){",

            // time
            "float localTime = time + globalTime;",
            "float modTime = mod( localTime, 1.0 );",

            "vec3 off = offset;",

            "vec3 vPosition = position*0.5;",

            "vRotation = globalTime*10.0 + localTime*20.0 + orientation.w*100.0;",
            "vec4 qRotation = axisAngleToQuaternion( orientation.xyz, vRotation );",

            "vPosition = rotateVectorByQuaternion( vPosition, qRotation );",

            "off.y += modTime*-2000.0;",

            "off.y -= sin(localTime*6.0 + (off.x))*40.0;",
            "off.z += cos(time*60.0 + (off.z))*100.0;",
            "off.x += sin(time*120.0 + (off.y*0.01))*100.0;",

            "if (move == 1.0) {",
                "off.z += modTime*2000.0;",
            "}",

            "vColor = vec4(5., 5., 5., 5.);",//color;",

            "gl_Position = projectionMatrix * modelViewMatrix * vec4( off+vPosition, 1.0 );",

        "}"

    ].join("\n");

    var fragmentShader = [

        "precision highp float;",

        "varying float vRotation;",
        "varying vec4 vColor;",

        "void main() {",

            "gl_FragColor = vec4(5., 5., 5., 5.);",//vec4(vColor.xyz*abs(sin(vRotation)), 1.0);",

        "}"

    ].join("\n");
    
    
    var material = new THREE.RawShaderMaterial( {
        uniforms: 		uniforms,
        vertexShader:   vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide,
    });
    
    snowparticles = new THREE.Mesh( geometry, material );
    snowparticles.position.y = 950;
    snowparticles.position.z = 1000;
    snowparticles.rotation.y = Math.PI;
    snowparticles.frustumCulled = false;

    this.mesh = snowparticles;
    this.update = function (count, delta, time) {
        particleGeometry.verticesNeedUpdate = true;
        snowparticles.material.uniforms.globalTime.value += delta*0.0001;
    }

    onInitCallback();
}