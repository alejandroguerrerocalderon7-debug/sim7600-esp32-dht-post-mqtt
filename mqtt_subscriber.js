// 1. Importa la librería MQTT
const mqtt = require('mqtt');

// 2. Configuración del Broker
const brokerUrl = 'mqtt://broker.hivemq.com:1883'; 
const topic = 'ESP32_SIM7600_SENSOR_DATA';

// 3. Conectar al Broker
const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
    console.log('✅ Conectado al broker MQTT: ' + brokerUrl);
    
    // 4. Suscribirse al tópico
    client.subscribe(topic, (err) => {
        if (!err) {
            console.log(`✅ Suscrito al tópico: ${topic}. Esperando datos...`);
        } else {
            console.error('❌ Error al suscribirse:', err);
        }
    });
});

client.on('error', (error) => {
    console.error('❌ Error de conexión MQTT:', error);
});

client.on('message', (receivedTopic, message) => {
    // 5. Al recibir un mensaje, lo mostramos
    if (receivedTopic === topic) {
        try {
            const payload = JSON.parse(message.toString());
            
            console.log('\n================================================');
            console.log(`DATOS RECIBIDOS desde ${receivedTopic}:`);
            console.log(JSON.stringify(payload, null, 2));
            console.log('================================================');

        } catch (e) {
            console.error('❌ Error al parsear JSON:', e);
            console.log('Mensaje crudo:', message.toString());
        }
    }
});

client.on('close', () => {
    console.log('⚠️ Desconectado del servidor.');
});
