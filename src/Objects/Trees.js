import * as THREE from 'three';
import 'three/examples/js/loaders/OBJLoader';
import treeObjSrc from '../Assets/tree.obj';

export default function () {

    this.group = null;
	
	
	/** VARS *******************************************************************/
	
    var callbackOninit;
    var treeGeometry;
    var treeMaterial;
    var isInit = false; 

    /** INIT ********************************************************************/
    
	loadTree();

    function loadTree () {
        var objLoader = new THREE.OBJLoader();
        objLoader.load(treeObjSrc, function (model) {
            model.traverse( item => {
                if (item instanceof THREE.Mesh === true ) {
                    treeGeometry = item.geometry;
                }
            }) 
           createTrees()
        })
    }

    var createTrees = function () {
        this.group = new THREE.Group();
        var t; 
        treeMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa })
        for (var it = 0; it < 30; it ++) {
            t = new THREE.Mesh(treeGeometry, treeMaterial)
            t.scale.set(5, (Math.random()) * 10, 5);
            t.position.set(
                ((Math.random() * 500) + 100) * (Math.sign(Math.random() * 2 - 1)), 
                -50,
                 -(Math.random()) * 1000
            );
            this.group.add(t);
        }
        isInit = true;
        callbackOninit();
    }.bind(this)

    this.onInit = function (callback) {
        callbackOninit = callback;
    }


    /** UPDATE ******************************************************************/

    this.update = function (count, delta, time) {
        if (!isInit) {
            return;
        }

        for (let i = 0; i < this.group.children.length; i ++) {
            this.group.children[i].position.z += 1;
            if (this.group.children[i].position.z > 50) {
                this.group.children[i].position.z = -1000;  
            }
        }
    }.bind(this);
}

