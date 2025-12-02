 {
... // Archivo: mqtt_subscriber.js
... 
... // 1. Importa la librería MQTT
... const mqtt = require('mqtt');
... 
... // 2. Configuración del Broker
... // Usamos el mismo broker y puerto que el ESP32
... const brokerUrl = 'mqtt://broker.hivemq.com:1883'; 
... 
... // 3. Tópico al que el ESP32 está publicando
... const topic = 'ESP32_SIM7600_SENSOR_DATA';
... 
... // 4. Conectar al Broker
... const client = mqtt.connect(brokerUrl);
... 
... client.on('connect', () => {
...     console.log('✅ Conectado al broker MQTT: ' + brokerUrl);
...     
...     // 5. Suscribirse al tópico para empezar a recibir mensajes
...     client.subscribe(topic, (err) => {
...         if (!err) {
...             console.log(`✅ Suscrito al tópico: ${topic}. Esperando datos...`);
...         } else {
...             console.error('❌ Error al suscribirse:', err);
...         }
...     });
... });
... 
... client.on('error', (error) => {
...     console.error('❌ Error de conexión MQTT:', error);
... });
... 
... client.on('message', (receivedTopic, message) => {
...     // 6. Al recibir un mensaje, lo mostramos en la consola
...     if (receivedTopic === topic) {
...         try {
...             const payload = JSON.parse(message.toString());
            
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

// Manejo de desconexión
client.on('close', () => {
    console.log('⚠️ Desconectado del servidor.');
