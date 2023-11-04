const {Telegraf} = require('telegraf')
const inlineKeyboards = require('./inline_keyboards').inlineKeyboards
const conn = require('./connection').conn
const fs = require('fs')
const axios = require('axios')
const bot = new Telegraf('') // insert the bot token

// global variables
let state = 'start'
let globalFolderName = ''
let globalFileName = ''

// general methods
bot.start((ctx) => {
    state = 'start'
    ctx.reply('Roommates bot', {reply_markup: inlineKeyboards.start})
})

bot.on('text', (ctx) => {
    if (state == 'addProducts' || state == 'removeProducts') {
        let rows = ctx.message.text.replace("'", "").split('\n')
        let str = 'Cannot add or remove products'

        for (let i = 0; i < Math.min(rows.length, 100); i++) {
            const name = rows[i].split(' - ')[0]
            const quantity = !isNaN(rows[i].split(' - ')[1])?rows[i].split(' - ')[1]:undefined

            if (name.length > 0) {
                let sql = ''

                if (state == 'addProducts') {
                    str = 'Products added'
                    sql = `select count(name) as c from products where name like '${name}'`

                    conn.query(sql, function (err, result) {
                        try {
                            if (result[0].c == 0) {
                                if (quantity != undefined && quantity > 0) {
                                    sql = `insert into products values ('${name}', ${quantity})`
                                }
                                else {
                                    sql = `insert into products values ('${name}', 1)`
                                }
                            }
                            else {
                                if (quantity != undefined && quantity > 0) {
                                    sql = `update products set quantity = quantity + ${quantity} where name like '${name}'`
                                }
                                else {
                                    sql = `update products set quantity = quantity + 1 where name like '${name}'`
                                }
                            }
    
                            conn.query(sql, function (err, result) {
                                try {} catch {}
                            })
                        } catch {}         
                    })
                }
                else if (state == 'removeProducts') {
                    str = 'Products removed'

                    if (quantity != undefined && quantity > 0) {
                        sql = `update products set quantity = quantity - ${quantity} where name like '${name}'`
                    }
                    else {
                        sql = `delete from products where name like '${name}'`
                    }

                    conn.query(sql, function (err, result) {
                        try {} catch {}
                    })
                }
            }
        }

        ctx.reply(str)
    }
})

bot.on('document', (ctx) => {
    if (state == 'addLight' || state == 'addGas' || state == 'addWater' || state == 'addInternet' ) {
        state = 'addBills'
        const fileId = ctx.update.message.document.file_id
        const fileName = ctx.update.message.document.file_name

        ctx.telegram.getFileLink(fileId).then(url => { 
            axios({url: url.href, responseType: 'stream'}).then(response => {
                const stream = response.data.pipe(fs.createWriteStream(`./bills/${globalFolderName}/${fileName}`))

                stream.on('finish', () => {billsFunc()})

                ctx.reply('Files added')
            })
        }).catch(() => ctx.reply('Cannot add files'))
    }
})

bot.action('sure', (ctx) => {
    state = 'sure'
    ctx.answerCbQuery()
})

bot.action('returnStart', (ctx) => {
    state = 'start'
    ctx.answerCbQuery()
    ctx.editMessageText('Roommates bot', {reply_markup: inlineKeyboards.start})
})

bot.action('returnBills', (ctx) => {
    state = 'bills'
    ctx.answerCbQuery()
    ctx.editMessageText('Bills', {reply_markup: inlineKeyboards.bills})
})

bot.action('returnRemoveBills', (ctx) => {
    state = 'removeBills'
    ctx.answerCbQuery()
    ctx.editMessageReplyMarkup(inlineKeyboards.removeBills)
})

bot.action('returnShowBills', (ctx) => {
    state = 'showBills'
    ctx.answerCbQuery()
    ctx.editMessageReplyMarkup(inlineKeyboards.showBills)
})

// shifts method
// to ensure an optimal cycle of shifts the number of roommates and rooms must be coprime
bot.action('shifts', (ctx) => {
    state = 'shifts'
    ctx.answerCbQuery()
    const date1 = new Date()
    const date2 = new Date('01/01/2022')
    const difference = date1.getTime() - date2.getTime()
    const totalDays = Math.floor(difference/(1000*3600*24))

    function getName(totalDays) {
        const names = ['rommateName0', ...] //insert all roommate names

        if (totalDays%2 == 0) {
            return names[Math.floor(totalDays/2)%4]
        }

        return 'no one'
    }
    
    function getRoom(totalDays) {
        const rooms = ['roomName0', ...] //insert all room names

        if (totalDays%2 == 0) {
            return rooms[Math.floor(totalDays/2)%3]
        }

        return 'anything'
    }

    ctx.reply(`Today ${getName(totalDays)} has to clean ${getRoom(totalDays)}`)
})

// shopping methods
bot.action('shopping', (ctx) => {
    state = 'shoppping'
    ctx.answerCbQuery()
    ctx.editMessageText('Shopping', {reply_markup: inlineKeyboards.shopping})
})

bot.action('addProducts', (ctx) => {
    state = 'addProducts'
    ctx.answerCbQuery()
    ctx.reply('Insert:\nName - quantity')
})

bot.action('removeProducts', (ctx) => {
    state = 'removeProducts'
    ctx.answerCbQuery()
    ctx.reply('Remove:\nName - quantity')
})

