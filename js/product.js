const productImages = document.querySelectorAll(".product-images img"); // selecting all image thumbs
const productImageSlide = document.querySelector(".image-slider"); // seclecting image slider element

let activeImageSlide = 0; // Imagen deslizanate 

productImages.forEach((item, i) => { // loopinh 
    item.addEventListener('click', () => { // agregar evento de clic a cada miniatura de imagen
        productImages[activeImageSlide].classList.remove('active'); //eliminando la clase activa del pulgar de la imagen actual
        item.classList.add('active'); // agregando una clase activa a la miniatura de la imagen actual
        productImageSlide.style.backgroundImage = `url('${item.src}')`; // configurar la imagen de fondo del control deslizante de imagen
        activeImageSlide = i; // actualizando la variable del control deslizante de imagen para rastrear el pulgar actual
    })
})

// botones de cambio de tamaño

const sizeBtns = document.querySelectorAll('.size-radio-btn'); 
let checkedBtn = 0; 

sizeBtns.forEach((item, i) => { // recorriendo cada botón
    item.addEventListener('click', () => { // agregando un evento de clic a cada
        sizeBtns[checkedBtn].classList.remove('check'); // eliminando la clase de verificación del botón actual
        item.classList.add('check'); // agregando clase de verificación al botón en el que se hizo clic
        checkedBtn = i; // actualizando la variable
        size = item.innerHTML;
    })
})

const setData = (data) => {
    let title = document.querySelector('title');

    // configurar las imágenes

    productImages.forEach((img, i) => {
        if(data.images[i]){
            img.src = data.images[i];
        } else{
            img.style.display = 'none';
        }
    })
    productImages[0].click();

    // botones de tamaño de configuración
    sizeBtns.forEach(item => {
        if(!data.sizes.includes(item.innerHTML)){
            item.style.display = 'none';
        }
    })

    //configurando textos 
    const name = document.querySelector('.product-brand');
    const shortDes = document.querySelector('.product-short-des');
    const des = document.querySelector('.des');

    title.innerHTML += name.innerHTML = data.name;
    shortDes.innerHTML = data.shortDes;
    des.innerHTML = data.des;

    // precios
    const sellPrice = document.querySelector('.product-price');
    const actualPrice = document.querySelector('.product-actual-price');
    const discount = document.querySelector('.product-discount');

    sellPrice.innerHTML = `$${data.sellPrice}`;
    actualPrice.innerHTML = `$${data.actualPrice}`;
    discount.innerHTML = `( ${data.discount}% off )`;

    // Lista de deseos y carrito btn
    const wishlistBtn = document.querySelector('.wishlist-btn');
    wishlistBtn.addEventListener('click', () => {
        wishlistBtn.innerHTML = add_product_to_cart_or_wishlist('wishlist', data);
    })

    const cartBtn = document.querySelector('.cart-btn');
    cartBtn.addEventListener('click', () => {
        cartBtn.innerHTML = add_product_to_cart_or_wishlist('cart', data);
    })
}

// Obtener datos
const fetchProductData = () => {
    fetch('/get-products', {
        method: 'post',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({id: productId})
    })
    .then(res => res.json())
    .then(data => {
        setData(data);
        getProducts(data.tags[1]).then(data => createProductSlider(data, '.container-for-card-slider', 'similar products'))
    })
    .catch(err => {
        location.replace('../404.html');
    })
}

let productId = null;
if(location.pathname != '../products.html'){
    productId = decodeURI(location.pathname.split('/').pop());
    fetchProductData();
}