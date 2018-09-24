


const serverURL='http://192.168.0.102:3000';

$('.alipay')
    .css({
        'background-color': '#6699FF',
        'display': 'block',
        'border': '2px solid #6699FF',
        'color': '#FFFF',
        'font-size': '18px',
        'text-align': "center",
        'margin-left': 'auto',
        'margin-right': 'auto',
        'box-sizing': 'border-box',
        'border-radius': '5px'
    })

$('#carNo')
    .css({
        'color': '#FF3366',
        'font-size': '18px',
        'text-align': 'center'
    })


$('.pay_button').hide();

// $('#carNo3').change(function(){
//     console.log('carNo3 changed')
//     getCarNumber();
// })


var carNo;

function getCarNumber() {
    carNo = $('#carNo1 option:selected').text();
    carNo += $('#carNo2 option:selected').text();
    carNo += $('#carNo3').val();
    carNo += $('#carNo4 option:selected').text();
    console.log(carNo)
    $('#carNo').text(carNo);
    if ($('#carNo3').val()) {
        $('.pay_button').show();
    }
}

function startAlipay(){
    location.replace('http://192.168.0.102:3000/alipayWapTrade?ShopID="ZUH-000"&Amount=18');
 }

