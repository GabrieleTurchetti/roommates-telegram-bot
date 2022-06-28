const inlineKeyboards = { 
    start: {
        inline_keyboard: [
            [
                {text: 'Shifts', callback_data: 'shifts'},
                {text: 'Shopping', callback_data: 'shopping'}
            ],
            [
                {text: 'Bills', callback_data: 'bills'}
            ]
        ]
    },
    shopping: {
        inline_keyboard: [
            [
                {text: '<<', callback_data: 'returnStart'},
            ],
            [
                {text: 'Add prod.', callback_data: 'addProducts'},
                {text: 'Remove prod.', callback_data: 'removeProducts'}
            ],
            [
                {text: 'Show list', callback_data: 'showProducts'},
                {text: 'Shopping done!', callback_data: 'deleteList'}
            ]
        ]
    },
    sureDeleteList: {
        inline_keyboard: [
            [
                {text: 'Sure?', callback_data: 'sure'},
            ],
            [
                {text: 'Yes', callback_data: 'yesDeleteList'},
                {text: 'No', callback_data: 'noDeleteList'}
            ]
        ]
    },
    bills: {
        inline_keyboard: [
            [
                {text: '<<', callback_data: 'returnStart'},
            ],
            [
                {text: 'Add bills', callback_data: 'addBills'},
                {text: 'Remove bills', callback_data: 'removeBills'}
            ],
            [
                {text: 'Show bills', callback_data: 'showBills'},
            ]
        ]
    },
    addBills: {
        inline_keyboard: [
            [
                {text: '<<', callback_data: 'returnBills'},
            ],
            [
                {text: 'billType0', callback_data: 'addBillType0'},
                ...
            ] //insert all bills' types
        ]
    },
    removeBills: {
        inline_keyboard: [
            [
                {text: '<<', callback_data: 'returnBills'},
            ],
            [
                {text: 'billType0', callback_data: 'removeBillType0'},
                ...
            ] //insert all bills' types
        ]
    },
    sureRemoveBill: {
        inline_keyboard: [
            [
                {text: 'Sure?', callback_data: 'sure'},
            ],
            [
                {text: 'Yes', callback_data: 'yesRemoveBill'},
                {text: 'No', callback_data: 'noRemoveBill'}
            ]
        ]
    },
    showBills: {
        inline_keyboard: [
            [
                {text: '<<', callback_data: 'returnBills'},
            ],
            [
                {text: 'billType0', callback_data: 'showBillType0'},
                ...
            ] //insert all bills' types
        ]
    }
}

exports.inlineKeyboards = inlineKeyboards