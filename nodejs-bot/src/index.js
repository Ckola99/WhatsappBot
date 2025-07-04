const app = require('./app');
const { startWhatsAppBot } = require("./whatsapp");

startWhatsAppBot();
app.listen(3000, () => console.log('Node app listening on port 3000'));
