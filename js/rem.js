(function (){
    function setRem(){
        let pageWidth = innerWidth;
        let baseWidth = 375;
        let fontSize = pageWidth/baseWidth * 100;
        document.getElementsByTagName('html')[0].style.fontSize = fontSize + 'px';
    }
    setRem();
    window.onresize = function () {
        setRem();
    }
})()