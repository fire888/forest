import Cards from '../Objects/Cards';
import MouseHover from '../Space/MouseHover'

export default function (s, u, e) {

    var studio = s;
    var ui = u;
    var emitter = e;

    var step = 0;
    var firstCard = null;
    var secondCard = null;



    /** INIT  ******************************************************/

    var cards = new Cards(e);
    var mouseHover = new MouseHover(emitter, studio.getCamera());

    emitter.subscribeEvent('addMouseHover', function (mesh) {
        mesh.position.y += 5; 
    })
    emitter.subscribeEvent('removeMouseHover', function (mesh) {
        mesh.position.y -= 5; 
    });



    /** RESET ******************************************************/

    emitter.subscribeEvent('startCardsGame', function () {
        step = 0;
        firstCard = null;
        secondCard = null;   

        cards.setCardsInRandomPositions();
        mouseHover.addObjects(cards.cardGroup.children);
        cards.cardGroup.position.y = -50;
        studio.addToScene(cards.cardGroup);
    }.bind(this));



    /** CLICK LOGICS ***********************************************/

    emitter.subscribeEvent('clickOnObject', function (mesh) {
        if (firstCard !== null && mesh.id === firstCard.id) {
            return;
        }
        if (secondCard !== null && mesh.id === secondCard.id) {
            return;
        }    


        if (firstCard === null) {
            firstCard = mesh;
            mesh.material.map = mesh.userData.texture;
            mesh.userData.isTop = true;
        } else {
            if (secondCard === null) {
                secondCard = mesh;
                mesh.material.map = mesh.userData.texture;
                mesh.userData.isTop = true;

                if (secondCard.userData.typeCard === firstCard.userData.typeCard) {
                    emitter.emitEvent('findTwoCards', { firstCard, secondCard });
                } else {
                    emitter.emitEvent('mistakeOpenCard', null);
                }
            } else {
                firstCard.material.map = cards.textureBack;
                firstCard.userData.isTop = false;
                firstCard = null;

                secondCard.material.map = cards.textureBack;
                secondCard.userData.isTop = false;
                secondCard = null;

                firstCard = mesh;
                mesh.material.map = mesh.userData.texture;
                mesh.userData.isTop = true;
            }
        }

        step ++;
        emitter.emitEvent('userMakeStep', step);
    });



    /** CHECK RESULT  *****************************************************/

    emitter.subscribeEvent('findTwoCards', function (findCards) {
        mouseHover.removeObjects([ findCards.firstCard.id, findCards.secondCard.id ]);
        findCards.firstCard.rotation.x = 0.5;
        findCards.secondCard.rotation.x = 0.5;
        setTimeout( function() {
            cards.cardGroup.remove(findCards.firstCard);
            cards.cardGroup.remove(findCards.secondCard);
            if (cards.cardGroup.children.length === 0) {
                emitter.emitEvent('cardsGameFinished');
            }
        }.bind(this), 1500);
    });
}