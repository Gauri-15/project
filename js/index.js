// init functions
const close = document.querySelector('.close');
const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');
const cards = document.querySelectorAll('.pro');
let mainImage = document.getElementById("MainImg");
let smallImages = Array.from(document.getElementsByClassName("small-img"));
const authContainer = document.querySelector('.auth');

const onload = () => {
    window.onload = () => {
        close.classList.add('hide');
        authContainer.classList.add('hide');
    };
    window.onload();
}

onload();



// active navigation logic
if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
        bar.classList.add('hide');
        close.classList.remove('hide');
        authContainer.classList.remove('hide');
        authContainer.classList.add('slide-left');
    })
}
if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
        bar.classList.remove('hide');
        close.classList.add('hide');
        authContainer.classList.remove('slide-left');
        authContainer.classList.add('hide');
    })
}

// change header background color on scroll
let className = "inverted";
let scrollTrigger = 60;

window.onscroll = function () {
    // We add pageYOffset for compatibility with IE.
    if (window.scrollY >= scrollTrigger || window.pageYOffset >= scrollTrigger) {
        document.getElementsByTagName("header")[0].classList.add(className);
    } else {
        document.getElementsByTagName("header")[0].classList.remove(className);
    }
};

// card to card details page navigation logic
cards.forEach((card) => {
    card.addEventListener('click', (e) => {
        window.location.href = 'product.html';
    })
})

// product page image switch logic
smallImages.forEach((smallImage) => {
    smallImage.addEventListener('click', (e) => {
        mainImage.src = e.target.src;
    })
})