window.fbAsyncInit = function() {
    FB.init({
        appId: '255378138964948',
        autoLogAppEvents: true,
        xfbml: true,
        cookie: true,
        version: 'v6.0',
        status: true
    });
    if (sessionStorage.getItem('userAuth') == "er") {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                window.location.href = "/user/facebook/login?userID=" + response.authResponse.userID + "&accessToken=" + response.authResponse.accessToken;
            }
        });
    }
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function facebookLogin() {

    FB.login(function(response) {
        if (response.status === 'connected') {
            window.location.href = "/user/facebook/login?userID=" + response.authResponse.userID + "&accessToken=" + response.authResponse.accessToken;
        } else {
            alert('NO logro conectar a Facebook, por favor intente de nuevo. ')
        }
    });
}

function facebookLogout() {
    FB.logout(function(response) {
        window.location.href = "/user/logout";
    });
}

var x = setInterval(function() {
    var now = new Date().getTime();
    var distance = sessionStorage.getItem('nextSorteo') - now;
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    let t = days > 0 ? days + "d-" + hours + ":" +
        minutes + ":" + seconds : hours + ":" +
        minutes + ":" + seconds;
    document.getElementById("counter1").innerHTML = t;
    document.getElementById("counter2").innerHTML = t;
    document.getElementById("counter3").innerHTML = t;
    if (days == 0 & hours == 0 & minutes == 0 & seconds == 0) {
        setTimeout(function() { window.location.href = '/'; }, 1000);
    }
    if (distance < 0) {
        clearInterval(x);
        document.getElementsByClassName("counter").innerHTML = "EXPIRED";
    }

    let ahora = new moment();
    let start = new moment().set({ hour: 21, minute: 00 });
    let end = new moment().set({ hour: 23, minute: 59 });
    let winbut = document.getElementById('winnersButtonP');
    let val = document.getElementById('nocturnaValue').innerHTML;
    if (ahora.isBetween(start, end)) {

        if (val == '----' || val == '') {
            winbut.style.display = 'none';

        } else {
            winbut.style.display = 'block';
        }
    }
}, 1000);

function addBet() {
    let num = document.getElementById('numero')
    let imp = document.getElementById('importe')
    credito = Number(sessionStorage.getItem('credito'));
    let counterBe = sessionStorage.getItem('counterBet');
    let betImport = sessionStorage.getItem('betImport');
    if (num.value == '' || num.value.length <= 1) {
        alert('Introduzca un Numero de al menos dos digitos. Ejemplo: 04')
    } else {
        if (imp.value == '' || imp.value < 4 || imp.value < 0) {
            alert('El importe no puede ser menor a 4')
        } else {
            if (Number(imp.value) <= Number(credito)) {
                sessionStorage.setItem('credito', Number(credito) - Number(imp.value));
                sessionStorage.setItem('betImport', Number(betImport) + Number(imp.value));
                newElement(
                    document.getElementById('betWrapper'),
                    'input', [
                        ['name', 'jugada'],
                        ['hidden', 'hidden'],
                        ['value', [num.value, imp.value]],
                        ['id', 'betGroup' + counterBe]
                    ]);
                sessionStorage.setItem('counterBet', Number(counterBe) + 1);

                newRow('betNumbers', [num.value, 'Ciudad', imp.value + '<img src="./img/monedas.png" class="a51"> <a href="#" onclick="removeElement(' + counterBe + ',' + imp.value + ')" class="a150 tooltipped" data-position="bottom" data-tooltip="Eliminar el Nro ' + num.value + '?">x</a>'], 'betShowId' + counterBe);
                document.getElementById('userCreditoJugada').innerHTML = sessionStorage.getItem('credito') + ' ';
                document.getElementById('userCredit').innerHTML = sessionStorage.getItem('credito') + ' '

            } else {
                if (Number(credito) == 0) {
                    alert('su crédito se ha agotado')
                } else {
                    alert('Su crédito no es suficiente, por favor intente con un monto igual o menor a ' + credito)
                }
            }
            num.value = '';
            imp.value = '';
        }
    }
}

function newElement(group, el, attr) {
    let newEl = document.createElement(el);
    attr.forEach(element => {
        newEl.setAttribute(element[0], element[1])
    });
    group.appendChild(newEl);
}

function removeElement(id, importe) {
    let credito = sessionStorage.getItem('credito');
    let count = sessionStorage.getItem('counterBet');
    credito = Number(credito) + Number(importe);
    sessionStorage.setItem('credito', credito);
    let total = Number(sessionStorage.getItem('betImport'));
    total = total - Number(importe);
    sessionStorage.setItem('betImport', total);
    document.getElementById('totalBet').innerHTML = Number(sessionStorage.getItem('betImport'));
    document.getElementById('betShowId' + id).remove();
    document.getElementById('betGroup' + id).remove();
    sessionStorage.setItem('counterBet', Number(count) - 1);
    document.getElementById('userCreditoJugada').innerHTML = sessionStorage.getItem('credito') + ' ';
    document.getElementById('userCredit').innerHTML = sessionStorage.getItem('credito') + ' '

    sessionStorage.getItem('counterBet') > 0 ? elementState('betButtonSubmit', true) :
        elementState('betButtonSubmit', false);
}

