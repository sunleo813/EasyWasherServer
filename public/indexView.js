$('.alipay')
    .css({
        'background-color': '#6699FF',
        'display': 'block',
        'border': '2px solid #6699FF',
        'color': '#FFFF',
        'font-size': '18px',
        'text-align': "center",
        'margin-left' : 'auto',
        'margin-right' : 'auto',
        // 'padding': '14px 3px 14px 3px',
        // 'padding-left' :'14px',
        // 'padding-right' : '14px',
        'box-sizing': 'border-box',
        'border-radius': '5px'
    })



function getCarNumber() {
    var carNo = $('#carNo1 option:selected').text();
    carNo += $('#carNo2 option:selected').text();
    carNo += $('#carNo3').val();
    carNo += $('#carNo4 option:selected').text();
    console.log(carNo)
    $('#carNo').text(carNo);

}