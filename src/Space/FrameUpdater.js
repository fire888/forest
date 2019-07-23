
export default function (e) {

    var emitter = e;

    var delta;
    var time;
    var oldTime;
    var count = 0;


    var animate = function () {
        requestAnimationFrame(animate)
      
        time = Date.now();
        delta = time - oldTime;
        if (isNaN(delta) || delta > 1000 || delta == 0 ) {
            delta = 1000/60;
        }
        count += delta*0.001;

        emitter.emitEvent('frameUpdate', { time, delta, count });

        oldTime = time;
    } 

    animate();
}