bot.action('showProducts', (ctx) => {
    state = 'showProducts'
    ctx.answerCbQuery()
    const sql = 'select * from products'

    conn.query(sql, function (err, result) {
        try {
            let str = 'List:'

            for (let i = 0; i < result.length; i++) {
                str = `${str}\n- ${result[i].name}: x${result[i].quantity}`
            }

            ctx.reply(str)
        } catch {
            ctx.reply('Cannot retrieve the list')
        }
    })
})

bot.action('deleteList', (ctx) => {
    state = 'deleteList'
    ctx.answerCbQuery()
    ctx.editMessageReplyMarkup(inlineKeyboards.sureDeleteList)
})

bot.action('yesDeleteList', (ctx) => {
    state = 'yesDeleteList'
    ctx.answerCbQuery()
    ctx.editMessageReplyMarkup(inlineKeyboards.shopping)
    const sql = 'delete from products'

    conn.query(sql, function (err, result) {
        try {
            ctx.reply('List deleted')
        } catch {
            ctx.reply('Cannot delete the list')
        }
    })
})

bot.action('noDeleteList', (ctx) => {
    state = 'noDeleteList'
    ctx.answerCbQuery()
    ctx.editMessageReplyMarkup(inlineKeyboards.shopping)
})


// bills methods
bot.action('bills', (ctx) => {
    state = 'bills'
    ctx.answerCbQuery()
    ctx.editMessageText('Bills', {reply_markup: inlineKeyboards.bills})
})

bot.action('addBills', (ctx) => {
    state = 'addBills'
    ctx.answerCbQuery()
    ctx.editMessageText('Add bils', {reply_markup: inlineKeyboards.addBills})
})

bot.action('removeBills', (ctx) => {
    state = 'removeBills'
    ctx.answerCbQuery()
    ctx.editMessageText('Remove bills', {reply_markup: inlineKeyboards.removeBills})
})

// the button property contains the string that will be displayed in the inline keyboard
// the path property contains the name of the folder where the files will be saved
const billsTypes = [
    {button: 'Light', path: ''},
    ...
] // insert all bill types

function getFileNames(pathName) {
    let fileNames = fs.readdirSync(`./bills/${pathName}`)
    let arr = []

    fileNames.forEach(fileName => {
        arr.push(fileName)
    })

    return arr
}

function removeBillsInlineKeyboard(pathName) {
    let arr = [
        [
            {text: '<<', callback_data: 'returnRemoveBills'}
        ]
    ]

    getFileNames(pathName).forEach(fileName => {
        arr.push([{text: fileName, callback_data: `remove${fileName}`}])
    })

    return arr
}

function showBillsInlineKeyboard(pathName) {
    let arr = [
        [
            {text: '<<', callback_data: 'returnShowBills'}
        ]
    ]

    getFileNames(pathName).forEach(fileName => {
        arr.push([{text: fileName, callback_data: `show${fileName}`}])
    })

    return arr
}

function billsFunc() {
    for (let i = 0; i < billsTypes.length; i++) {
        getFileNames(billsTypes[i].path).forEach(fileName => {
            bot.action(`remove${fileName}`, (ctx) => {
                state = `remove${fileName}`
                globalFileName = fileName
                ctx.answerCbQuery()
                ctx.editMessageReplyMarkup(inlineKeyboards.sureRemoveBill)
            })

            bot.action(`show${fileName}`, (ctx) => {
                state = `show${fileName}`
                ctx.answerCbQuery()
                ctx.replyWithDocument({source: `./bills/${globalFolderName}/${fileName}`})
            })
        })
    
        bot.action(`add${billsTypes[i].button}`, (ctx) => {
            state = `add${billsTypes[i].button}`
            globalFolderName = billsTypes[i].path
            ctx.answerCbQuery()
            ctx.reply('Invia il file:')
        })
    
        bot.action(`remove${billsTypes[i].button}`, (ctx) => {
            state = `remove${billsTypes[i].button}`
            globalFolderName = billsTypes[i].path
            ctx.answerCbQuery()
            ctx.editMessageReplyMarkup({inline_keyboard: removeBillsInlineKeyboard(billTypes[i].path)})
        })

        bot.action(`show${billsTypes[i].english}`, (ctx) => {
            state = `show${billsTypes[i].english}`
            globalFolderName = billsTypes[i].other
            ctx.answerCbQuery()
            ctx.editMessageReplyMarkup({inline_keyboard: showBillsInlineKeyboard(billTypes[i].other)})
        })
    }
}

bot.action('yesRemoveBill', (ctx) => {
    state = 'yesRemoveBill'
    fs.unlinkSync(`./bills/${globalFolderName}/${globalFileName}`)
    ctx.answerCbQuery()
    ctx.reply('File deleted')
    ctx.editMessageReplyMarkup({inline_keyboard: removeBillsInlineKeyboard(globalFolderName)})
})

bot.action('noRemoveBill', (ctx) => {
    state = 'noRemoveBill'
    ctx.answerCbQuery()
    ctx.editMessageReplyMarkup({inline_keyboard: removeBillsInlineKeyboard(globalFolderName)})
})

bot.action('showBills', (ctx) => {
    state = 'showBills'
    ctx.answerCbQuery()
    ctx.editMessageText('Show bills', {reply_markup: inlineKeyboards.showBills})
})

billsFunc()
bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
