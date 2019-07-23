import Emitter from './Space/Emitter';
import Studio from './Space/Studio';
import Ui from './Space/Ui';
import AppManager from './Managers/AppManager';
import FrameUpdater from './Space/FrameUpdater';

var emitter = new Emitter();
var studio = new Studio(emitter);
var ui = new Ui(emitter);
            
var SPACES_TO_START = {
    'walkOnForestLogic': true,
    'cardsPlayLogic': true,
};

new AppManager(emitter, studio, ui, SPACES_TO_START);
new FrameUpdater(emitter);
