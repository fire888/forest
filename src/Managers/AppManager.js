import ForestSpace from './ForestSpace';  
import CardsSpace from './CardsSpace';  


export default function (e, s, u, S) {

    var SPACES_TO_CREATE = S ? S : {
      'walkOnForestLogic': true,
      'cardsPlayLogic': true,
    };
  
    var CONFIG_SPACES = {
        'walkOnForestLogic': { 
          constructor: ForestSpace,
          emitInitiationId: 'forestSceneInited',
        },
        'cardsPlayLogic': { 
          constructor: CardsSpace,
          emitInitiationId: 'cardsMeshesInited',
        },
    };


    /** VARS  ****************************************************************/
  
    var studio = s;
    var ui = u;
    var emitter = e;
  
  
    var spaces = {};
  
  
  
    /** INIT  ****************************************************************/
  
    var isInited = false;
    var initedSpaces = {};
  
    var setObjectCompleteAndCheckIsInit = function (objectKey) {
      initedSpaces[objectKey] = true;
      isInited = true;
      for (var key in initedSpaces) {
          if (initedSpaces[key] === false) {
              isInited = false;
          }
      }
      if (isInited === true) {
        emitter.emitEvent('appInited');
      }
    }.bind(this);
  
  
    /////////////////////////////
  
    for (var keySpace in SPACES_TO_CREATE) {
        if (SPACES_TO_CREATE[keySpace]) {
            initedSpaces[keySpace] = null;
            emitter.subscribeEvent(CONFIG_SPACES[keySpace].emitInitiationId, function () {
                setObjectCompleteAndCheckIsInit(keySpace);
            }.bind(this));
  
            spaces[keySpace] = new CONFIG_SPACES[keySpace].constructor(studio, ui, emitter);
        }
    }

    
  
  
    /** START ***********************************************************/
  
    emitter.subscribeEvent('appInited', function () {
        for (var key in spaces) {
          if (spaces[key].startUpdate) {
            spaces[key].startUpdate();
          }
        }

      
      /** IF DISABLE FOREST SCENARIO UNCOMME */
      if (!SPACES_TO_CREATE['walkOnForestLogic']) {
        emitter.emitEvent('startCardsGame');
        emitter.subscribeEvent('cardsGameFinished', function () {
            emitter.emitEvent('startCardsGame');  
        });
      }

      /** IF DISABLE FOREST SCENARIO CARDS */
      if (!SPACES_TO_CREATE['cardsPlayLogic']) {
        emitter.subscribeEvent('startCardsGame', function () {
            emitter.emitEvent('cardsGameFinished');  
        });
      } 

    }.bind(this));  
  };