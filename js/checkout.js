window.onload = () => {
    if(!sessionStorage.user){
        loaction.replace('../login.html');
    }
}

const placeOrderBtn = document.querySelector('.place-order-btn');
placeOrderBtn.addEventListener('click', () => {
    let address = getAddress();

    if(address){
        fetch('/order', {
            method: 'post',
            headers: new Headers({'Content-Type': 'application/json'}),
            body: JSON.stringify({
                order: JSON.parse(localStorage.cart),
                email: JSON.parse(sessionStorage.user).email,
                add: address,
            })
        }).then(res => res.json())
        .then(data => {
            if(data.alert == 'tu pedido esta hecho'){
                delete localStorage.cart;
                showAlert(data.alert, 'éxito');
            } else{
                showAlert(data.alert);
            }
        })
    }
})

const getAddress = () => {
    // validacion 
    let direccion = document.querySelector('#direccion').value;
    let calle = document.querySelector('#calle').value;
    let ciudad = document.querySelector('#ciudad').value;
    let provincia = document.querySelector('#provincia').value;
    let codigopostal = document.querySelector('#codigopostal').value;
    let puntodereferencia = document.querySelector('#puntodereferencia').value;

    if(!direccion.length || !calle.length || !ciudad.length || !provincia.length || !codigopostal.length ||  !puntodereferencia.length){
        return showAlert('llenar todas las entradas primero');
    } else{
        return { direccion, calle, ciudad, provincia, codigopostal, puntodereferencia };
    }
}