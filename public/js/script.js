// Trendy Product Tabs
var newProdBtn = document.querySelector('.new-products');
var featuredProdBtn = document.querySelector('.featured-products');
var newProdContainer = document.querySelector('.new-prod-container');
var featuredProdContainer = document.querySelector('.featured-prod-container');
var currentVisibleItem = newProdContainer;  // set the current displayed tab products
var currentVisibleBtn = newProdBtn; 

let switchVisibility = (btn, item) => {
    btn.addEventListener('click', () => {
        currentVisibleItem.classList.add("hidden");
        currentVisibleBtn.classList.add("hidden-color");
        item.classList.remove("hidden");
        btn.classList.remove("hidden-color");
        currentVisibleItem = item;
        currentVisibleBtn = btn;
    })
}

switchVisibility(newProdBtn, newProdContainer);
switchVisibility(featuredProdBtn, featuredProdContainer);

// Hero Banner Slider
const slider = document.querySelector('.hero-slider');
const slide = document.querySelectorAll('.hero-slide');
let activeSlide = 0; 
let numOfSlide = slide.length; // return the number of all .hero-slide
let slideWidth = slide[0].clientWidth;  //get the width of the images
let dots = document.querySelectorAll('.dots li');

let prev = document.querySelector('.left-btn');
let nxt = document.querySelector('.rgt-btn');

let autoSlider = () => {
    slider.style.transform = `translateX(-${slideWidth * activeSlide}px)`;
    slider.style.transition = 'transform 1s ease-in-out';

    dots.forEach(dot => {dot.classList.remove('active')})
    dots[activeSlide].classList.add('active')
}   

nxt.onclick =  () => {
    if (activeSlide + 1 > numOfSlide - 1) {
        activeSlide = 0;
    } else {activeSlide ++}
    autoSlider();
    clearInterval(refreshSlide);
    refreshSlide = setInterval(nxt.onclick, 3000)
}

prev.onclick = () =>{
    if (activeSlide == 0) {
        activeSlide = numOfSlide - 1;
    } else {activeSlide --}
    autoSlider();
    clearInterval(refreshSlide);
    refreshSlide = setInterval(nxt.onclick, 3000);
}

let refreshSlide = setInterval(nxt.onclick, 3000)

// Clickable dot menu
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        activeSlide = index;
        autoSlider();
    })
})