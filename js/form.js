// Redirigir a la pagina de inicio 
window.onload = () => {
    if(sessionStorage.user){
        user = JSON.parse(sessionStorage.user);
        if(compareToken(user.authToken, user.email)){
            location.replace('/');
        }
    }
} 

const loader = document.querySelector('.loader'); 

// seleccionar inputs 
const submitBtn = document.querySelector('.submit-btn');
const name = document.querySelector('#name') || null;
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const number = document.querySelector('#number') || null;
const tac = document.querySelector('#terms-and-cond') || null;
const notification = document.querySelector('#notification') || null;

submitBtn.addEventListener('click', () => {
    if(name != null){ // registro
        if(name.value.length < 3){
            showAlert('el nombre debe tener 3 letras');
        } else if(!email.value.length){
            showAlert('Ingresa tu mail');
        } else if(password.value.length < 8){
            showAlert('la contraseña debe tener 8 letras');
        } else if(!number.value.length){
            showAlert('Ingrese su número telefónico');
        } else if(!Number(number.value) || number.value.length < 10){
            showAlert('número inválido, por favor ingrese uno válido');
        } else if(!tac.checked){
            showAlert('debes aceptar nuestros términos y condiciones');
        } else{     
            // ENVIAR FORMULARIO
            loader.style.display = 'block';
            sendData('../signup.html', {
                name: name.value,
                email: email.value,
                password: password.value,
                number: number.value,
                tac: tac.checked,
                notification: notification.checked,
                seller: false
            })
        }
    } else{
        // pagina de ingreso
        if(!email.value.length || !password.value.length){
            showAlert('fill all the inputs');
        } else{
            loader.style.display = 'block';
            sendData('../login.html', {
                email: email.value,
                password: password.value,
            })
        }
    }
})
