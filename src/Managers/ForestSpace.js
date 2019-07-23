import Kolobok from '../Objects/Kolobok';
import Snow from '../Objects/Snow';
import Trees from '../Objects/Trees';

export default function (s, u, e) {

    var CONFIG = {
        kolobokPointStartZ: -2000,
        kolobokPointStayZ: -500,
    };

    this.state = 'none';

    var studio = s;
    var ui = u;
    var emitter = e;


    /** INIT  *****************************************************************/
    
    var isInited = false;
    var initedObjects = {
        'kolobok': false,
        'trees': false,
        'snow': false,
    };
    var setObjectCompleteAndCheckIsInit = function (objectKey) {
        initedObjects[objectKey] = true;
        isInited = true;
        for (var key in initedObjects) {
            if (initedObjects[key] === false) {
                isInited = false;
            }
        }
        if (isInited === true) {
            this.setState('start');
            emitter.emitEvent('forestSceneInited'); 
        }
    }.bind(this);


    var trees = new Trees();
    trees.onInit(function () {
            studio.addToScene(trees.group);
            setObjectCompleteAndCheckIsInit('trees');
       });
    
    var kolobok = new Kolobok();
    kolobok.onInit(function () {
            kolobok.mesh.rotation.y += 0.5;
            setObjectCompleteAndCheckIsInit('kolobok');
        });
       
    var snow = new Snow();
    studio.addToScene(snow.mesh);
    setObjectCompleteAndCheckIsInit('snow');
    



    /** UPDATE ITEMS *********************************************************/


    var moveOnForest = function (count, delta, time) {
        snow.update(count, delta, time);
        trees.update(count, delta, time);
    }.bind(this);

    var meetKolobok = function (count, delta, time) {
        kolobok.update(count, delta, time);
        kolobok.mesh.position.z += 1.5;
        if (kolobok.mesh.position.z > CONFIG.kolobokPointStayZ) {
           this.setState('stay');
        }
        snow.update(count, delta, time);
        trees.update(count, delta, time);
    }.bind(this)

    var waitKolobok = function (count, delta, time) {
        kolobok.update(count, delta, time);
        kolobok.mesh.position.z += 1.5;
        if (kolobok.mesh.position.z > CONFIG.kolobokPointStayZ) {
           this.setState('kolobokStay');
        }
        snow.update(count, delta, time);
    }.bind(this)

    var stayInForest = function(count, delta, time) {
        snow.update(count, delta, time);
        kolobok.update(count, delta, time);
    }.bind(this);

    var goOutFromKolobok = function(count, delta, time) {
        snow.update(count, delta, time);
        kolobok.update(count, delta, time);
        kolobok.mesh.position.z += 1.5;
        if (kolobok.mesh.position.z > 50) {
            this.setState('meetKolobok');
        }
    }.bind(this)




    /** UPDATE *******************************************************************/

    var timelineScenario = 0;
    var isPlay = false;

    emitter.subscribeEvent('appInited', function() {
        isPlay = true;
    });

    var update = function (data) {
        if (!isPlay) { return; }

        timelineScenario ++;
        if (timelineScenario === 100) {
            ui.showDefaultMessage('1', 5000);
        }
        if (timelineScenario === 500) {
            ui.showDefaultMessage('2', 5000); 
        }
        // start kolobok
        if (timelineScenario === 800) {
            this.setState('meetKolobok');
        }
        // stop trees
        if (timelineScenario === 1300) {
            ui.showDefaultMessage('3', 5000);
            this.setState('stopAndWaitKolobok'); 
        }
        if (timelineScenario === 1700) {
            ui.showDefaultMessage('4', 5000); 
        }
        if (timelineScenario === 2000) {
            kolobok.makeAngry(15, 0.02, 50);
            ui.showDefaultMessage('5', 10000, '#ffff00'); 
        }
        if (timelineScenario === 2500) {
            this.setState('scenarioDone');
        }
        
    

        
        if (this.state === 'walk') {
            moveOnForest(data.count, data.delta, data.time);
        }
        if (this.state === 'meetKolobok') {
            meetKolobok(data.count, data.delta, data.time);
        }
        if (this.state === 'stopAndWaitKolobok') {
            waitKolobok(data.count, data.delta, data.time);
        }
        if (this.state === 'kolobokStay') {
            stayInForest(data.count, data.delta, data.time);
        }
        if (this.state === 'afterCardGame') {
            goOutFromKolobok(data.count, data.delta, data.time);
        }
    }.bind(this);

    emitter.subscribeEvent('frameUpdate', update);



    /** SET STATES ****************************************/

    emitter.subscribeEvent('findTwoCards', function () {
        kolobok.makeAngry(3);
    }.bind(this));
    
    emitter.subscribeEvent('mistakeOpenCard', function () {
        kolobok.setRotate(true, 1);
    }.bind(this));


    emitter.subscribeEvent('cardsGameFinished', function () {
        this.setState('afterCardGame');
    }.bind(this));


    this.setState = function(s) {
        if (s === 'start') {
            timelineScenario = 0;
            kolobok.mesh.position.z = CONFIG.kolobokPointStartZ;
            this.state = 'walk';
        }
        if (s === 'meetKolobok') {
            this.state = 'meetKolobok';
            timelineScenario = 801;
            studio.addToScene(kolobok.mesh);
            kolobok.mesh.position.z = CONFIG.kolobokPointStartZ;
            kolobok.setRotate(true);
            kolobok.makeAngry(20);
        }
        if (s === 'stopAndWaitKolobok') {
            this.state = 'stopAndWaitKolobok';
        }
        if (s === 'kolobokStay') {
            this.state = 'kolobokStay';
            kolobok.setRotate(false);
            kolobok.mesh.position.z = CONFIG.kolobokPointStayZ;
        }
        if (s === 'scenarioDone') {
            kolobok.makeAngry(2);
            emitter.emitEvent('startCardsGame') 
        }
        if (s === 'afterCardGame') {
            kolobok.makeAngry(2);
            kolobok.setRotate(true);
            this.state = 'afterCardGame';
            ui.showDefaultMessage('6', 5000, '#ffff00');        
        }
    }.bind(this);
}