
$(document).ready(function () {
    var pagamento_data = {}
    location.search.substr(1).split("&").forEach(function (item) { pagamento_data[item.split("=")[0]] = item.split("=")[1] });
    setPageValues(pagamento_data);
    $('#cpf-payer').mask('000.000.000-00', { reverse: true });
    $('#cpf-payer').keyup(function (e) {
        if (/\D/g.test(this.value)) {
            // Filter non-digits from input value.
            this.value = this.value
        }
    });
    startPagamentos();
    
});

//START PAGE ZONE
function setPageValues(data) {
    dataContratacao = "" + data.data.slice(6, 8) + "/" + data.data.slice(4, 6) + "/" + data.data.slice(0, 4);
    $('#data-servico').text(dataContratacao);
    getUserPromise(data.usuario).then((buyerResponse) => {
        $('#nome-usuario').val(buyerResponse.name);
    });
    getServicePromise(data.servico).then((response) => {
        $('#preco-servico').text(response.price);
        $('#preco-servico').val(response.price);
        getUserPromise(response.id_user).then((ownerResponse) => {
            $('#nome-prestador').text(ownerResponse.name);
        })
    });
    getHorarioPromise(data.horario).then((horarioResponse) => {
        begin = horarioResponse.begin_time.slice(0, 2) + ':' + horarioResponse.begin_time.slice(2, 4) + ':' + horarioResponse.begin_time.slice(4, 6);
        end = horarioResponse.end_time.slice(0, 2) + ':' + horarioResponse.end_time.slice(2, 4) + ':' + horarioResponse.end_time.slice(4, 6);
        horario = begin + ' - ' + end;
        $('#horario-servico').text(horario);
        $('#horario-servico').val(horario);
    })
}

function getServicePromise(idServico) {
    return new Promise((resolve, reject) => {
        $.get(rota_servico, { service_id: idServico }, function () {
        }).done(function (dados) {
            resolve(JSON.parse(dados).data[0]);
        })
    });
}
function getUserPromise(idUser) {
    return new Promise((resolve, reject) => {
        $.get(rota_user, { userId: idUser }, () => { }).done((data) => {
            resolve(JSON.parse(data).data[0]);
        });
    });
}
function getHorarioPromise(idHorario) {
    return new Promise((resolve, reject) => {
        $.get(rota_horario_Servico, { id: idHorario }, () => { }).done((data) => {
            resolve(JSON.parse(data).data[0]);
        });
    });
}

//PAGAMENTO ZONE
function startPagamentos(){
    paypal.Buttons({
        createOrder: function (data, actions) {
            // Set up the transaction
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: $('#preco-servico').val()
                    }
                }]
            });
        },
        onApprove: function (data, actions) {
            actions.redirect('https://www.google.com');
            // Capture the funds from the transaction
            return actions.order.capture().then(function (details) {
                // Show a success message to your buyer
                alert('Transaction completed by ' + details.payer.name.given_name);
            });
        },
        onCancel: function (data, actions) {
            actions.redirect('https://www.youtube.com');
        }
    }).render('#paypal-area');
    $('#boleto-button').click(function (event) {
        //insert validation or mask
        if ($('#cpf-payer').val()) {
            $.post('https://sandbox.boletobancario.com/boletofacil/integration/api/v1/issue-charge',
                {
                    token: 'BBCAB4FCBDDB9DE190DE24D621FA18715E29716C68B05AF51F061B611E1ADAAE',
                    description: 'Appet Contratacao Servico',
                    amount: $('#preco-servico').val(), // this will be the value of service 
                    payerName: $('#nome-usuario').val(), // information based on the user logged
                    payerCpfCnpj: $('#cpf-payer').val() //this will be the value at cpf-payer
                    //notificationUrl: url da rota que ira manipular pagamento do boleto
                }
            ).done(function (data) {
                var response_boleto = data
                console.log(data);
                window.open(response_boleto.data.charges[0].link, '_blank').focus()
            })
        }
        else {
            alert('empty');
        }
    })
}