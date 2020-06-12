const sgMail = require('@sendgrid/mail')

const from = process.env.FROM_EMAIL_ADDRESS
sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

const sendAccountCreatedEmailNotification = (to, name) => {
    const subject = 'Welcome to our application'
    const text = `Dear ${name}, Your account created successfully. Welcome to our startup project.`
    sgMail.send({
        from,
        to,
        subject,
        text
    }).then( () => {
        console.log('Notification: Your account created')
    }).catch( (err) => {
        console.error(err)
        if(err.response){
            console.error(err.response.body)
        }
    })
}

const sendAccountUpdatedEmailNotification = (to, name) => {
    const subject = 'Your account has been updated'
    const text = `Dear ${name}, your account has been updated recently. Please ignore this email if you did changes, otherwise login and check your account.`
    sgMail.send({
        from,
        to,
        subject,
        text
    }).then( () => {
        console.log('Notification: Your account updated')
    }).catch( (err) => {
        console.error(err)
        if(err.response){
            console.error(err.response.body)
        }
    })
}

const sendAccountRemovedEmailNotification = (to, name) => {
    const subject = 'We are so sorry to now about it'
    const text = `Dear ${name}, We are so sorry to hear about that. Please let us know if we can help you.`
    sgMail.send({
        from,
        to,
        subject,
        text
    }).then( () => {
        console.log('Notification: Your account removed')
    }).catch( (err) => {
        console.error(err)
        if(err.response){
            console.error(err.response.body)
        }
    })
}


module.exports = {
    sendAccountCreatedEmailNotification,
    sendAccountUpdatedEmailNotification,
    sendAccountRemovedEmailNotification
}