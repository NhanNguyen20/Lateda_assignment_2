var newProdBtn = document.querySelector('.new-products');
var featuredProdBtn = document.querySelector('.featured-products');
var newProdContainer = document.querySelector('.new-prod-container');
var featuredProdContainer = document.querySelector('.featured-prod-container');
var currentVisibleItem = newProdContainer;  // set the current displayed tab products
var currentVisibleBtn = newProdBtn; 

function switchVisibility(btn, item) {
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