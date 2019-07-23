
var messages = {
    '1': 'Привет, бродяга.',
    '2': 'Заблудился в лесу? Мож встретится кто, покажет дорогу.',
    '3': 'Кажется кто-то идет.',
    '4': 'Опасный зверь - КОЛОБОК.',
    '5': '- Предлагаю сыграть в игру. У меня есть фото моих друзей.',
    '6': '- Ну что ж, до встречи...',
}


export default function (e) {

    var emitter = e;

    var container = document.getElementById('ui');
    

    /** *************************************** */

    var mess = document.createElement('div');
    container.appendChild(mess);
    mess.className = 'mess';
    var timeOut = null;

    this.showDefaultMessage = function (key, timer, color) {
        mess.innerText = messages[key];
        mess.style.color = color || '#ffffff';
        if (timeOut) {
            clearTimeout(timeOut);
        }
        timeOut = setTimeout( function() {
            mess.innerText = '';
        }.bind(this),  timer ? timer : 10000);
    };


    /** *************************************** */

    var steps = document.createElement('div');
    document.body.appendChild(steps);
    steps.style.display = 'none';
    steps.className = 'steps';
    steps.innerHTML = '20'; 

    emitter.subscribeEvent('startCardsGame', function () {
        steps.innerHTML = '0';
        steps.style.display = 'block';
    });

    emitter.subscribeEvent('cardsGameFinished', function () {
        steps.style.display = 'none';
    });

    emitter.subscribeEvent('userMakeStep', function (val) {
        steps.innerHTML = val + '';
    });
};