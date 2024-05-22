
// Hamburger menu
 
document.addEventListener('DOMContentLoaded', function () {
    var hamburger = document.getElementById('hamburger');
    var navMenu = document.getElementById('nav-menu');
 
    hamburger.addEventListener('click', function () {
        // Check if the menu is open
        if (navMenu.style.width == '350px') {
            navMenu.style.width = '0';
        } else {
            navMenu.style.width = '350px';
        }
    });
});