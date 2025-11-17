function initHotelPriceForm(callback) {
    $('#HotelPriceForm').ultraForm({
        uiType: 1,
        action: '/Hotels/HotelPriceEdit',
        actionType: 'ajax',
        props: [
            { name: 'Id', type: 'hidden' },

            {
                name: 'HotelId',
                type: 'number'
            },

            {
                name: 'RoomId',
                type: 'number'
            },

            {
                name: 'Gia_Goc',
                type: 'money'
            },

            {
                name: 'Gia_Giam',
                type: 'money'
            },

            {
                name: 'Ngay',
                type: 'datepicker'
            },

            {
                name: 'Code',
                type: 'text'
            },
        ],
        initCallback: function (form) {
        },
        beforSubmit: function (form) { }, afterSubmit: function (result) {
            if (result.Success) { callback(result.Data); } else { app.notify('warning', result.Message); }
        }
    });
};