
export default function () {
 
    var storage = {};


    this.emitEvent = function (id, data) {
        if (!storage[id]) {
            storage[id] = [];
        }
        var sendData = data || null;
        for (var i = 0; i < storage[id].length; i++) {
            storage[id][i](sendData);
        }
    };


    this.subscribeEvent = function (id, callback) {
        if (!storage[id]) {
            storage[id] = [];
        }
        storage[id].push(callback);
    };

};