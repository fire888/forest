export default function (e, cam) {

    var emitter = e;

    var camera = cam;
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    var arrObjects = [];
    var oldTarget = null;
    var currentTarget = null;



    /** LISTENERS ********************************************************** */


    var onMouseMove = function () {
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        getInterseption();
    }.bind(this);



    var getInterseption = function () {
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(arrObjects, true);

        var result = getResult(intersects);

        if (!result) return;

        if (result.addFocus) {
            document.body.style.cursor = 'pointer';
            emitter.emitEvent('addMouseHover', result.addFocus);
        }
        if (result.removeFocus) {
            document.body.style.cursor = '';
            emitter.emitEvent('removeMouseHover', result.removeFocus);
        }
    }


    var getResult = function (arr) {
        var addFocus = null;
        var removeFocus = null;

        if (arr.length === 0) {
            if (oldTarget) {
                removeFocus = oldTarget;
                oldTarget = null;
                currentTarget = null;
            } else {
                return null;
            }
        }
        if (arr.length !== 0) {
            currentTarget = arr[0].object;

            if (!oldTarget) {
                oldTarget = currentTarget;
                addFocus = currentTarget;
            } else {
                if (oldTarget.id !== currentTarget.id) {
                    removeFocus = oldTarget;
                    addFocus = currentTarget;
                    oldTarget = currentTarget;
                }
            } 
        }
        return { addFocus, removeFocus }
    }



    const mouseClick = () => {
        if (!currentTarget) return;

        emitter.emitEvent('clickOnObject', currentTarget);
      }

    window.addEventListener( 'mousemove', onMouseMove, false )
    window.addEventListener( 'mouseup', mouseClick, false )
    
    
    /** METHODS  *******************************************************/

    this.addObjects = function (arr) {
        Array.prototype.push.apply(arrObjects, arr);
    }

    this.removeObjects = function (arr) {
        for (let i = 0; i < arrObjects.length; i++) {
            for (let iid = 0; iid < arr.length; iid++) {
                if (arrObjects[i]) {
                    if (arrObjects[i].id === arr[iid]) {
                        arrObjects.splice(i, 1);
                        arr.splice(iid, 1);
                        i--;
                        iid--;
                    }
                }
            }
        }
    }
} 