module.exports = {
    setApiKey(key) {
        console.debug('Test Sendgrid key:', key)
    },
    async send(payload) {
        console.debug('Payload should be sent to Sendgrid.', payload)
        return true
    }
}