function newRow(parentList, innerText, id) {
    let list = document.getElementById(parentList);
    let row = document.createElement('tr');
    row.setAttribute('id', id);
    innerText.forEach(element => {
        let td = document.createElement('td');
        td.innerHTML = element;
        row.appendChild(td)
    })
    list.insertBefore(row, list.childNodes[0]);
    document.getElementById('totalBet').innerHTML = Number(sessionStorage.getItem('betImport'));
    elementState('betButtonSubmit', true)
}

/* function valideKey(evt, obj) {
    var code = evt.which ? evt.which : evt.keyCode;
    console.log((obj.value).length)
    if (code == 8) {
        //backspace
        return true;
    } else if (code >= 48 && code <= 57 && (obj.value).length <= 3) {
        //is a number
        return true;
    } else {
        return false;
    }
} */


function valideKey(evt, obj) {
    let patt = new RegExp(/[0-9]{0,3}/g);
    let p = new RegExp(/[\.]/g);
    let e = evt;
    let key = e.keyCode || e.which;
    var code = evt.which ? evt.which : evt.keyCode;
    alert(e.key, "otra val=" + obj.value)
    if (patt.test(e.key) && (obj.value).length <= 3 && !p.test(e.key)) {
        console.log('validar patron: ', patt.test(e.key), '\n',
            'Longitud del Value: ', (obj.value).length, '\n',
            'valor e.key: ', e.key, '\n',
            'validar punto:  ', !p.test(e.key))
        return true
    } else if (code == 8) {
        //backspace
        return true;
    } else {
        //obj.blur()
        return false;
    }
}

function elementState(el, op) {
    let e = document.getElementById(el);
    op ? e.disabled = false : e.disabled = true;
}

function whereSelected() {
    let when = document.getElementById("cuando-select").value;
    let whenDay = moment(when).locale('es-do').format("dddd DD[/]MM");
    let where = document.getElementById("donde-select");
    let whereSelected = where.options[where.selectedIndex].text;
    let form = document.getElementById('whenWhereQuery');
    form.innerHTML = "";
    let newCity = document.createElement('input');
    newCity.setAttribute('value', whereSelected);
    newCity.setAttribute('hidden', 'hidden');
    newCity.setAttribute('name', 'city');
    let newDay = document.createElement('input');
    newDay.setAttribute('value', whenDay);
    newDay.setAttribute('hidden', 'hidden');
    newDay.setAttribute('name', 'day');
    form.appendChild(newCity);
    form.appendChild(newDay);
}

window.onload(function() {
    var elems = document.querySelectorAll('.tooltipped');
    var instances = M.Tooltip.init(elems, null);
    let now = new moment();
    let start = new moment().set({ hour: 20, minute: 40 });
    let end = new moment().set({ hour: 21, minute: 20 });
    /*  if (now.isBetween(start, end)) {
         document.getElementById('playButton1').innerHTML = "";
         document.getElementById('playButton2').innerHTML = "";
         document.getElementById('modal7').innerHTML = "";
     } */

});






var modal = document.querySelectorAll('.modal');
/* var select = document.querySelectorAll('select');

var sidenav=document.querySelectorAll('.sidenav');
var input = document.querySelectorAll('input')
var formInstance = M.FormSelect.init(select, options=null);
var modalInstance = M.Modal.init(modal, options=null);
var sidenavInstance = M.Sidenav.init(sidenav, options=null);
M.updateTextFields(); */

window.onload(function() {
    let today = ''
    if (sessionStorage.getItem("day")) {
        today = new moment(sessionStorage.getItem("day"));
    } else {
        today = new moment();
    }
    let now = new moment();
    if (today.day() == (now.day()) - 1) {
        today = today.locale('es-do').format("[Ayer] dddd [en ]")
        document.getElementById('cuando-donde').innerHTML = today + sessionStorage.getItem('city')
    } else {
        if (today.day() == now.day()) {
            today = today.locale('es-do').format("[Hoy] dddd [en ]")
            document.getElementById('cuando-donde').innerHTML = today + sessionStorage.getItem('city')
        } else {
            today = today.locale('es-do').format("dddd, D[/]M [en ]")
            document.getElementById('cuando-donde').innerHTML = today + sessionStorage.getItem('city')
        }
    }

    for (let i = 0; i < 30; i++) {
        let today = moment().subtract(i, 'days').locale('es-do').format("dddd, D [de] MMMM [de] YYYY");
        let val = moment().subtract(i, 'days')
        if (val.day() != 0) {
            let newel = document.createElement('option');
            let whenSelector = document.getElementById('cuando-select');
            newel.setAttribute('value', val.locale('es-do').format("YYYY[-]MM[-]DD"));
            newel.innerHTML = today;
            whenSelector.appendChild(newel);
        }
    }
}())