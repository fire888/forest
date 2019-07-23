import img01 from '../Assets/01.jpg';
import img02 from '../Assets/02.jpg';
import img03 from '../Assets/03.jpg';
import img04 from '../Assets/04.jpg';
import img05 from '../Assets/05.jpg';
import img06 from '../Assets/06.jpg';
import img07 from '../Assets/07.jpg';
import img08 from '../Assets/08.jpg';
import img09 from '../Assets/09.jpg';
import img10 from '../Assets/10.jpg';
import img11 from '../Assets/11.jpg';
import img12 from '../Assets/12.jpg';
import imgTree from '../Assets/tree.jpg';

var imgs = [img01, img02, img03, img04, img05, img06, img07, img08, img09, img10, img11, img12, imgTree];


export default function (e) {

    var emitter = e;
    var isPlay = false;
    this.cards = [];

    /** CONFIG **************************************************/

    var CONFIG = {
        cardW: 40,
        cardH: 70,
    }


    /** LOAD INIT ***********************************************/

    var textureLoader;
    var arrCardsTextures = [];
    var cardsFilesNames = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', 'tree']
    var currentLoaderIndex = 0;
    this.cardGroup = new THREE.Group();

    loadCards();
            
    function loadCards () {
        textureLoader = new THREE.TextureLoader();
        loadTexture(currentLoaderIndex)
    }
  
    function loadTexture(index) {
        textureLoader.load( imgs[index], function(texture) {
            arrCardsTextures.push(texture);
            index ++;
            if (imgs[index]) {
                loadTexture(index);
            } else {
                initCards();
            }
        })
    }
  
    var initCards = function () {
        this.cardGroup.position.set(-120, 50, -150);
        this.cardGroup.rotation.x = - 0.5;
        this.textureBack = arrCardsTextures[arrCardsTextures.length-1];
        var plane;
        for (let i = 0; i < arrCardsTextures.length - 1; i++) {
        //for (let i = 0; i < 2; i++) {
            plane = initCard(i); 
            this.cards.push(plane);
            plane = initCard(i);
            this.cards.push(plane);
        }
        emitter.emitEvent('cardsMeshesInited');   
    }.bind(this);


    var initCard = function (i) {
        var plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(CONFIG.cardW, CONFIG.cardH, 20, 20),
            new THREE.MeshBasicMaterial({ 
                color: 0xffffff,
                map: this.textureBack,
            })
        )
        plane.userData.surface = []
        for (var iv = 2; iv < plane.geometry.attributes.position.array.length; iv+=3) {
            var value = (Math.random()-0.5) * 2.;
            plane.geometry.attributes.position.array[iv] = value;
            plane.userData.surface.push(value);
        }
        plane.userData.typeCard = cardsFilesNames[i];
        plane.userData.isTop = false
        plane.userData.texture = arrCardsTextures[i];
        return plane;
    }.bind(this);



    /** METHODS ********************************************************/

    this.setCardsInRandomPositions = function () {
        var tempArrCards = [].concat(this.cards);
        for (let i = 0; i < this.cards.length; i++) {
            let rand = Math.floor(Math.random() * tempArrCards.length);

            tempArrCards[rand].rotation.set(0, 0, 0);
            tempArrCards[rand].material.map = this.textureBack;
            tempArrCards[rand].userData.isTop = false;
            this.cardGroup.add(tempArrCards[rand]);

            tempArrCards[rand].position.set(
                (i % 6 ) * (CONFIG.cardW + 7), 
                Math.floor(i / 6) * (CONFIG.cardH + 7), 
                0
            );

            tempArrCards.splice(rand, 1);   
        } 
    }.bind(this);



    /** UPDATE ********************************************************/

    emitter.subscribeEvent('frameUpdate', function (data) { 
            update(data);
        });

    emitter.subscribeEvent('cardsMeshesInited', function () { 
            isPlay = true;
        });


    var update = function (data) {
        if (!isPlay) {
            return;
        }
        updateCardsGeometry(data);
    }.bind(this);

    var updateCardsGeometry = function (data) {
        for (var i = 0; i < this.cards.length; i++) {
            var position = this.cards[i].geometry.attributes.position;
            for (var iv = 2; iv < position.array.length; iv +=3) {
               position.array[iv] += 
                 Math.sin( (data.time/200) + (position.array[iv])/50 - iv) * (this.cards[i].userData.surface[Math.floor(iv/3)]+Math.cos(data.count)) / 20;
            } 
            this.cards[i].geometry.attributes.position.needsUpdate = true
        }
    }.bind(this);
};